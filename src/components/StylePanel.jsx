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

function FontInput({ label, value, onChange, placeholder }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-stone-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded border border-stone-300 px-2 py-1"
      />
    </label>
  );
}

export default function StylePanel({
  typography,
  setTypography,
  spacing,
  setSpacing,
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
  setFontStyles
}) {
  const styleKeys = Object.keys(stylePresets);
  const themeKeys = Object.keys(themePresets);

  return (
    <div className="grid gap-3">
      <Section title="Typography Controls">
        <div className="grid gap-2">
          <Slider
            label="Menu Title"
            min={18}
            max={56}
            value={Math.round(typography.title)}
            onChange={(value) => setTypography((prev) => ({ ...prev, title: value }))}
          />
          <Slider
            label="Category"
            min={16}
            max={32}
            value={Math.round(typography.category)}
            onChange={(value) => setTypography((prev) => ({ ...prev, category: value }))}
          />
          <Slider
            label="Food Item"
            min={14}
            max={28}
            value={Math.round(typography.item)}
            onChange={(value) => setTypography((prev) => ({ ...prev, item: value }))}
          />
          <Slider
            label="Description"
            min={10}
            max={20}
            value={Math.round(typography.description)}
            onChange={(value) => setTypography((prev) => ({ ...prev, description: value }))}
          />
          <Slider
            label="Price"
            min={12}
            max={24}
            value={Math.round(typography.price)}
            onChange={(value) => setTypography((prev) => ({ ...prev, price: value }))}
          />
          <Slider
            label="Line Height"
            min={1.05}
            max={1.8}
            step={0.01}
            value={Number(typography.lineHeight.toFixed(2))}
            onChange={(value) => setTypography((prev) => ({ ...prev, lineHeight: value }))}
          />
          <Slider
            label="Letter Spacing"
            min={-0.2}
            max={2}
            step={0.05}
            value={Number(typography.letterSpacing.toFixed(2))}
            onChange={(value) => setTypography((prev) => ({ ...prev, letterSpacing: value }))}
          />
        </div>
      </Section>

      <Section title="Font Style Controls">
        <div className="grid gap-2">
          <FontInput
            label="fontFamily"
            value={fontStyles.fontFamily}
            onChange={(value) => setFontStyles((prev) => ({ ...prev, fontFamily: value }))}
            placeholder='"DM Sans", sans-serif'
          />
          <FontInput
            label="titleFont"
            value={fontStyles.titleFont}
            onChange={(value) => setFontStyles((prev) => ({ ...prev, titleFont: value }))}
            placeholder='"Playfair Display", serif'
          />
          <FontInput
            label="itemFont"
            value={fontStyles.itemFont}
            onChange={(value) => setFontStyles((prev) => ({ ...prev, itemFont: value }))}
            placeholder='"DM Sans", sans-serif'
          />
          <FontInput
            label="descriptionFont"
            value={fontStyles.descriptionFont}
            onChange={(value) => setFontStyles((prev) => ({ ...prev, descriptionFont: value }))}
            placeholder='"DM Sans", sans-serif'
          />
          <FontInput
            label="priceFont"
            value={fontStyles.priceFont}
            onChange={(value) => setFontStyles((prev) => ({ ...prev, priceFont: value }))}
            placeholder='"DM Sans", sans-serif'
          />
        </div>
      </Section>

      <Section title="Spacing Controls">
        <div className="grid gap-2">
          <Slider
            label="Category Spacing"
            min={6}
            max={40}
            value={Math.round(spacing.categoryGap)}
            onChange={(value) => setSpacing((prev) => ({ ...prev, categoryGap: value }))}
          />
          <Slider
            label="Item Spacing"
            min={8}
            max={28}
            value={Math.round(spacing.itemGap)}
            onChange={(value) => setSpacing((prev) => ({ ...prev, itemGap: value }))}
          />
          <Slider
            label="Row/Description Gap"
            min={2}
            max={10}
            value={Math.round(spacing.descriptionGap)}
            onChange={(value) => setSpacing((prev) => ({ ...prev, descriptionGap: value }))}
          />
          <Slider
            label="Column Gap"
            min={8}
            max={60}
            value={Math.round(spacing.columnGap)}
            onChange={(value) => setSpacing((prev) => ({ ...prev, columnGap: value }))}
          />
          <Slider
            label="Outer Margin"
            min={8}
            max={80}
            value={Math.round(spacing.margin)}
            onChange={(value) => setSpacing((prev) => ({ ...prev, margin: value }))}
          />
          <Slider
            label="Padding"
            min={8}
            max={80}
            value={Math.round(spacing.padding)}
            onChange={(value) => setSpacing((prev) => ({ ...prev, padding: value }))}
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

      <Section title="Design Style Generator">
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
            Auto-generated layout picks:
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
