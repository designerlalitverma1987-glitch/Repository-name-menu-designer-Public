import { useEffect, useMemo, useRef, useState } from 'react';
import TopBar from './components/TopBar';
import MenuInputPanel from './components/MenuInputPanel';
import PageSettingsPanel from './components/PageSettingsPanel';
import StylePanel from './components/StylePanel';
import PreviewPanel from './components/PreviewPanel';
import {
  DEFAULT_FONT_STYLES,
  DEFAULT_MENU_TEXT,
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

  const [menuShape, setMenuShape] = useState('rounded');
  const [borderRadius, setBorderRadius] = useState(22);

  const [styleKey, setStyleKey] = useState('minimal');
  const [generatedStyles, setGeneratedStyles] = useState(['minimal', 'modern', 'fineDining']);

  const [themeKey, setThemeKey] = useState(STYLE_PRESETS.minimal.defaultTheme);
  const [useCustomTheme, setUseCustomTheme] = useState(false);
  const [customTheme, setCustomTheme] = useState(THEME_PRESETS.minimalBlack);

  const [fontStyles, setFontStyles] = useState(DEFAULT_FONT_STYLES);
  const [manualTypes, setManualTypes] = useState({});

  const previewRef = useRef(null);

  useEffect(() => {
    setTypography(getTypographyDefaults(pageSize));
    setSpacing(getSpacingDefaults(pageSize, columns));
  }, [pageSize, columns]);

  const parsedMenu = useMemo(() => parseMenuText(menuText), [menuText]);
  const menuData = useMemo(
    () => applyManualOverrides(parsedMenu, manualTypes),
    [parsedMenu, manualTypes]
  );

  const page = useMemo(() => getPageDimensions(pageSize, orientation), [pageSize, orientation]);
  const stylePreset = STYLE_PRESETS[styleKey];

  const activeTheme = useMemo(
    () => (useCustomTheme ? customTheme : THEME_PRESETS[themeKey]),
    [customTheme, themeKey, useCustomTheme]
  );

  const layout = useMemo(
    () =>
      computeMenuLayout({
        menu: menuData,
        page,
        columns,
        typography,
        spacing,
        radius: menuShape === 'rounded' ? borderRadius : 0
      }),
    [menuData, page, columns, typography, spacing, menuShape, borderRadius]
  );

  const svgMarkup = useMemo(
    () =>
      generateSvgMarkup({
        layout,
        page,
        menuTitle,
        stylePreset,
        theme: activeTheme,
        fontStyles
      }),
    [layout, page, menuTitle, stylePreset, activeTheme, fontStyles]
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
        <aside className="w-[360px] shrink-0 space-y-3 overflow-y-auto border-r border-stone-300 bg-stone-50 p-3">
          <MenuInputPanel
            menuTitle={menuTitle}
            setMenuTitle={setMenuTitle}
            menuText={menuText}
            setMenuText={setMenuText}
            parsedMenu={parsedMenu}
            manualTypes={manualTypes}
            setManualTypes={setManualTypes}
            onGenerateDemo={handleGenerateDemoMenu}
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
          />
        </aside>

        <main className="flex-1 overflow-auto bg-gradient-to-br from-stone-200 via-amber-50 to-stone-300 p-6">
          <PreviewPanel ref={previewRef} svgMarkup={svgMarkup} />

          {layout?.overflow && (
            <p className="mx-auto mt-3 max-w-xl rounded-md bg-amber-100 px-3 py-2 text-center text-xs text-amber-900">
              Content is dense for the selected page. The layout engine auto-shrunk typography and spacing to prevent overflow.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
