const TOOL_ITEMS = [
  { key: 'select', label: 'Select' },
  { key: 'text', label: 'Text' },
  { key: 'rectangle', label: 'Rectangle' },
  { key: 'circle', label: 'Circle' },
  { key: 'line', label: 'Line' }
];

export default function EditorToolbar({
  activeTool,
  onSelectTool,
  onGenerateMenu,
  onAutoArrange,
  onAddPage,
  onResetDesign,
  onDownloadSvg,
  onDownloadPptx,
  onDownloadPdf
}) {
  const secondaryButton =
    'rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100';

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 bg-white px-5 py-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-stone-800">Smart Menu Designer</h1>
        <p className="text-xs text-stone-500">Illustrator-style menu editor</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-2 flex items-center gap-1 rounded-md border border-stone-300 bg-stone-50 p-1">
          {TOOL_ITEMS.map((tool) => (
            <button
              key={tool.key}
              type="button"
              onClick={() => onSelectTool(tool.key)}
              className={`rounded px-2 py-1 text-xs font-semibold ${
                activeTool === tool.key
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>

        <button
          onClick={onGenerateMenu}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Generate Menu
        </button>
        <button
          onClick={onAutoArrange}
          className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
        >
          Auto Arrange
        </button>
        <button onClick={onAddPage} className={secondaryButton}>
          Add Page
        </button>
        <button onClick={onResetDesign} className={secondaryButton}>
          Reset Design
        </button>
        <button onClick={onDownloadSvg} className={secondaryButton}>
          Download SVG
        </button>
        <button onClick={onDownloadPptx} className={secondaryButton}>
          Download PPTX
        </button>
        <button onClick={onDownloadPdf} className={secondaryButton}>
          Download PDF
        </button>
      </div>
    </header>
  );
}
