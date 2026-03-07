import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import TopBar from './components/TopBar';
import MenuInputPanel from './components/MenuInputPanel';
import PageSettingsPanel from './components/PageSettingsPanel';
import StylePanel from './components/StylePanel';
import PreviewPanel from './components/PreviewPanel';
import TemplateGalleryPanel from './components/TemplateGalleryPanel';
import IconLibraryPanel from './components/IconLibraryPanel';
import ElementsPanel from './components/ElementsPanel';
import PropertiesPanel from './components/PropertiesPanel';
import {
  BACKGROUND_STYLES,
  DEFAULT_FONT_STYLES,
  DEFAULT_MENU_TEXT,
  DENSITY_MODES,
  FONT_FAMILIES,
  FONT_WEIGHTS,
  STYLE_PRESETS,
  THEME_PRESETS,
  getPageDimensions,
  getSpacingDefaults,
  getTypographyDefaults
} from './data/config';
import { ICON_LIBRARY, ELEMENT_LIBRARY } from './data/designAssets';
import { parseMenuText, applyManualOverrides } from './utils/menuParser';
import { exportAsPdf, exportAsPptx, exportAsSvg } from './utils/exporters';
import { generateDemoMenu } from './utils/randomMenu';
import { computeMenuLayout, generateSvgMarkup } from './engine/layoutGenerator';

const TEMPLATE_FILES = [
  'classic-restaurant',
  'modern-minimal',
  'luxury-fine-dining',
  'cafe-menu',
  'street-food-menu',
  'bar-menu'
];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumberOr(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function getPointFromActivator(event) {
  if (!event) {
    return null;
  }

  if ('clientX' in event && 'clientY' in event) {
    return { x: event.clientX, y: event.clientY };
  }

  if ('touches' in event && event.touches[0]) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  return null;
}

export default function App() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic-restaurant');

  const [menuTitle, setMenuTitle] = useState('Smart Menu Designer');
  const [menuText, setMenuText] = useState(DEFAULT_MENU_TEXT);

  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [columns, setColumns] = useState(2);

  const [typography, setTypography] = useState(() => getTypographyDefaults('A4'));
  const [spacing, setSpacing] = useState(() => getSpacingDefaults('A4', 2));
  const [densityMode, setDensityMode] = useState('normal');

  const [menuShape, setMenuShape] = useState('rounded');
  const [borderRadius, setBorderRadius] = useState(22);

  const [styleKey, setStyleKey] = useState('classic');
  const [generatedStyles, setGeneratedStyles] = useState([
    'classic',
    'modernMinimal',
    'premiumFineDining'
  ]);

  const [themeKey, setThemeKey] = useState(STYLE_PRESETS.classic.defaultTheme);
  const [useCustomTheme, setUseCustomTheme] = useState(false);
  const [customTheme, setCustomTheme] = useState(THEME_PRESETS.minimalBlack);

  const [fontStyles, setFontStyles] = useState(DEFAULT_FONT_STYLES);
  const [backgroundStyle, setBackgroundStyle] = useState('plainWhite');

  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [logoSize, setLogoSize] = useState(80);

  const [manualTypes, setManualTypes] = useState({});
  const [sectionOrder, setSectionOrder] = useState([]);

  const [placedElements, setPlacedElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [canvasMetrics, setCanvasMetrics] = useState(null);

  const previewRef = useRef(null);

  useEffect(() => {
    Promise.all(
      TEMPLATE_FILES.map((file) => fetch(`/templates/${file}.json`).then((response) => response.json()))
    )
      .then((data) => setTemplates(data))
      .catch(() => setTemplates([]));
  }, []);

  useEffect(() => {
    setTypography(getTypographyDefaults(pageSize));
    setSpacing(getSpacingDefaults(pageSize, columns));
  }, [pageSize, columns]);

  useEffect(() => {
    if (!useCustomTheme) {
      setThemeKey(STYLE_PRESETS[styleKey]?.defaultTheme || 'minimalBlack');
    }
  }, [styleKey, useCustomTheme]);

  const parsedMenu = useMemo(() => parseMenuText(menuText), [menuText]);

  useEffect(() => {
    const ids = parsedMenu.categories.map((category) => category.id);
    setSectionOrder((prev) => {
      const kept = prev.filter((id) => ids.includes(id));
      const appended = ids.filter((id) => !kept.includes(id));
      return [...kept, ...appended];
    });
  }, [parsedMenu.categories]);

  const menuData = useMemo(
    () => applyManualOverrides(parsedMenu, manualTypes),
    [parsedMenu, manualTypes]
  );

  const orderedMenuData = useMemo(() => {
    if (sectionOrder.length === 0) {
      return menuData;
    }

    const map = new Map(menuData.categories.map((category) => [category.id, category]));
    const ordered = sectionOrder.map((id) => map.get(id)).filter(Boolean);
    const leftovers = menuData.categories.filter((category) => !sectionOrder.includes(category.id));

    return {
      categories: [...ordered, ...leftovers]
    };
  }, [menuData, sectionOrder]);

  const page = useMemo(() => getPageDimensions(pageSize, orientation), [pageSize, orientation]);
  const stylePreset = STYLE_PRESETS[styleKey] || STYLE_PRESETS.classic;

  const activeTheme = useMemo(
    () => (useCustomTheme ? customTheme : THEME_PRESETS[themeKey] || THEME_PRESETS.minimalBlack),
    [customTheme, themeKey, useCustomTheme]
  );

  const layout = useMemo(
    () =>
      computeMenuLayout({
        menu: orderedMenuData,
        page,
        columns,
        typography,
        spacing,
        radius: menuShape === 'rounded' ? borderRadius : 0,
        densityMode,
        template: stylePreset,
        hasLogo: Boolean(logoDataUrl),
        logoSize
      }),
    [
      orderedMenuData,
      page,
      columns,
      typography,
      spacing,
      menuShape,
      borderRadius,
      densityMode,
      stylePreset,
      logoDataUrl,
      logoSize
    ]
  );

  const svgMarkup = useMemo(
    () =>
      generateSvgMarkup({
        layout,
        page,
        menuTitle,
        stylePreset,
        theme: activeTheme,
        fontStyles,
        logoDataUrl,
        backgroundStyle,
        placedElements
      }),
    [
      layout,
      page,
      menuTitle,
      stylePreset,
      activeTheme,
      fontStyles,
      logoDataUrl,
      backgroundStyle,
      placedElements
    ]
  );

  const selectedElement = useMemo(
    () => placedElements.find((element) => element.id === selectedElementId) || null,
    [placedElements, selectedElementId]
  );

  function handleGenerateDesign() {
    const picks = shuffle(Object.keys(STYLE_PRESETS)).slice(0, 3);
    setGeneratedStyles(picks);
    setStyleKey(picks[0]);
    setThemeKey(STYLE_PRESETS[picks[0]].defaultTheme);
    setUseCustomTheme(false);
  }

  function handleGenerateDemoMenu() {
    const demo = generateDemoMenu();
    setMenuTitle(demo.title);
    setMenuText(demo.text);
    setManualTypes({});
  }

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result ? String(reader.result) : '');
    };
    reader.readAsDataURL(file);
  }

  function applyTemplate(template) {
    setSelectedTemplateId(template.id);

    if (template.styleKey && STYLE_PRESETS[template.styleKey]) {
      setStyleKey(template.styleKey);
    }

    if (template.themeKey && THEME_PRESETS[template.themeKey]) {
      setThemeKey(template.themeKey);
      setUseCustomTheme(false);
    }

    if (template.backgroundStyle) {
      setBackgroundStyle(template.backgroundStyle);
    }

    if (template.densityMode) {
      setDensityMode(template.densityMode);
    }

    if (template.typography) {
      setTypography((prev) => ({ ...prev, ...template.typography }));
    }

    if (template.spacing) {
      setSpacing((prev) => ({ ...prev, ...template.spacing }));
    }

    if (template.fontStyles) {
      setFontStyles((prev) => ({ ...prev, ...template.fontStyles }));
    }
  }

  const updateCanvasMetrics = useCallback((metrics) => {
    setCanvasMetrics(metrics);
  }, []);

  function toGrid(value, size = 20) {
    return snapToGrid ? Math.round(value / size) * size : value;
  }

  function addPlacedAsset(asset, point) {
    if (!canvasMetrics) {
      return;
    }

    const x = (point.x - canvasMetrics.left) / canvasMetrics.scaleX - asset.width / 2;
    const y = (point.y - canvasMetrics.top) / canvasMetrics.scaleY - asset.height / 2;

    const element = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      library: asset.library,
      assetId: asset.assetId,
      name: asset.name,
      elementType: asset.elementType,
      x: clamp(toGrid(x), 0, page.width - asset.width),
      y: clamp(toGrid(y), 0, page.height - asset.height),
      width: asset.width,
      height: asset.height,
      rotation: asset.rotation || 0,
      color: asset.color || '#111827',
      opacity: asset.opacity ?? 1,
      layer: asset.layer || 'above'
    };

    setPlacedElements((prev) => [...prev, element]);
    setSelectedElementId(element.id);
  }

  function moveCanvasElement(elementId, delta) {
    if (!canvasMetrics) {
      return;
    }

    const deltaX = delta.x / canvasMetrics.scaleX;
    const deltaY = delta.y / canvasMetrics.scaleY;

    setPlacedElements((prev) =>
      prev.map((element) => {
        if (element.id !== elementId) {
          return element;
        }

        const x = clamp(toGrid(element.x + deltaX), 0, page.width - element.width);
        const y = clamp(toGrid(element.y + deltaY), 0, page.height - element.height);

        return {
          ...element,
          x,
          y
        };
      })
    );
  }

  function handleDragEnd(event) {
    const { active, over, delta } = event;
    const data = active.data.current;

    if (!data) {
      return;
    }

    if (data.kind === 'library-asset' && over?.id === 'preview-canvas') {
      const initialRect = active.rect.current.initial;
      const translatedRect = active.rect.current.translated;
      const point =
        (initialRect && {
          x: initialRect.left + delta.x + initialRect.width / 2,
          y: initialRect.top + delta.y + initialRect.height / 2
        }) ||
        (translatedRect && {
          x: translatedRect.left + translatedRect.width / 2,
          y: translatedRect.top + translatedRect.height / 2
        }) ||
        getPointFromActivator(event.activatorEvent) || {
          x: over.rect.left + over.rect.width / 2,
          y: over.rect.top + over.rect.height / 2
        };

      addPlacedAsset(data.asset, point);
      return;
    }

    if (data.kind === 'canvas-element' && over?.id === 'preview-canvas') {
      moveCanvasElement(data.elementId, delta);
    }
  }

  function getSvgElement() {
    return previewRef.current?.querySelector('svg') || null;
  }

  function withSvg(action) {
    const svgElement = getSvgElement();
    if (!svgElement) {
      return;
    }

    action(svgElement).catch((error) => {
      console.error(error);
      window.alert('Export failed. Please try again.');
    });
  }

  function handleDownloadSvg() {
    withSvg(async (svgElement) => {
      exportAsSvg(svgElement, 'smart-menu.svg');
    });
  }

  function handleDownloadPdf() {
    withSvg(async (svgElement) => {
      await exportAsPdf(svgElement, page, 'smart-menu.pdf');
    });
  }

  function handleDownloadPptx() {
    withSvg(async (svgElement) => {
      await exportAsPptx(svgElement, page, 'smart-menu.pptx');
    });
  }

  function updateSelectedElement(patch) {
    if (!selectedElementId) {
      return;
    }

    setPlacedElements((prev) =>
      prev.map((element) => {
        if (element.id !== selectedElementId) {
          return element;
        }

        const next = { ...element, ...patch };
        const width = clamp(toNumberOr(next.width, element.width), 8, page.width);
        const height = clamp(toNumberOr(next.height, element.height), 8, page.height);

        return {
          ...next,
          width,
          height,
          x: clamp(toNumberOr(next.x, element.x), 0, page.width - width),
          y: clamp(toNumberOr(next.y, element.y), 0, page.height - height),
          rotation: clamp(toNumberOr(next.rotation, element.rotation), -180, 180),
          opacity: clamp(toNumberOr(next.opacity, element.opacity), 0.1, 1)
        };
      })
    );
  }

  function deleteSelectedElement() {
    if (!selectedElementId) {
      return;
    }

    setPlacedElements((prev) => prev.filter((element) => element.id !== selectedElementId));
    setSelectedElementId(null);
  }

  function moveLayer(direction) {
    if (!selectedElementId) {
      return;
    }

    setPlacedElements((prev) => {
      const index = prev.findIndex((element) => element.id === selectedElementId);
      if (index < 0) {
        return prev;
      }

      const targetLayer = prev[index].layer;
      const layerIndexes = prev
        .map((element, idx) => ({ idx, layer: element.layer }))
        .filter((item) => item.layer === targetLayer)
        .map((item) => item.idx);

      const positionInLayer = layerIndexes.indexOf(index);
      const swapWithLayerPosition = direction === 'forward' ? positionInLayer + 1 : positionInLayer - 1;
      if (swapWithLayerPosition < 0 || swapWithLayerPosition >= layerIndexes.length) {
        return prev;
      }

      const swapIndex = layerIndexes[swapWithLayerPosition];
      const next = [...prev];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-screen flex-col bg-stone-100">
        <TopBar
          onGenerateDesign={handleGenerateDesign}
          onDownloadSvg={handleDownloadSvg}
          onDownloadPptx={handleDownloadPptx}
          onDownloadPdf={handleDownloadPdf}
        />

        <div className="flex min-h-0 flex-1">
          <aside className="w-[430px] shrink-0 space-y-3 overflow-y-auto border-r border-stone-300 bg-stone-50 p-3">
            <TemplateGalleryPanel
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={applyTemplate}
            />

            <IconLibraryPanel icons={ICON_LIBRARY} />
            <ElementsPanel elements={ELEMENT_LIBRARY} />

            <MenuInputPanel
              menuTitle={menuTitle}
              setMenuTitle={setMenuTitle}
              menuText={menuText}
              setMenuText={setMenuText}
              parsedMenu={parsedMenu}
              manualTypes={manualTypes}
              setManualTypes={setManualTypes}
              onGenerateDemo={handleGenerateDemoMenu}
              sectionOrder={sectionOrder}
              setSectionOrder={setSectionOrder}
            />

            <PageSettingsPanel
              pageSize={pageSize}
              setPageSize={setPageSize}
              orientation={orientation}
              setOrientation={setOrientation}
              columns={columns}
              setColumns={setColumns}
            />

            <StylePanel
              typography={typography}
              setTypography={setTypography}
              spacing={spacing}
              setSpacing={setSpacing}
              densityMode={densityMode}
              setDensityMode={setDensityMode}
              densityModes={DENSITY_MODES}
              menuShape={menuShape}
              setMenuShape={setMenuShape}
              borderRadius={borderRadius}
              setBorderRadius={setBorderRadius}
              styleKey={styleKey}
              setStyleKey={setStyleKey}
              stylePresets={STYLE_PRESETS}
              generatedStyles={generatedStyles}
              themeKey={themeKey}
              setThemeKey={setThemeKey}
              themePresets={THEME_PRESETS}
              useCustomTheme={useCustomTheme}
              setUseCustomTheme={setUseCustomTheme}
              customTheme={customTheme}
              setCustomTheme={setCustomTheme}
              fontStyles={fontStyles}
              setFontStyles={setFontStyles}
              fontFamilies={FONT_FAMILIES}
              fontWeights={FONT_WEIGHTS}
              backgroundStyle={backgroundStyle}
              setBackgroundStyle={setBackgroundStyle}
              backgroundStyles={BACKGROUND_STYLES}
              logoDataUrl={logoDataUrl}
              logoSize={logoSize}
              setLogoSize={setLogoSize}
              onLogoUpload={handleLogoUpload}
            />
          </aside>

          <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-gradient-to-br from-stone-200 via-amber-50 to-stone-300 p-6">
            <PreviewPanel
              ref={previewRef}
              svgMarkup={svgMarkup}
              page={page}
              placedElements={placedElements}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onCanvasMetrics={updateCanvasMetrics}
              snapToGrid={snapToGrid}
            />

            {layout?.overflow && (
              <p className="mx-auto mt-3 max-w-xl rounded-md bg-amber-100 px-3 py-2 text-center text-xs text-amber-900">
                Content is dense for the selected page. Smart layout reduced spacing and typography to avoid overflow.
              </p>
            )}
          </main>

          <PropertiesPanel
            selectedElement={selectedElement}
            onChange={updateSelectedElement}
            onDelete={deleteSelectedElement}
            onBringForward={() => moveLayer('forward')}
            onSendBackward={() => moveLayer('backward')}
            snapToGrid={snapToGrid}
            setSnapToGrid={setSnapToGrid}
          />
        </div>
      </div>
    </DndContext>
  );
}


