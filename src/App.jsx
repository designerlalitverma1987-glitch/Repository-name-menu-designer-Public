import { useEffect, useMemo, useRef, useState } from 'react';
import TopBar from './components/TopBar';
import MenuInputPanel from './components/MenuInputPanel';
import PageSettingsPanel from './components/PageSettingsPanel';
import StylePanel from './components/StylePanel';
import PreviewPanel from './components/PreviewPanel';
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
import { parseMenuText, applyManualOverrides } from './utils/menuParser';
import { exportAsPdf, exportAsPptx, exportAsSvg } from './utils/exporters';
import { generateDemoMenu } from './utils/randomMenu';
import { computeMenuLayout, generateSvgMarkup } from './engine/layoutGenerator';

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function App() {
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

  const previewRef = useRef(null);

  useEffect(() => {
    setTypography(getTypographyDefaults(pageSize));
    setSpacing(getSpacingDefaults(pageSize, columns));
  }, [pageSize, columns]);

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
  const stylePreset = STYLE_PRESETS[styleKey];

  const activeTheme = useMemo(
    () => (useCustomTheme ? customTheme : THEME_PRESETS[themeKey]),
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
        backgroundStyle
      }),
    [
      layout,
      page,
      menuTitle,
      stylePreset,
      activeTheme,
      fontStyles,
      logoDataUrl,
      backgroundStyle
    ]
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

  return (
    <div className="flex h-screen flex-col bg-stone-100">
      <TopBar
        onGenerateDesign={handleGenerateDesign}
        onDownloadSvg={handleDownloadSvg}
        onDownloadPptx={handleDownloadPptx}
        onDownloadPdf={handleDownloadPdf}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="w-[390px] shrink-0 space-y-3 overflow-y-auto border-r border-stone-300 bg-stone-50 p-3">
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

        <main className="flex-1 overflow-auto bg-gradient-to-br from-stone-200 via-amber-50 to-stone-300 p-6">
          <PreviewPanel ref={previewRef} svgMarkup={svgMarkup} />

          {layout?.overflow && (
            <p className="mx-auto mt-3 max-w-xl rounded-md bg-amber-100 px-3 py-2 text-center text-xs text-amber-900">
              Content is dense for the selected page. Smart layout reduced spacing and typography to avoid overflow.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
