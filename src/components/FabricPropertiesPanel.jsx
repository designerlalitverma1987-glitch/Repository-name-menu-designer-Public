function Field({ label, value, onChange, min, max, step = 1 }) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="text-stone-700">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded border border-stone-300 px-2 py-1"
      />
    </label>
  );
}

function Slider({ label, value, onChange, min, max, step = 1 }) {
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

export default function FabricPropertiesPanel({
  selectedObject,
  onPatch,
  onDelete,
  onDuplicate,
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

        {!selectedObject && <p className="text-xs text-stone-500">Select an element to edit its properties.</p>}

        {selectedObject && (
          <div className="grid gap-2">
            <div className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">
              {selectedObject.label}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="X" value={Math.round(selectedObject.left)} min={0} max={5000} onChange={(value) => onPatch({ left: value })} />
              <Field label="Y" value={Math.round(selectedObject.top)} min={0} max={5000} onChange={(value) => onPatch({ top: value })} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Width"
                value={Math.round(selectedObject.width)}
                min={8}
                max={5000}
                onChange={(value) => onPatch({ width: value })}
              />
              <Field
                label="Height"
                value={Math.round(selectedObject.height)}
                min={8}
                max={5000}
                onChange={(value) => onPatch({ height: value })}
              />
            </div>

            <Slider
              label="Rotation"
              min={-180}
              max={180}
              value={Math.round(selectedObject.angle)}
              onChange={(value) => onPatch({ angle: value })}
            />

            <Slider
              label="Opacity"
              min={0.1}
              max={1}
              step={0.05}
              value={Number(selectedObject.opacity.toFixed(2))}
              onChange={(value) => onPatch({ opacity: value })}
            />

            <label className="grid gap-1 text-xs">
              <span className="text-stone-700">Color</span>
              <input type="color" value={selectedObject.color} onChange={(event) => onPatch({ color: event.target.value })} />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onBringForward}
                className="rounded border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Bring Forward
              </button>
              <button
                type="button"
                onClick={onSendBackward}
                className="rounded border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Send Backward
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onDuplicate}
                className="rounded border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-stone-300 bg-white p-3 text-xs text-stone-600">
        <h4 className="mb-2 font-semibold text-stone-700">Keyboard</h4>
        <p>Arrow: Move</p>
        <p>Shift + Arrow: Move faster</p>
        <p>Delete: Remove</p>
        <p>Ctrl + D: Duplicate</p>
        <p>Ctrl + Z / Ctrl + Y: Undo / Redo</p>
      </section>
    </aside>
  );
}
