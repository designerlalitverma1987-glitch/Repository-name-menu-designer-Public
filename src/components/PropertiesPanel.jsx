function NumberField({ label, value, min, max, step = 1, onChange }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-stone-700">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded border border-stone-300 px-2 py-1"
      />
    </label>
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

export default function PropertiesPanel({
  selectedElement,
  onChange,
  onDelete,
  onBringForward,
  onSendBackward,
  snapToGrid,
  setSnapToGrid
}) {
  return (
    <aside className="w-[300px] shrink-0 space-y-3 overflow-y-auto border-l border-stone-300 bg-stone-50 p-3">
      <section className="rounded-lg border border-stone-300 bg-white p-3">
        <h3 className="mb-2 text-sm font-semibold text-stone-800">Properties</h3>

        <label className="mb-3 flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(event) => setSnapToGrid(event.target.checked)}
          />
          <span>Snap To Grid</span>
        </label>

        {!selectedElement && (
          <p className="text-xs text-stone-500">Select any dropped icon or element to edit size, rotation, color, opacity, and layer.</p>
        )}

        {selectedElement && (
          <div className="grid gap-2">
            <div className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">
              {selectedElement.name}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Width"
                min={8}
                max={500}
                value={Math.round(selectedElement.width)}
                onChange={(value) => onChange({ width: Math.max(8, value) })}
              />
              <NumberField
                label="Height"
                min={8}
                max={500}
                value={Math.round(selectedElement.height)}
                onChange={(value) => onChange({ height: Math.max(8, value) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="X"
                min={0}
                max={3000}
                value={Math.round(selectedElement.x)}
                onChange={(value) => onChange({ x: Math.max(0, value) })}
              />
              <NumberField
                label="Y"
                min={0}
                max={3000}
                value={Math.round(selectedElement.y)}
                onChange={(value) => onChange({ y: Math.max(0, value) })}
              />
            </div>

            <Slider
              label="Rotation"
              min={-180}
              max={180}
              value={Math.round(selectedElement.rotation)}
              onChange={(value) => onChange({ rotation: value })}
            />

            <Slider
              label="Opacity"
              min={0.1}
              max={1}
              step={0.05}
              value={Number(selectedElement.opacity.toFixed(2))}
              onChange={(value) => onChange({ opacity: value })}
            />

            <label className="grid gap-1 text-xs">
              <span className="text-stone-700">Color</span>
              <input
                type="color"
                value={selectedElement.color}
                onChange={(event) => onChange({ color: event.target.value })}
              />
            </label>

            <label className="grid gap-1 text-xs">
              <span className="text-stone-700">Layer</span>
              <select
                className="rounded border border-stone-300 px-2 py-1"
                value={selectedElement.layer}
                onChange={(event) => onChange({ layer: event.target.value })}
              >
                <option value="above">Above Text</option>
                <option value="below">Below Text</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onBringForward}
                className="rounded border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Bring Forward
              </button>
              <button
                onClick={onSendBackward}
                className="rounded border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Send Backward
              </button>
            </div>

            <button
              onClick={onDelete}
              className="rounded bg-red-600 px-2 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Delete Element
            </button>
          </div>
        )}
      </section>
    </aside>
  );
}
