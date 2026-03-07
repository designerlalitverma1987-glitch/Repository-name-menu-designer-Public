import { useMemo } from 'react';

function parseDropPayload(event) {
  const raw = event.dataTransfer.getData('application/json');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function FabricCanvasPanel({
  canvasRef,
  wrapperRef,
  page,
  snapToGrid,
  onDropAsset,
  activePageName
}) {
  const gridStyle = useMemo(() => {
    if (!snapToGrid) {
      return undefined;
    }

    return {
      backgroundImage:
        'linear-gradient(to right, rgba(15, 23, 42, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.1) 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    };
  }, [snapToGrid]);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-gradient-to-br from-stone-200 via-amber-50 to-stone-300 p-6">
      <div className="mb-3 flex items-center justify-between px-1 text-xs text-stone-600">
        <span className="rounded bg-white/70 px-2 py-1">Canvas Editor</span>
        <span className="rounded bg-white/70 px-2 py-1">{activePageName}</span>
      </div>

      <div className="mx-auto max-w-[1200px] rounded-xl border border-stone-300 bg-white/80 p-3 shadow-2xl">
        <div className="overflow-auto">
          <div
            ref={wrapperRef}
            className="relative mx-auto"
            style={{ width: page.width, height: page.height }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const payload = parseDropPayload(event);
              if (!payload || !onDropAsset) {
                return;
              }

              const rect = event.currentTarget.getBoundingClientRect();
              const x = event.clientX - rect.left;
              const y = event.clientY - rect.top;
              onDropAsset(payload, { x, y });
            }}
          >
            {snapToGrid && <div className="pointer-events-none absolute inset-0" style={gridStyle} />}
            <canvas ref={canvasRef} className="absolute inset-0 block" />
          </div>
        </div>
      </div>
    </main>
  );
}
