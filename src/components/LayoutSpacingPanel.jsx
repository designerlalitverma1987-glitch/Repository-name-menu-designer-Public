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

export default function LayoutSpacingPanel({ spacing, setSpacing, densityMode, setDensityMode, densityModes }) {
  return (
    <div className="grid gap-2">
      <label className="grid gap-1 text-xs">
        <span className="text-stone-700">Layout Density</span>
        <select
          className="rounded border border-stone-300 px-2 py-1"
          value={densityMode}
          onChange={(event) => setDensityMode(event.target.value)}
        >
          {densityModes.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </label>

      <Slider
        label="Item Spacing"
        min={4}
        max={40}
        value={Math.round(spacing.itemGap)}
        onChange={(value) => setSpacing((prev) => ({ ...prev, itemGap: value }))}
      />
      <Slider
        label="Description Spacing"
        min={2}
        max={16}
        value={Math.round(spacing.descriptionGap)}
        onChange={(value) => setSpacing((prev) => ({ ...prev, descriptionGap: value }))}
      />
      <Slider
        label="Section Spacing"
        min={6}
        max={46}
        value={Math.round(spacing.categoryGap)}
        onChange={(value) => setSpacing((prev) => ({ ...prev, categoryGap: value }))}
      />
      <Slider
        label="Column Gap"
        min={8}
        max={70}
        value={Math.round(spacing.columnGap)}
        onChange={(value) => setSpacing((prev) => ({ ...prev, columnGap: value }))}
      />
      <Slider
        label="Page Padding"
        min={8}
        max={90}
        value={Math.round(spacing.padding)}
        onChange={(value) => setSpacing((prev) => ({ ...prev, padding: value }))}
      />
    </div>
  );
}
