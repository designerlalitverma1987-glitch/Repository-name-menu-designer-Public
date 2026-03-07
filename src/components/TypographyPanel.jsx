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

function FontSelect({ label, value, onChange, options }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-stone-700">{label}</span>
      <select
        className="max-h-40 overflow-y-auto rounded border border-stone-300 px-2 py-1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((font) => (
          <option key={font} value={font} style={{ fontFamily: `'${font}'` }}>
            {font}
          </option>
        ))}
      </select>
    </label>
  );
}

function WeightSelect({ label, value, onChange, options }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-stone-700">{label}</span>
      <select
        className="rounded border border-stone-300 px-2 py-1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {options.map((weight) => (
          <option key={weight.value} value={weight.value}>
            {weight.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function TypographyPanel({
  typography,
  setTypography,
  fontStyles,
  setFontStyles,
  fontFamilies,
  fontWeights
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Slider
          label="Title Size"
          min={18}
          max={60}
          value={Math.round(typography.title)}
          onChange={(value) => setTypography((prev) => ({ ...prev, title: value }))}
        />
        <Slider
          label="Section Size"
          min={16}
          max={38}
          value={Math.round(typography.category)}
          onChange={(value) => setTypography((prev) => ({ ...prev, category: value }))}
        />
        <Slider
          label="Item Size"
          min={12}
          max={30}
          value={Math.round(typography.item)}
          onChange={(value) => setTypography((prev) => ({ ...prev, item: value }))}
        />
        <Slider
          label="Description Size"
          min={10}
          max={22}
          value={Math.round(typography.description)}
          onChange={(value) => setTypography((prev) => ({ ...prev, description: value }))}
        />
        <Slider
          label="Price Size"
          min={12}
          max={26}
          value={Math.round(typography.price)}
          onChange={(value) => setTypography((prev) => ({ ...prev, price: value }))}
        />
      </div>

      <div className="grid gap-2">
        <FontSelect
          label="Title Font"
          value={fontStyles.titleFont}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, titleFont: value }))}
          options={fontFamilies}
        />
        <WeightSelect
          label="Title Weight"
          value={fontStyles.titleWeight}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, titleWeight: value }))}
          options={fontWeights}
        />

        <FontSelect
          label="Section Font"
          value={fontStyles.sectionFont}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, sectionFont: value }))}
          options={fontFamilies}
        />
        <WeightSelect
          label="Section Weight"
          value={fontStyles.sectionWeight}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, sectionWeight: value }))}
          options={fontWeights}
        />

        <FontSelect
          label="Item Font"
          value={fontStyles.itemFont}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, itemFont: value }))}
          options={fontFamilies}
        />
        <WeightSelect
          label="Item Weight"
          value={fontStyles.itemWeight}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, itemWeight: value }))}
          options={fontWeights}
        />

        <FontSelect
          label="Description Font"
          value={fontStyles.descriptionFont}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, descriptionFont: value }))}
          options={fontFamilies}
        />
        <WeightSelect
          label="Description Weight"
          value={fontStyles.descriptionWeight}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, descriptionWeight: value }))}
          options={fontWeights}
        />

        <FontSelect
          label="Price Font"
          value={fontStyles.priceFont}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, priceFont: value }))}
          options={fontFamilies}
        />
        <WeightSelect
          label="Price Weight"
          value={fontStyles.priceWeight}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, priceWeight: value }))}
          options={fontWeights}
        />

        <FontSelect
          label="Global Fallback"
          value={fontStyles.fontFamily}
          onChange={(value) => setFontStyles((prev) => ({ ...prev, fontFamily: value }))}
          options={fontFamilies}
        />
      </div>
    </div>
  );
}
