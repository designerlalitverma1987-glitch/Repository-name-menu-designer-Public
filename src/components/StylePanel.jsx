import TypographyPanel from './TypographyPanel';
import LayoutSpacingPanel from './LayoutSpacingPanel';

function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-stone-300 bg-white p-3">
      <h3 className="mb-2 text-sm font-semibold text-stone-800">{title}</h3>
      {children}
    </section>
  );
}

function Slider({ label, min, max, step = 1, value, onChange }) {
  return (
    <label className="grid gap-1">
      <div className="flex items-center justify-between text-xs text-stone-700">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export default function StylePanel({
  typography,
  setTypography,
  spacing,
  setSpacing,
  densityMode,
  setDensityMode,
  densityModes,
  menuShape,
  setMenuShape,
  borderRadius,
  setBorderRadius,
  styleKey,
  setStyleKey,
  stylePresets,
  generatedStyles,
  themeKey,
  setThemeKey,
  themePresets,
  useCustomTheme,
  setUseCustomTheme,
  customTheme,
  setCustomTheme,
  fontStyles,
  setFontStyles,
  fontFamilies,
  fontWeights,
  backgroundStyle,
  setBackgroundStyle,
  backgroundStyles,
  logoDataUrl,
  logoSize,
  setLogoSize,
  onLogoUpload
}) {
  const styleKeys = Object.keys(stylePresets);
  const themeKeys = Object.keys(themePresets);

  return (
    <div className="grid gap-3">
      <Section title="Menu Templates">
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            {styleKeys.map((key) => (
              <button
                key={key}
                onClick={() => setStyleKey(key)}
                className={`rounded border px-2 py-1 text-xs font-medium transition ${
                  styleKey === key
                    ? 'border-amber-700 bg-amber-700 text-white'
                    : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                {stylePresets[key].label}
              </button>
            ))}
          </div>

          <div className="text-xs text-stone-500">
            Generated picks:
            <div className="mt-1 flex flex-wrap gap-1">
              {generatedStyles.map((key) => (
                <button
                  key={key}
                  onClick={() => setStyleKey(key)}
                  className="rounded bg-stone-200 px-2 py-1 text-[11px] font-medium text-stone-700 hover:bg-stone-300"
                >
                  {stylePresets[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Typography Panel">
        <TypographyPanel
          typography={typography}
          setTypography={setTypography}
          fontStyles={fontStyles}
          setFontStyles={setFontStyles}
          fontFamilies={fontFamilies}
          fontWeights={fontWeights}
        />
      </Section>

      <Section title="Smart Line Spacing">
        <LayoutSpacingPanel
          spacing={spacing}
          setSpacing={setSpacing}
          densityMode={densityMode}
          setDensityMode={setDensityMode}
          densityModes={densityModes}
        />
      </Section>

      <Section title="Background Style">
        <label className="grid gap-1 text-xs">
          <span className="text-stone-700">Theme Background</span>
          <select
            className="rounded border border-stone-300 px-2 py-1"
            value={backgroundStyle}
            onChange={(event) => setBackgroundStyle(event.target.value)}
          >
            {backgroundStyles.map((bg) => (
              <option key={bg.value} value={bg.value}>
                {bg.label}
              </option>
            ))}
          </select>
        </label>
      </Section>

      <Section title="Restaurant Logo">
        <div className="grid gap-2 text-xs">
          <label className="grid gap-1">
            <span className="text-stone-700">Upload Logo</span>
            <input type="file" accept="image/*" onChange={onLogoUpload} />
          </label>

          {logoDataUrl && (
            <img src={logoDataUrl} alt="logo" className="h-16 w-16 rounded border border-stone-200 object-contain" />
          )}

          <Slider
            label="Logo Size"
            min={40}
            max={150}
            value={Math.round(logoSize)}
            onChange={setLogoSize}
          />
        </div>
      </Section>

      <Section title="Menu Container">
        <div className="grid gap-2 text-xs">
          <label className="grid gap-1">
            <span className="text-stone-700">Shape</span>
            <select
              className="rounded border border-stone-300 px-2 py-1"
              value={menuShape}
              onChange={(event) => setMenuShape(event.target.value)}
            >
              <option value="square">Square Menu</option>
              <option value="rounded">Rounded Menu</option>
            </select>
          </label>

          <Slider
            label="Border Radius"
            min={0}
            max={40}
            value={Math.round(borderRadius)}
            onChange={setBorderRadius}
          />
        </div>
      </Section>

      <Section title="Color Themes">
        <div className="grid gap-2 text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useCustomTheme}
              onChange={(event) => setUseCustomTheme(event.target.checked)}
            />
            <span>Use Custom Colors</span>
          </label>

          {!useCustomTheme && (
            <select
              className="rounded border border-stone-300 px-2 py-1"
              value={themeKey}
              onChange={(event) => setThemeKey(event.target.value)}
            >
              {themeKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          )}

          {useCustomTheme && (
            <div className="grid grid-cols-2 gap-2">
              {['background', 'surface', 'text', 'subtext', 'accent', 'border', 'price'].map((slot) => (
                <label key={slot} className="grid gap-1">
                  <span className="text-[11px] capitalize text-stone-600">{slot}</span>
                  <input
                    type="color"
                    value={customTheme[slot]}
                    onChange={(event) =>
                      setCustomTheme((prev) => ({
                        ...prev,
                        [slot]: event.target.value
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
