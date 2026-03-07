import { forwardRef, useEffect, useRef, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

function toTranslate(transform) {
  if (!transform) {
    return undefined;
  }
  return `translate3d(${transform.x}px, ${transform.y}px, 0)`;
}

function CanvasElementHandle({ element, scaleX, scaleY, selected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-el-${element.id}`,
    data: {
      kind: 'canvas-element',
      elementId: element.id
    }
  });

  const left = element.x * scaleX;
  const top = element.y * scaleY;
  const width = Math.max(12, element.width * scaleX);
  const height = Math.max(12, element.height * scaleY);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseDown={(event) => {
        event.stopPropagation();
        onSelect(element.id);
      }}
      className="pointer-events-auto absolute"
      style={{
        left,
        top,
        width,
        height,
        transform: toTranslate(transform),
        touchAction: 'none'
      }}
    >
      <div
        className={`h-full w-full border-2 ${selected ? 'border-amber-600' : 'border-transparent'} ${
          isDragging ? 'opacity-50' : 'opacity-100'
        }`}
        style={{ transform: `rotate(${element.rotation}deg)` }}
      />
    </div>
  );
}

const PreviewPanel = forwardRef(function PreviewPanel(
  { svgMarkup, page, placedElements, selectedElementId, onSelectElement, onCanvasMetrics, snapToGrid },
  forwardedRef
) {
  const wrapperRef = useRef(null);
  const hostRef = useRef(null);
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: 'preview-canvas' });
  const [scale, setScale] = useState({ x: 1, y: 1 });

  useEffect(() => {
    const syncMetrics = () => {
      const svg = hostRef.current?.querySelector('svg');
      if (!svg || !onCanvasMetrics) {
        return;
      }
      const rect = svg.getBoundingClientRect();
      const nextScale = {
        x: rect.width / page.width,
        y: rect.height / page.height
      };

      setScale(nextScale);
      onCanvasMetrics({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        scaleX: nextScale.x,
        scaleY: nextScale.y
      });
    };

    syncMetrics();

    const resizeObserver = new ResizeObserver(syncMetrics);
    const svg = hostRef.current?.querySelector('svg');
    if (svg) {
      resizeObserver.observe(svg);
    }

    window.addEventListener('resize', syncMetrics);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncMetrics);
    };
  }, [svgMarkup, page.width, page.height, onCanvasMetrics]);

  return (
    <div className="mx-auto w-full max-w-[1200px] rounded-xl border border-stone-300 bg-white/80 p-3 shadow-2xl">
      <div className="overflow-auto leading-none">
        <div
          ref={(node) => {
            wrapperRef.current = node;
            setDroppableRef(node);
          }}
          className={`relative mx-auto inline-block ${isOver ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}
          onMouseDown={() => onSelectElement(null)}
        >
          <div
            ref={(node) => {
              hostRef.current = node;
              if (typeof forwardedRef === 'function') {
                forwardedRef(node);
              } else if (forwardedRef) {
                forwardedRef.current = node;
              }
            }}
            className="[&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />

          <div className="pointer-events-none absolute inset-0">
            {snapToGrid && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)',
                  backgroundSize: `${Math.max(8, 20 * scale.x)}px ${Math.max(8, 20 * scale.y)}px`
                }}
              />
            )}

            {placedElements.map((element) => (
              <CanvasElementHandle
                key={element.id}
                element={element}
                scaleX={scale.x}
                scaleY={scale.y}
                selected={selectedElementId === element.id}
                onSelect={onSelectElement}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default PreviewPanel;
