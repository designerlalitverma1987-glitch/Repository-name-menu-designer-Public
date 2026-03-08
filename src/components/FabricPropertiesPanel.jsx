function NumberField({ label, value, min, max, step = 1, onChange }) {
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

function Slider({ label, value, min, max, step = 1, onChange }) {
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

function ShapeInspector({ selectedObject, onPatch }) {
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Width" value={Math.round(selectedObject.width)} min={8} max={5000} onChange={(value) => onPatch({ width: value })} />
        <NumberField label="Height" value={Math.round(selectedObject.height)} min={8} max={5000} onChange={(value) => onPatch({ height: value })} />
      </div>

      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={Boolean(selectedObject.lockAspect)} onChange={(event) => onPatch({ lockAspect: event.target.checked })} />
        <span>Lock Aspect Ratio</span>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <NumberField label="X" value={Math.round(selectedObject.left)} min={0} max={5000} onChange={(value) => onPatch({ left: value })} />
        <NumberField label="Y" value={Math.round(selectedObject.top)} min={0} max={5000} onChange={(value) => onPatch({ top: value })} />
      </div>

      <label className="grid gap-1 text-xs">
        <span className="text-stone-700">Fill Color</span>
        <input type="color" value={selectedObject.fill || '#ffffff'} onChange={(event) => onPatch({ fill: event.target.value })} />
      </label>

      <label className="grid gap-1 text-xs">
        <span className="text-stone-700">Stroke Color</span>
        <input type="color" value={selectedObject.stroke || '#111827'} onChange={(event) => onPatch({ stroke: event.target.value })} />
      </label>

      <Slider
        label="Stroke Width"
        min={0}
        max={20}
        value={Number((selectedObject.strokeWidth || 0).toFixed(1))}
        step={0.5}
        onChange={(value) => onPatch({ strokeWidth: value })}
      />

      <Slider
        label="Opacity"
        min={0.1}
        max={1}
        step={0.05}
        value={Number((selectedObject.opacity || 1).toFixed(2))}
        onChange={(value) => onPatch({ opacity: value })}
      />

      {selectedObject.isRect && (
        <>
          <Slider
            label="Global Radius"
            min={0}
            max={40}
            step={1}
            value={selectedObject.cornerRadius || 0}
            onChange={(value) => onPatch({ cornerRadius: value })}
          />

          <div className="grid grid-cols-2 gap-2">
            <Slider label="Top Left" min={0} max={40} value={selectedObject.cornerTL || 0} onChange={(value) => onPatch({ cornerTL: value })} />
            <Slider label="Top Right" min={0} max={40} value={selectedObject.cornerTR || 0} onChange={(value) => onPatch({ cornerTR: value })} />
            <Slider label="Bottom Right" min={0} max={40} value={selectedObject.cornerBR || 0} onChange={(value) => onPatch({ cornerBR: value })} />
            <Slider label="Bottom Left" min={0} max={40} value={selectedObject.cornerBL || 0} onChange={(value) => onPatch({ cornerBL: value })} />
          </div>
        </>
      )}

      <label className="grid gap-1 text-xs">
        <span className="text-stone-700">Border Style</span>
        <select value={selectedObject.borderStyle || 'solid'} onChange={(event) => onPatch({ borderStyle: event.target.value })} className="rounded border border-stone-300 px-2 py-1">
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
        </select>
      </label>
    </div>
  );
}

function TextInspector({ selectedObject, onPatch, fontFamilies }) {
  return (
    <div className="grid gap-2">
      <label className="grid gap-1 text-xs">
        <span className="text-stone-700">Font Family</span>
        <select value={selectedObject.fontFamily || fontFamilies[0]} onChange={(event) => onPatch({ fontFamily: event.target.value })} className="max-h-40 overflow-y-auto rounded border border-stone-300 px-2 py-1">
          {fontFamilies.map((font) => (
            <option key={font} value={font} style={{ fontFamily: `'${font}'` }}>
              {font}
            </option>
          ))}
        </select>
      </label>

      <Slider label="Font Size" min={8} max={120} value={Math.round(selectedObject.fontSize || 16)} onChange={(value) => onPatch({ fontSize: value })} />

      <label className="grid gap-1 text-xs">
        <span className="text-stone-700">Font Weight</span>
        <select value={String(selectedObject.fontWeight || 400)} onChange={(event) => onPatch({ fontWeight: Number(event.target.value) })} className="rounded border border-stone-300 px-2 py-1">
          <option value="300">300 Light</option>
          <option value="400">400 Regular</option>
          <option value="500">500 Medium</option>
          <option value="600">600 Semi Bold</option>
          <option value="700">700 Bold</option>
        </select>
      </label>

      <label className="grid gap-1 text-xs">
        <span className="text-stone-700">Text Alignment</span>
        <select value={selectedObject.textAlign || 'left'} onChange={(event) => onPatch({ textAlign: event.target.value })} className="rounded border border-stone-300 px-2 py-1">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>

      <Slider label="Line Height" min={0.8} max={2.5} step={0.05} value={Number((selectedObject.lineHeight || 1.2).toFixed(2))} onChange={(value) => onPatch({ lineHeight: value })} />

      <Slider label="Letter Spacing" min={0} max={2} step={0.05} value={Number((selectedObject.letterSpacing || 0).toFixed(2))} onChange={(value) => onPatch({ letterSpacing: value })} />

      <label className="grid gap-1 text-xs">
        <span className="text-stone-700">Text Color</span>
        <input type="color" value={selectedObject.fill || '#111827'} onChange={(event) => onPatch({ fill: event.target.value })} />
      </label>

      <NumberField label="Text Box Width" min={20} max={5000} value={Math.round(selectedObject.width)} onChange={(value) => onPatch({ textboxWidth: value })} />

      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={selectedObject.wrap !== false} onChange={(event) => onPatch({ wrap: event.target.checked })} />
        <span>Text Wrapping</span>
      </label>
    </div>
  );
}

function PageInspector({ pageSettings, onPagePatch, snapToGrid, setSnapToGrid }) {
  return (
    <div className="grid gap-2 text-xs">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={snapToGrid} onChange={(event) => setSnapToGrid(event.target.checked)} />
        <span>Snap To Grid</span>
      </label>

      <label className="grid gap-1">
        <span className="text-stone-700">Page Size</span>
        <select value={pageSettings.pageSize} onChange={(event) => onPagePatch({ pageSize: event.target.value })} className="rounded border border-stone-300 px-2 py-1">
          <option value="A3">A3</option>
          <option value="A4">A4</option>
          <option value="A5">A5</option>
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-stone-700">Orientation</span>
        <select value={pageSettings.orientation} onChange={(event) => onPagePatch({ orientation: event.target.value })} className="rounded border border-stone-300 px-2 py-1">
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-stone-700">Background Color</span>
        <input type="color" value={pageSettings.backgroundColor} onChange={(event) => onPagePatch({ backgroundColor: event.target.value })} />
      </label>
    </div>
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
  setSnapToGrid,
  fontFamilies,
  pageSettings,
  onPagePatch
}) {
  const hasSelection = Boolean(selectedObject);

  return (
    <aside className="w-[330px] shrink-0 space-y-3 overflow-y-auto border-l border-stone-300 bg-stone-50 p-3">
      <section className="rounded-lg border border-stone-300 bg-white p-3">
        <h3 className="mb-2 text-sm font-semibold text-stone-800">Properties</h3>

        {!hasSelection && (
          <PageInspector
            pageSettings={pageSettings}
            onPagePatch={onPagePatch}
            snapToGrid={snapToGrid}
            setSnapToGrid={setSnapToGrid}
          />
        )}

        {hasSelection && (
          <div className="grid gap-2">
            <div className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">
              {selectedObject.label}
            </div>

            {(selectedObject.isShape || selectedObject.isIcon) && (
              <ShapeInspector selectedObject={selectedObject} onPatch={onPatch} />
            )}

            {selectedObject.isText && (
              <TextInspector selectedObject={selectedObject} onPatch={onPatch} fontFamilies={fontFamilies} />
            )}

            {!selectedObject.isText && !selectedObject.isShape && !selectedObject.isIcon && (
              <div className="text-xs text-stone-500">This object has limited editable properties.</div>
            )}

            <Slider label="Rotation" min={-180} max={180} value={Math.round(selectedObject.angle || 0)} onChange={(value) => onPatch({ angle: value })} />

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={onBringForward} className="rounded border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100">Bring Forward</button>
              <button type="button" onClick={onSendBackward} className="rounded border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100">Send Backward</button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={onDuplicate} className="rounded border border-stone-300 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100">Duplicate</button>
              <button type="button" onClick={onDelete} className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700">Delete</button>
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
