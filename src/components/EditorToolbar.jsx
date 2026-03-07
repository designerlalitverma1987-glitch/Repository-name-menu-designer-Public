export default function EditorToolbar({
  onGenerateMenu,
  onAutoArrange,
  onAddPage,
  onResetDesign,
  onDownloadSvg,
  onDownloadPng,
  onDownloadPptx,
  onDownloadPdf
}) {
  const secondaryButton =
    'rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100';

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 bg-white px-5 py-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-stone-800">Smart Menu Designer</h1>
        <p className="text-xs text-stone-500">Canva-style menu design editor</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
        <button onClick={onDownloadPng} className={secondaryButton}>
          Download PNG
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
