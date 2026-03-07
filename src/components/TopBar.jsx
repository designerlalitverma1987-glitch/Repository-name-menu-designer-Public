export default function TopBar({
  onGenerateDesign,
  onDownloadSvg,
  onDownloadPptx,
  onDownloadPdf
}) {
  return (
    <header className="flex items-center justify-between border-b border-stone-300 bg-white px-5 py-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-stone-800">Smart Menu Designer</h1>
        <p className="text-xs text-stone-500">Canva-style restaurant menu generator</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onGenerateDesign}
          className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
        >
          Generate Menu
        </button>
        <button
          onClick={onDownloadSvg}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Download SVG
        </button>
        <button
          onClick={onDownloadPptx}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Download PPTX
        </button>
        <button
          onClick={onDownloadPdf}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Download PDF
        </button>
      </div>
    </header>
  );
}
