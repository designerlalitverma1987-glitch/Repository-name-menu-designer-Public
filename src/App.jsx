
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fabric } from 'fabric';
import EditorToolbar from './components/EditorToolbar';
import AccordionSidebar from './components/AccordionSidebar';
import FabricCanvasPanel from './components/FabricCanvasPanel';
import FabricPropertiesPanel from './components/FabricPropertiesPanel';
import { BACKGROUND_STYLES, DEFAULT_MENU_TEXT, FONT_FAMILIES, FONT_WEIGHTS, getPageDimensions } from './data/config';
import { ICON_LIBRARY } from './data/designAssets';
import { generateAiMenu } from './utils/aiMenuGenerator';
import { exportAsPdf, exportAsPptx } from './utils/exporters';
import { applyManualOverrides, parseMenuText } from './utils/menuParser';
import {
  addImageToCanvas,
  addSvgStringAsObject,
  applyBackgroundStyle,
  autoArrangeMenuOnCanvas,
  clampToCanvasBounds,
  cloneActiveObject,
  createShapeObject,
  iconToSvgString,
  inferColumns
} from './utils/fabricHelpers';

const TEMPLATE_KEY = 'smart-menu-custom-templates';
const GRID_SIZE = 20;
const EXTRA_JSON_PROPS = ['data', 'selectable', 'evented', 'name'];

const BUILTIN_TEMPLATES = [
  {
    id: 'classic-restaurant',
    name: 'Classic Restaurant',
    builtIn: true,
    settings: {
      layoutMode: 'two',
      backgroundStyle: 'plainWhite',
      typography: {
        titleFont: 'Playfair Display',
        sectionFont: 'Playfair Display',
        itemFont: 'Lora',
        descriptionFont: 'Lora',
        priceFont: 'Lora',
        titleWeight: 700,
        sectionWeight: 700,
        itemWeight: 600,
        descriptionWeight: 400,
        priceWeight: 700,
        titleSize: 36,
        sectionSize: 22,
        itemSize: 16,
        descriptionSize: 12,
        priceSize: 15,
        letterSpacing: 0.2,
        titleColor: '#1f2937',
        sectionColor: '#1f2937',
        itemColor: '#111827',
        priceColor: '#111827'
      }
    }
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    builtIn: true,
    settings: {
      layoutMode: 'three',
      backgroundStyle: 'plainWhite',
      typography: {
        titleFont: 'Montserrat',
        sectionFont: 'Montserrat',
        itemFont: 'Inter',
        descriptionFont: 'Inter',
        priceFont: 'Inter',
        titleWeight: 700,
        sectionWeight: 700,
        itemWeight: 600,
        descriptionWeight: 400,
        priceWeight: 700,
        titleSize: 34,
        sectionSize: 20,
        itemSize: 15,
        descriptionSize: 11,
        priceSize: 14,
        letterSpacing: 0.3,
        titleColor: '#0f172a',
        sectionColor: '#1e293b',
        itemColor: '#111827',
        priceColor: '#111827'
      }
    }
  },
  {
    id: 'luxury-fine-dining',
    name: 'Luxury Fine Dining',
    builtIn: true,
    settings: {
      layoutMode: 'two',
      backgroundStyle: 'marbleTexture',
      typography: {
        titleFont: 'Libre Baskerville',
        sectionFont: 'Libre Baskerville',
        itemFont: 'Lora',
        descriptionFont: 'Lora',
        priceFont: 'Lora',
        titleWeight: 700,
        sectionWeight: 700,
        itemWeight: 600,
        descriptionWeight: 400,
        priceWeight: 700,
        titleSize: 38,
        sectionSize: 23,
        itemSize: 16,
        descriptionSize: 12,
        priceSize: 15,
        letterSpacing: 0.28,
        titleColor: '#9f7c2b',
        sectionColor: '#9f7c2b',
        itemColor: '#1f2937',
        priceColor: '#9f7c2b'
      }
    }
  },
  {
    id: 'cafe-menu',
    name: 'Cafe Menu',
    builtIn: true,
    settings: {
      layoutMode: 'two',
      backgroundStyle: 'paperTexture',
      typography: {
        titleFont: 'Poppins',
        sectionFont: 'Poppins',
        itemFont: 'DM Sans',
        descriptionFont: 'DM Sans',
        priceFont: 'DM Sans',
        titleWeight: 700,
        sectionWeight: 700,
        itemWeight: 600,
        descriptionWeight: 400,
        priceWeight: 700,
        titleSize: 34,
        sectionSize: 21,
        itemSize: 15,
        descriptionSize: 12,
        priceSize: 15,
        letterSpacing: 0.2,
        titleColor: '#7b3f00',
        sectionColor: '#a55d31',
        itemColor: '#3c2a1e',
        priceColor: '#7b3f00'
      }
    }
  },
  {
    id: 'street-food-menu',
    name: 'Street Food Menu',
    builtIn: true,
    settings: {
      layoutMode: 'grid',
      backgroundStyle: 'woodTexture',
      typography: {
        titleFont: 'Poppins',
        sectionFont: 'Poppins',
        itemFont: 'Open Sans',
        descriptionFont: 'Open Sans',
        priceFont: 'Open Sans',
        titleWeight: 700,
        sectionWeight: 700,
        itemWeight: 700,
        descriptionWeight: 400,
        priceWeight: 700,
        titleSize: 35,
        sectionSize: 20,
        itemSize: 15,
        descriptionSize: 11,
        priceSize: 14,
        letterSpacing: 0.3,
        titleColor: '#fde68a',
        sectionColor: '#f59e0b',
        itemColor: '#fef3c7',
        priceColor: '#fde68a'
      }
    }
  },
  {
    id: 'bar-menu',
    name: 'Bar Menu',
    builtIn: true,
    settings: {
      layoutMode: 'two',
      backgroundStyle: 'darkTheme',
      typography: {
        titleFont: 'Montserrat',
        sectionFont: 'Montserrat',
        itemFont: 'Inter',
        descriptionFont: 'Inter',
        priceFont: 'Inter',
        titleWeight: 700,
        sectionWeight: 700,
        itemWeight: 600,
        descriptionWeight: 400,
        priceWeight: 700,
        titleSize: 34,
        sectionSize: 20,
        itemSize: 15,
        descriptionSize: 11,
        priceSize: 14,
        letterSpacing: 0.3,
        titleColor: '#fb923c',
        sectionColor: '#fdba74',
        itemColor: '#f4f4f5',
        priceColor: '#fdba74'
      }
    }
  }
];

function createDefaultTypography() {
  return {
    titleFont: 'Playfair Display',
    sectionFont: 'Playfair Display',
    itemFont: 'DM Sans',
    descriptionFont: 'DM Sans',
    priceFont: 'DM Sans',
    titleWeight: 700,
    sectionWeight: 700,
    itemWeight: 700,
    descriptionWeight: 400,
    priceWeight: 700,
    titleSize: 34,
    sectionSize: 22,
    itemSize: 16,
    descriptionSize: 12,
    priceSize: 15,
    letterSpacing: 0.15,
    titleColor: '#1f2937',
    sectionColor: '#1f2937',
    itemColor: '#111827',
    priceColor: '#111827'
  };
}

function loadCustomTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function makePage(id, name, backgroundStyle = 'plainWhite') {
  return { id, name, backgroundStyle, json: null, logoDataUrl: '' };
}

function ensureOrder(categories, previousOrder) {
  const ids = categories.map((category) => category.id);
  const kept = previousOrder.filter((id) => ids.includes(id));
  const appended = ids.filter((id) => !kept.includes(id));
  return [...kept, ...appended];
}

function buildSvgElementFromString(svg) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  return doc.documentElement;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function objectColor(object) {
  if (!object) return '#111827';
  if (typeof object.fill === 'string' && object.fill !== 'transparent') return object.fill;
  if (typeof object.stroke === 'string') return object.stroke;
  return '#111827';
}

function updateObjectColor(object, color) {
  if (!object) return;

  if (object.type === 'group' && Array.isArray(object._objects)) {
    object._objects.forEach((item) => {
      if (item.fill && item.fill !== 'transparent') item.set('fill', color);
      if (item.stroke) item.set('stroke', color);
    });
    return;
  }

  if (object.fill && object.fill !== 'transparent') object.set('fill', color);
  if (object.stroke) object.set('stroke', color);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function menuSizeToCount(size) {
  if (size === 'small') return 12;
  if (size === 'large') return 24;
  return 18;
}

export default function App() {
  const canvasDomRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const fabricRef = useRef(null);
  const isApplyingRef = useRef(false);
  const activePageIdRef = useRef('page-1');
  const historyRef = useRef({});

  const [openPanel, setOpenPanel] = useState('menu');
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const page = useMemo(() => getPageDimensions(pageSize, orientation), [pageSize, orientation]);

  const [pages, setPages] = useState([makePage('page-1', 'Page 1')]);
  const [activePageId, setActivePageId] = useState('page-1');

  const [menuTitle, setMenuTitle] = useState('Smart Menu Designer');
  const [menuText, setMenuText] = useState(DEFAULT_MENU_TEXT);
  const [manualTypes, setManualTypes] = useState({});
  const [sectionOrder, setSectionOrder] = useState([]);
  const [sectionColumns, setSectionColumns] = useState({});

  const [layoutMode, setLayoutMode] = useState('auto');
  const [typography, setTypography] = useState(createDefaultTypography);
  const [backgroundStyle, setBackgroundStyle] = useState('plainWhite');
  const [snapToGrid, setSnapToGrid] = useState(false);

  const [selectedObject, setSelectedObject] = useState(null);
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [logoSize, setLogoSize] = useState(90);

  const [templates, setTemplates] = useState(() => [...BUILTIN_TEMPLATES, ...loadCustomTemplates()]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [customIcons, setCustomIcons] = useState([]);

  const [aiRestaurantType, setAiRestaurantType] = useState('restaurant');
  const [aiMenuSize, setAiMenuSize] = useState('medium');
  const [aiCuisineStyle, setAiCuisineStyle] = useState('indian');
  const [aiDescriptions, setAiDescriptions] = useState(true);

  const parsedMenu = useMemo(() => parseMenuText(menuText), [menuText]);

  useEffect(() => {
    activePageIdRef.current = activePageId;
  }, [activePageId]);

  useEffect(() => {
    const ordered = ensureOrder(parsedMenu.categories, sectionOrder);
    setSectionOrder(ordered);
    setSectionColumns((prev) => {
      const next = {};
      ordered.forEach((id) => {
        next[id] = typeof prev[id] === 'number' ? prev[id] : 0;
      });
      return next;
    });
  }, [parsedMenu.categories]);

  const menuData = useMemo(() => applyManualOverrides(parsedMenu, manualTypes), [parsedMenu, manualTypes]);

  const orderedMenuData = useMemo(() => {
    const map = new Map(menuData.categories.map((category) => [category.id, category]));
    const ordered = sectionOrder.map((id) => map.get(id)).filter(Boolean);
    const remaining = menuData.categories.filter((category) => !sectionOrder.includes(category.id));
    return { categories: [...ordered, ...remaining] };
  }, [menuData.categories, sectionOrder]);

  const activePage = useMemo(() => pages.find((p) => p.id === activePageId) || pages[0], [pages, activePageId]);
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasDomRef.current, {
      width: page.width,
      height: page.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true
    });

    fabricRef.current = canvas;

    const syncSelection = () => {
      const active = canvas.getActiveObject();
      if (!active) {
        setSelectedObject(null);
        return;
      }

      setSelectedObject({
        id: active.__uid || active.data?.id || active.type,
        label: active.data?.label || active.type,
        left: active.left || 0,
        top: active.top || 0,
        width: active.getScaledWidth?.() || 0,
        height: active.getScaledHeight?.() || 0,
        angle: active.angle || 0,
        opacity: active.opacity ?? 1,
        color: objectColor(active)
      });
    };

    const commitHistory = () => {
      if (isApplyingRef.current) return;

      const pageId = activePageIdRef.current;
      const snapshot = JSON.stringify(canvas.toJSON(EXTRA_JSON_PROPS));
      const history = historyRef.current[pageId] || { undo: [], redo: [] };
      if (history.undo[history.undo.length - 1] !== snapshot) {
        history.undo.push(snapshot);
        if (history.undo.length > 80) history.undo.shift();
      }
      history.redo = [];
      historyRef.current[pageId] = history;

      setPages((prev) =>
        prev.map((pageItem) =>
          pageItem.id === pageId
            ? { ...pageItem, json: JSON.parse(snapshot), backgroundStyle, logoDataUrl }
            : pageItem
        )
      );
    };

    canvas.on('selection:created', syncSelection);
    canvas.on('selection:updated', syncSelection);
    canvas.on('selection:cleared', syncSelection);

    canvas.on('object:moving', (event) => {
      if (!event.target) return;

      if (snapToGrid) {
        event.target.set({
          left: Math.round((event.target.left || 0) / GRID_SIZE) * GRID_SIZE,
          top: Math.round((event.target.top || 0) / GRID_SIZE) * GRID_SIZE
        });
      }

      clampToCanvasBounds(event.target, canvas.getWidth(), canvas.getHeight());
    });

    canvas.on('object:modified', commitHistory);
    canvas.on('object:added', commitHistory);
    canvas.on('object:removed', commitHistory);

    historyRef.current[activePageIdRef.current] = {
      undo: [JSON.stringify(canvas.toJSON(EXTRA_JSON_PROPS))],
      redo: []
    };

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.setWidth(page.width);
    canvas.setHeight(page.height);
    applyBackgroundStyle(canvas, activePage?.backgroundStyle || backgroundStyle, page);
    canvas.requestRenderAll();
  }, [page.width, page.height, backgroundStyle, activePage?.backgroundStyle]);

  const loadPageToCanvas = useCallback(
    async (pageItem) => {
      const canvas = fabricRef.current;
      if (!canvas || !pageItem) return;

      isApplyingRef.current = true;
      canvas.discardActiveObject();
      canvas.clear();
      canvas.setWidth(page.width);
      canvas.setHeight(page.height);

      await new Promise((resolve) => {
        if (!pageItem.json) {
          resolve();
          return;
        }

        canvas.loadFromJSON(pageItem.json, () => {
          canvas.requestRenderAll();
          resolve();
        });
      });

      await applyBackgroundStyle(canvas, pageItem.backgroundStyle || backgroundStyle, page);
      canvas.requestRenderAll();
      setLogoDataUrl(pageItem.logoDataUrl || '');

      const snapshot = JSON.stringify(canvas.toJSON(EXTRA_JSON_PROPS));
      if (!historyRef.current[pageItem.id]) {
        historyRef.current[pageItem.id] = { undo: [snapshot], redo: [] };
      }

      isApplyingRef.current = false;
      setSelectedObject(null);
    },
    [backgroundStyle, page.height, page.width]
  );

  useEffect(() => {
    if (activePage) loadPageToCanvas(activePage);
  }, [activePageId, activePage?.id, loadPageToCanvas]);

  useEffect(() => {
    const custom = templates.filter((template) => !template.builtIn);
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(custom));
  }, [templates]);

  const addTextObject = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const text = new fabric.Textbox('New Text', {
      left: 120,
      top: 120,
      width: 260,
      fontFamily: typography.itemFont,
      fontSize: typography.itemSize,
      fontWeight: typography.itemWeight,
      fill: typography.itemColor,
      charSpacing: typography.letterSpacing * 50,
      data: { label: 'Text' }
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  }, [typography]);

  const applyTemplate = useCallback(
    async (template) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      if (template.settings) {
        if (template.settings.typography) setTypography((prev) => ({ ...prev, ...template.settings.typography }));
        if (template.settings.layoutMode) setLayoutMode(template.settings.layoutMode);
        if (template.settings.backgroundStyle) {
          setBackgroundStyle(template.settings.backgroundStyle);
          setPages((prev) =>
            prev.map((pageItem) =>
              pageItem.id === activePageId
                ? { ...pageItem, backgroundStyle: template.settings.backgroundStyle }
                : pageItem
            )
          );
          await applyBackgroundStyle(canvas, template.settings.backgroundStyle, page);
        }

        autoArrangeMenuOnCanvas({
          canvas,
          menuTitle,
          menu: orderedMenuData,
          page,
          layoutMode: template.settings.layoutMode || layoutMode,
          categoryColumns: sectionColumns,
          typography: template.settings.typography || typography,
          keepExisting: true
        });
        return;
      }

      if (template.canvasJson) {
        setPages((prev) =>
          prev.map((pageItem) =>
            pageItem.id === activePageId ? { ...pageItem, json: template.canvasJson } : pageItem
          )
        );
        await loadPageToCanvas({
          ...activePage,
          json: template.canvasJson,
          backgroundStyle: template.backgroundStyle || activePage.backgroundStyle,
          logoDataUrl: template.logoDataUrl || activePage.logoDataUrl
        });
      }
    },
    [
      activePage,
      activePageId,
      layoutMode,
      loadPageToCanvas,
      menuTitle,
      orderedMenuData,
      page,
      sectionColumns,
      typography
    ]
  );

  const saveTemplate = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const name = newTemplateName.trim();
    if (!name) {
      window.alert('Enter a template name first.');
      return;
    }

    const template = {
      id: `custom-${Date.now()}`,
      name,
      builtIn: false,
      canvasJson: canvas.toJSON(EXTRA_JSON_PROPS),
      backgroundStyle,
      logoDataUrl
    };

    setTemplates((prev) => [...prev, template]);
    setNewTemplateName('');
  }, [newTemplateName, backgroundStyle, logoDataUrl]);

  const deleteTemplate = useCallback((templateId) => {
    setTemplates((prev) => prev.filter((template) => template.id !== templateId || template.builtIn));
  }, []);

  const performUndo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const history = historyRef.current[activePageId];
    if (!history || history.undo.length <= 1) return;

    const current = history.undo.pop();
    history.redo.push(current);
    const previous = history.undo[history.undo.length - 1];

    isApplyingRef.current = true;
    canvas.loadFromJSON(JSON.parse(previous), () => {
      applyBackgroundStyle(canvas, activePage?.backgroundStyle || backgroundStyle, page).then(() => {
        canvas.requestRenderAll();
        isApplyingRef.current = false;
      });
    });
  }, [activePage?.backgroundStyle, activePageId, backgroundStyle, page]);

  const performRedo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const history = historyRef.current[activePageId];
    if (!history || history.redo.length === 0) return;

    const next = history.redo.pop();
    history.undo.push(next);

    isApplyingRef.current = true;
    canvas.loadFromJSON(JSON.parse(next), () => {
      applyBackgroundStyle(canvas, activePage?.backgroundStyle || backgroundStyle, page).then(() => {
        canvas.requestRenderAll();
        isApplyingRef.current = false;
      });
    });
  }, [activePage?.backgroundStyle, activePageId, backgroundStyle, page]);

  const duplicateSelected = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    await cloneActiveObject(canvas, active);
  }, []);

  const removeSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, []);
  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || event.target?.isContentEditable;
      if (isInput) return;

      const canvas = fabricRef.current;
      if (!canvas) return;

      const active = canvas.getActiveObject();

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        performUndo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        performRedo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicateSelected();
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (active) {
          event.preventDefault();
          removeSelected();
        }
        return;
      }

      if (!active) return;

      const step = event.shiftKey ? 10 : 1;
      let moved = false;

      if (event.key === 'ArrowLeft') {
        active.set('left', (active.left || 0) - step);
        moved = true;
      }
      if (event.key === 'ArrowRight') {
        active.set('left', (active.left || 0) + step);
        moved = true;
      }
      if (event.key === 'ArrowUp') {
        active.set('top', (active.top || 0) - step);
        moved = true;
      }
      if (event.key === 'ArrowDown') {
        active.set('top', (active.top || 0) + step);
        moved = true;
      }

      if (moved) {
        event.preventDefault();
        clampToCanvasBounds(active, canvas.getWidth(), canvas.getHeight());
        active.setCoords();
        canvas.requestRenderAll();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [duplicateSelected, performRedo, performUndo, removeSelected]);

  const autoArrange = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (logoDataUrl) {
      fabric.Image.fromURL(
        logoDataUrl,
        (image) => {
          if (!image) {
            autoArrangeMenuOnCanvas({
              canvas,
              menuTitle,
              menu: orderedMenuData,
              page,
              layoutMode,
              categoryColumns: sectionColumns,
              typography,
              keepExisting: true
            });
            return;
          }

          image.scaleToWidth(logoSize);
          image.scaleToHeight(logoSize);
          image.set({ data: { kind: 'logo', role: 'menu-logo' } });

          autoArrangeMenuOnCanvas({
            canvas,
            menuTitle,
            menu: orderedMenuData,
            page,
            layoutMode,
            categoryColumns: sectionColumns,
            typography,
            logoObject: image,
            keepExisting: true
          });
        },
        { crossOrigin: 'anonymous' }
      );
      return;
    }

    autoArrangeMenuOnCanvas({
      canvas,
      menuTitle,
      menu: orderedMenuData,
      page,
      layoutMode,
      categoryColumns: sectionColumns,
      typography,
      keepExisting: true
    });
  }, [layoutMode, logoDataUrl, logoSize, menuTitle, orderedMenuData, page, sectionColumns, typography]);

  const handleGenerateMenu = useCallback(() => {
    autoArrange();
  }, [autoArrange]);

  const handleDropAsset = useCallback(
    async (payload, point) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const x = snapToGrid ? Math.round(point.x / GRID_SIZE) * GRID_SIZE : point.x;
      const y = snapToGrid ? Math.round(point.y / GRID_SIZE) * GRID_SIZE : point.y;

      if (payload.kind === 'icon') {
        const icon = ICON_LIBRARY.find((entry) => entry.id === payload.iconId);
        if (!icon) return;

        const svg = iconToSvgString(icon, payload.color || '#111827');
        await addSvgStringAsObject(canvas, svg, {
          left: x,
          top: y,
          width: payload.size || 40,
          height: payload.size || 40,
          data: { label: icon.name }
        });
        return;
      }

      if (payload.kind === 'custom-icon') {
        const custom = customIcons.find((entry) => entry.id === payload.iconId);
        if (!custom) return;

        if (custom.type === 'svg') {
          await addSvgStringAsObject(canvas, custom.svgText, {
            left: x,
            top: y,
            width: 50,
            height: 50,
            data: { label: custom.name }
          });
          return;
        }

        await addImageToCanvas(canvas, custom.dataUrl, {
          left: x,
          top: y,
          width: 58,
          height: 58,
          data: { label: custom.name }
        });
        return;
      }

      if (payload.kind === 'shape') {
        const shape = createShapeObject(payload.shapeType, {
          left: x,
          top: y,
          data: { label: payload.label || payload.shapeType }
        });
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.requestRenderAll();
      }
    },
    [customIcons, snapToGrid]
  );

  const addPage = useCallback(() => {
    const id = `page-${Date.now()}`;
    const nextPage = makePage(id, `Page ${pages.length + 1}`, backgroundStyle);
    setPages((prev) => [...prev, nextPage]);
    setActivePageId(id);
  }, [backgroundStyle, pages.length]);

  const duplicatePage = useCallback(() => {
    if (!activePage) return;
    const id = `page-${Date.now()}`;
    const clone = { ...activePage, id, name: `${activePage.name} Copy` };
    setPages((prev) => [...prev, clone]);
    setActivePageId(id);
  }, [activePage]);

  const deletePage = useCallback(() => {
    if (pages.length <= 1) return;

    const filtered = pages.filter((pageItem) => pageItem.id !== activePageId);
    setPages(filtered);
    setActivePageId(filtered[0].id);
  }, [activePageId, pages]);

  const resetDesign = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    applyBackgroundStyle(canvas, backgroundStyle, page);
    canvas.requestRenderAll();
    setLogoDataUrl('');
  }, [backgroundStyle, page]);

  const onPatchSelectedObject = useCallback((patch) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    if (typeof patch.left === 'number') active.set('left', patch.left);
    if (typeof patch.top === 'number') active.set('top', patch.top);
    if (typeof patch.width === 'number') active.scaleToWidth(Math.max(8, patch.width));
    if (typeof patch.height === 'number') active.scaleToHeight(Math.max(8, patch.height));
    if (typeof patch.angle === 'number') active.set('angle', patch.angle);
    if (typeof patch.opacity === 'number') active.set('opacity', Math.min(1, Math.max(0.1, patch.opacity)));
    if (typeof patch.color === 'string') updateObjectColor(active, patch.color);

    clampToCanvasBounds(active, canvas.getWidth(), canvas.getHeight());
    active.setCoords();
    canvas.requestRenderAll();
  }, []);

  const bringForward = useCallback(() => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (!active || !canvas) return;
    canvas.bringForward(active);
    canvas.requestRenderAll();
  }, []);

  const sendBackward = useCallback(() => {
    const canvas = fabricRef.current;
    const active = canvas?.getActiveObject();
    if (!active || !canvas) return;
    canvas.sendBackwards(active);
    canvas.requestRenderAll();
  }, []);

  const handleIconUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files || []);
    const nextItems = [];

    for (const file of files) {
      const id = `custom-icon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      if (file.type === 'image/svg+xml') {
        const svgText = await fileToText(file);
        nextItems.push({ id, name: file.name.replace(/\.svg$/i, ''), type: 'svg', svgText });
      } else if (file.type.startsWith('image/')) {
        const dataUrl = await fileToDataUrl(file);
        nextItems.push({ id, name: file.name, type: 'image', dataUrl });
      }
    }

    setCustomIcons((prev) => [...prev, ...nextItems]);
    event.target.value = '';
  }, []);

  const handleLogoUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setLogoDataUrl(dataUrl);
  }, []);
  const removeLogo = useCallback(() => {
    setLogoDataUrl('');
    const canvas = fabricRef.current;
    if (!canvas) return;
    const logos = canvas.getObjects().filter((obj) => obj.data?.kind === 'logo' || obj.data?.role === 'menu-logo');
    logos.forEach((logo) => canvas.remove(logo));
    canvas.requestRenderAll();
  }, []);

  const applyBackground = useCallback(
    async (style) => {
      setBackgroundStyle(style);
      setPages((prev) =>
        prev.map((pageItem) =>
          pageItem.id === activePageId ? { ...pageItem, backgroundStyle: style } : pageItem
        )
      );

      const canvas = fabricRef.current;
      if (!canvas) return;
      await applyBackgroundStyle(canvas, style, page);
      canvas.requestRenderAll();
    },
    [activePageId, page]
  );

  const handleGenerateAiMenu = useCallback(() => {
    const generated = generateAiMenu({
      restaurantType: aiRestaurantType,
      menuSize: aiMenuSize,
      cuisineStyle: aiCuisineStyle,
      generateDescriptions: aiDescriptions
    });

    setMenuTitle(generated.title);
    setMenuText(generated.text);
    setManualTypes({});
  }, [aiCuisineStyle, aiDescriptions, aiMenuSize, aiRestaurantType]);

  const handleDownloadSvg = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, 'smart-menu.svg');
  }, []);

  const handleDownloadPng = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'smart-menu.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const svgString = canvas.toSVG();
    const svgElement = buildSvgElementFromString(svgString);
    await exportAsPdf(svgElement, { width: canvas.getWidth(), height: canvas.getHeight() }, 'smart-menu.pdf');
  }, []);

  const handleDownloadPptx = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const svgString = canvas.toSVG();
    const svgElement = buildSvgElementFromString(svgString);
    await exportAsPptx(svgElement, { width: canvas.getWidth(), height: canvas.getHeight() }, 'smart-menu.pptx');
  }, []);

  const visibleCategories = useMemo(() => {
    const map = new Map(orderedMenuData.categories.map((category) => [category.id, category]));
    return sectionOrder.map((id) => map.get(id)).filter(Boolean);
  }, [orderedMenuData.categories, sectionOrder]);

  const columnCount = inferColumns(layoutMode, orderedMenuData.categories.reduce((sum, c) => sum + c.items.length, 0));

  const iconGroups = useMemo(
    () => ({
      Food: ICON_LIBRARY.filter((icon) => icon.group === 'Food'),
      Drinks: ICON_LIBRARY.filter((icon) => icon.group === 'Drinks'),
      Desserts: ICON_LIBRARY.filter((icon) => icon.group === 'Desserts'),
      Decorative: ICON_LIBRARY.filter((icon) => icon.group === 'Decorative')
    }),
    []
  );

  const menuPanel = (
    <div className="grid gap-3 text-xs">
      <label className="grid gap-1">
        <span className="text-stone-700">Menu Title</span>
        <input type="text" className="rounded border border-stone-300 px-2 py-1" value={menuTitle} onChange={(event) => setMenuTitle(event.target.value)} />
      </label>

      <label className="grid gap-1">
        <span className="text-stone-700">Menu Content</span>
        <textarea className="h-48 resize-y rounded border border-stone-300 p-2 font-mono text-xs" value={menuText} onChange={(event) => setMenuText(event.target.value)} />
      </label>

      <div className="rounded border border-stone-200 bg-stone-50 p-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold text-stone-700">Section Drag + Columns</p>
          <button
            type="button"
            onClick={() => {
              setSectionOrder(parsedMenu.categories.map((category) => category.id));
              setSectionColumns(Object.fromEntries(parsedMenu.categories.map((category) => [category.id, 0])));
            }}
            className="rounded border border-stone-300 px-2 py-1 text-[11px] text-stone-700 hover:bg-stone-100"
          >
            Reset Layout
          </button>
        </div>

        <div className="space-y-2">
          {visibleCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 rounded border border-stone-300 bg-white px-2 py-1"
              draggable
              onDragStart={(event) => event.dataTransfer.setData('text/plain', category.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const dragId = event.dataTransfer.getData('text/plain');
                if (!dragId || dragId === category.id) return;

                setSectionOrder((prev) => {
                  const from = prev.indexOf(dragId);
                  const to = prev.indexOf(category.id);
                  if (from < 0 || to < 0) return prev;
                  const next = [...prev];
                  const [moved] = next.splice(from, 1);
                  next.splice(to, 0, moved);
                  return next;
                });
              }}
            >
              <span className="flex-1 truncate text-stone-700">{category.name}</span>
              <select
                value={sectionColumns[category.id] ?? 0}
                onChange={(event) => setSectionColumns((prev) => ({ ...prev, [category.id]: Math.min(columnCount - 1, Number(event.target.value)) }))}
                className="rounded border border-stone-300 px-1 py-0.5"
              >
                {Array.from({ length: Math.max(1, columnCount) }).map((_, index) => (
                  <option key={index} value={index}>
                    Column {index + 1}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border border-stone-200 bg-stone-50 p-2">
        <p className="mb-2 font-semibold text-stone-700">AI Menu Generator</p>
        <div className="grid gap-2">
          <label className="grid gap-1">
            <span>Restaurant Type</span>
            <select value={aiRestaurantType} onChange={(event) => setAiRestaurantType(event.target.value)} className="rounded border border-stone-300 px-2 py-1">
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="bistro">Bistro</option>
              <option value="bar">Bar</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span>Menu Size</span>
            <select value={aiMenuSize} onChange={(event) => setAiMenuSize(event.target.value)} className="rounded border border-stone-300 px-2 py-1">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span>Cuisine Style</span>
            <select value={aiCuisineStyle} onChange={(event) => setAiCuisineStyle(event.target.value)} className="rounded border border-stone-300 px-2 py-1">
              <option value="indian">Indian</option>
              <option value="chinese">Chinese</option>
              <option value="continental">Continental</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={aiDescriptions} onChange={(event) => setAiDescriptions(event.target.checked)} />
            <span>Generate Descriptions</span>
          </label>
          <button type="button" onClick={handleGenerateAiMenu} className="rounded bg-emerald-700 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
            Generate AI Menu
          </button>
        </div>
      </div>

      <p className="text-[11px] text-stone-500">Estimated menu rows: {menuSizeToCount(aiMenuSize)} items/page.</p>
    </div>
  );
  const templatesPanel = (
    <div className="grid gap-2 text-xs">
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => (
          <div key={template.id} className="rounded border border-stone-300 p-2">
            <div className="mb-1 text-[11px] font-semibold text-stone-700">{template.name}</div>
            <div className="flex gap-1">
              <button type="button" onClick={() => applyTemplate(template)} className="flex-1 rounded bg-amber-700 px-2 py-1 text-[11px] font-semibold text-white hover:bg-amber-800">Apply</button>
              {!template.builtIn && (
                <button type="button" onClick={() => deleteTemplate(template.id)} className="rounded border border-red-300 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded border border-stone-200 bg-stone-50 p-2">
        <label className="grid gap-1">
          <span className="text-stone-700">Save Current as Template</span>
          <input type="text" value={newTemplateName} onChange={(event) => setNewTemplateName(event.target.value)} placeholder="Template Name" className="rounded border border-stone-300 px-2 py-1" />
        </label>
        <button type="button" onClick={saveTemplate} className="mt-2 w-full rounded bg-stone-800 px-2 py-2 text-xs font-semibold text-white hover:bg-black">Save Template</button>
      </div>
    </div>
  );

  const iconsPanel = (
    <div className="grid gap-3 text-xs">
      {Object.entries(iconGroups).map(([groupName, entries]) => (
        <div key={groupName}>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">{groupName}</div>
          <div className="grid grid-cols-3 gap-2">
            {entries.map((icon) => (
              <button
                key={icon.id}
                type="button"
                draggable
                onDragStart={(event) => event.dataTransfer.setData('application/json', JSON.stringify({ kind: 'icon', iconId: icon.id, color: '#111827', size: 40 }))}
                className="rounded border border-stone-300 bg-white p-2 text-center text-[10px] text-stone-700 hover:bg-stone-100"
              >
                <svg viewBox={icon.viewBox} className="mx-auto mb-1 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {icon.nodes.map((node, index) => {
                    const [tag, attrs] = node;
                    if (tag === 'path') return <path key={index} {...attrs} />;
                    if (tag === 'circle') return <circle key={index} {...attrs} />;
                    if (tag === 'polygon') return <polygon key={index} {...attrs} />;
                    if (tag === 'rect') return <rect key={index} {...attrs} />;
                    return null;
                  })}
                </svg>
                <span className="block truncate">{icon.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded border border-stone-200 bg-stone-50 p-2">
        <label className="grid gap-1">
          <span className="font-semibold text-stone-700">Upload Icon (SVG/PNG)</span>
          <input type="file" accept="image/svg+xml,image/png,image/jpeg" multiple onChange={handleIconUpload} />
        </label>
        {customIcons.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {customIcons.map((icon) => (
              <button key={icon.id} type="button" draggable onDragStart={(event) => event.dataTransfer.setData('application/json', JSON.stringify({ kind: 'custom-icon', iconId: icon.id }))} className="truncate rounded border border-stone-300 bg-white px-2 py-1 text-[11px] text-stone-700">
                {icon.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const shapesPanel = (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {[
        { id: 'rectangle', label: 'Rectangle' },
        { id: 'circle', label: 'Circle' },
        { id: 'line', label: 'Line' },
        { id: 'divider', label: 'Divider' },
        { id: 'banner', label: 'Banner' },
        { id: 'badge', label: 'Badge' },
        { id: 'frame', label: 'Frame' }
      ].map((shape) => (
        <button key={shape.id} type="button" draggable onDragStart={(event) => event.dataTransfer.setData('application/json', JSON.stringify({ kind: 'shape', shapeType: shape.id, label: shape.label }))} className="rounded border border-stone-300 bg-white px-2 py-2 text-left hover:bg-stone-100">
          {shape.label}
        </button>
      ))}

      <button
        type="button"
        onClick={() => {
          const shape = createShapeObject('rectangle', { data: { label: 'Rectangle' } });
          const canvas = fabricRef.current;
          if (!canvas) return;
          canvas.add(shape);
          canvas.setActiveObject(shape);
          canvas.requestRenderAll();
        }}
        className="col-span-2 rounded border border-stone-300 bg-stone-100 px-2 py-2 font-semibold text-stone-700 hover:bg-stone-200"
      >
        Quick Add Rectangle
      </button>
    </div>
  );

  const typographyPanel = (
    <div className="grid gap-2 text-xs">
      {[
        ['Title Font', 'titleFont'],
        ['Section Font', 'sectionFont'],
        ['Item Font', 'itemFont'],
        ['Description Font', 'descriptionFont'],
        ['Price Font', 'priceFont']
      ].map(([label, key]) => (
        <label key={key} className="grid gap-1">
          <span className="text-stone-700">{label}</span>
          <select value={typography[key]} onChange={(event) => setTypography((prev) => ({ ...prev, [key]: event.target.value }))} className="max-h-40 overflow-y-auto rounded border border-stone-300 px-2 py-1">
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font} style={{ fontFamily: `'${font}'` }}>
                {font}
              </option>
            ))}
          </select>
        </label>
      ))}

      {[
        ['Title Weight', 'titleWeight'],
        ['Section Weight', 'sectionWeight'],
        ['Item Weight', 'itemWeight'],
        ['Description Weight', 'descriptionWeight'],
        ['Price Weight', 'priceWeight']
      ].map(([label, key]) => (
        <label key={key} className="grid gap-1">
          <span className="text-stone-700">{label}</span>
          <select value={typography[key]} onChange={(event) => setTypography((prev) => ({ ...prev, [key]: Number(event.target.value) }))} className="rounded border border-stone-300 px-2 py-1">
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      {[
        ['Title Size', 'titleSize', 18, 64],
        ['Section Size', 'sectionSize', 14, 40],
        ['Item Size', 'itemSize', 12, 28],
        ['Description Size', 'descriptionSize', 10, 20],
        ['Price Size', 'priceSize', 11, 26]
      ].map(([label, key, min, max]) => (
        <label key={key} className="grid gap-1">
          <div className="flex items-center justify-between text-stone-700">
            <span>{label}</span>
            <span className="font-medium">{typography[key]}</span>
          </div>
          <input type="range" min={min} max={max} value={typography[key]} onChange={(event) => setTypography((prev) => ({ ...prev, [key]: Number(event.target.value) }))} />
        </label>
      ))}

      <label className="grid gap-1">
        <div className="flex items-center justify-between text-stone-700">
          <span>Letter Spacing</span>
          <span className="font-medium">{typography.letterSpacing.toFixed(2)}</span>
        </div>
        <input type="range" min={0} max={1.2} step={0.05} value={typography.letterSpacing} onChange={(event) => setTypography((prev) => ({ ...prev, letterSpacing: Number(event.target.value) }))} />
      </label>

      <button type="button" onClick={addTextObject} className="rounded border border-stone-300 bg-stone-100 px-2 py-2 font-semibold text-stone-700 hover:bg-stone-200">Add Text Object</button>
    </div>
  );
  const backgroundPanel = (
    <div className="grid gap-2 text-xs">
      <label className="grid gap-1">
        <span className="text-stone-700">Background Style</span>
        <select value={backgroundStyle} onChange={(event) => applyBackground(event.target.value)} className="rounded border border-stone-300 px-2 py-1">
          {BACKGROUND_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </label>

      <button type="button" onClick={() => applyBackground('none')} className="rounded border border-stone-300 px-2 py-1 font-medium text-stone-700 hover:bg-stone-100">
        Reset Background
      </button>

      <div className="rounded border border-stone-200 bg-stone-50 p-2">
        <p className="mb-1 font-semibold text-stone-700">Restaurant Logo</p>
        <input type="file" accept="image/*" onChange={handleLogoUpload} />

        <label className="mt-2 grid gap-1">
          <div className="flex items-center justify-between">
            <span>Logo Size</span>
            <span className="font-medium">{logoSize}px</span>
          </div>
          <input type="range" min={40} max={150} value={logoSize} onChange={(event) => setLogoSize(Number(event.target.value))} />
        </label>

        <button type="button" onClick={removeLogo} className="mt-2 w-full rounded border border-red-300 px-2 py-1 font-semibold text-red-700 hover:bg-red-50">
          Remove Logo
        </button>
      </div>
    </div>
  );

  const pagesPanel = (
    <div className="grid gap-2 text-xs">
      <label className="grid gap-1">
        <span className="text-stone-700">Page Size</span>
        <select value={pageSize} onChange={(event) => setPageSize(event.target.value)} className="rounded border border-stone-300 px-2 py-1">
          <option value="A5">A5</option>
          <option value="A4">A4</option>
          <option value="A3">A3</option>
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-stone-700">Orientation</span>
        <select value={orientation} onChange={(event) => setOrientation(event.target.value)} className="rounded border border-stone-300 px-2 py-1">
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </label>

      <div className="rounded border border-stone-200 bg-stone-50 p-2">
        <p className="mb-2 font-semibold text-stone-700">Pages</p>
        <div className="space-y-1">
          {pages.map((pageItem) => (
            <button key={pageItem.id} type="button" onClick={() => setActivePageId(pageItem.id)} className={`block w-full rounded px-2 py-1 text-left ${pageItem.id === activePageId ? 'bg-amber-700 text-white' : 'bg-white text-stone-700'}`}>
              {pageItem.name}
            </button>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1">
          <button type="button" onClick={addPage} className="rounded border border-stone-300 px-1 py-1 font-semibold text-stone-700 hover:bg-stone-100">Add</button>
          <button type="button" onClick={duplicatePage} className="rounded border border-stone-300 px-1 py-1 font-semibold text-stone-700 hover:bg-stone-100">Duplicate</button>
          <button type="button" onClick={deletePage} className="rounded border border-red-300 px-1 py-1 font-semibold text-red-700 hover:bg-red-50">Delete</button>
        </div>
      </div>

      <label className="grid gap-1">
        <span className="text-stone-700">Auto Layout Mode</span>
        <select value={layoutMode} onChange={(event) => setLayoutMode(event.target.value)} className="rounded border border-stone-300 px-2 py-1">
          <option value="single">Single Column</option>
          <option value="two">Two Column</option>
          <option value="three">Three Column</option>
          <option value="grid">Grid Layout</option>
          <option value="auto">Auto Layout</option>
        </select>
      </label>
    </div>
  );

  const sidebarSections = [
    { key: 'menu', title: 'Menu Content', content: menuPanel },
    { key: 'templates', title: 'Templates', content: templatesPanel },
    { key: 'icons', title: 'Icons', content: iconsPanel },
    { key: 'shapes', title: 'Shapes', content: shapesPanel },
    { key: 'typography', title: 'Typography', content: typographyPanel },
    { key: 'background', title: 'Background', content: backgroundPanel },
    { key: 'pages', title: 'Pages', content: pagesPanel }
  ];

  return (
    <div className="flex h-screen flex-col bg-stone-100">
      <EditorToolbar
        onGenerateMenu={handleGenerateMenu}
        onAutoArrange={autoArrange}
        onAddPage={addPage}
        onResetDesign={resetDesign}
        onDownloadSvg={handleDownloadSvg}
        onDownloadPng={handleDownloadPng}
        onDownloadPptx={handleDownloadPptx}
        onDownloadPdf={handleDownloadPdf}
      />

      <div className="flex min-h-0 flex-1">
        <AccordionSidebar sections={sidebarSections} openKey={openPanel} setOpenKey={setOpenPanel} />

        <FabricCanvasPanel
          canvasRef={canvasDomRef}
          wrapperRef={canvasWrapperRef}
          page={page}
          snapToGrid={snapToGrid}
          onDropAsset={handleDropAsset}
          activePageName={activePage?.name || 'Page'}
        />

        <FabricPropertiesPanel
          selectedObject={selectedObject}
          onPatch={onPatchSelectedObject}
          onDelete={removeSelected}
          onDuplicate={duplicateSelected}
          onBringForward={bringForward}
          onSendBackward={sendBackward}
          snapToGrid={snapToGrid}
          setSnapToGrid={setSnapToGrid}
        />
      </div>
    </div>
  );
}
