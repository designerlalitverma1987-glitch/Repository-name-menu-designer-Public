export default function PageSettingsPanel({ pageSize, setPageSize, orientation, setOrientation, columns, setColumns }) {
  return (
    <section className="rounded-lg border border-stone-300 bg-white p-3">
      <h3 className="mb-2 text-sm font-semibold text-stone-800">Page Settings</h3>
      <div className="grid gap-2 text-xs">
        <label className="grid gap-1">
          <span className="text-stone-700">Page Size</span>
          <select
            className="rounded border border-stone-300 px-2 py-1"
            value={pageSize}
            onChange={(event) => setPageSize(event.target.value)}
          >
            <option value="A3">A3</option>
            <option value="A4">A4</option>
            <option value="A5">A5</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-stone-700">Orientation</span>
          <select
            className="rounded border border-stone-300 px-2 py-1"
            value={orientation}
            onChange={(event) => setOrientation(event.target.value)}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-stone-700">Columns</span>
          <select
            className="rounded border border-stone-300 px-2 py-1"
            value={columns}
            onChange={(event) => setColumns(Number(event.target.value))}
          >
            <option value={1}>1 Column</option>
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
          </select>
        </label>
      </div>
    </section>
  );
}
