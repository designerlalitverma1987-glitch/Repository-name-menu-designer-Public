import { useDraggable } from '@dnd-kit/core';
import { ELEMENT_GROUPS } from '../data/designAssets';

function transformToString(transform) {
  if (!transform) {
    return undefined;
  }
  return `translate3d(${transform.x}px, ${transform.y}px, 0)`;
}

function ElementGlyph({ element }) {
  const common = { stroke: 'currentColor', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

  if (element.elementType === 'line') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <line x1="3" y1="12" x2="21" y2="12" {...common} />
      </svg>
    );
  }

  if (element.elementType === 'divider') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <line x1="2" y1="12" x2="22" y2="12" {...common} strokeDasharray="2 3" />
      </svg>
    );
  }

  if (element.elementType === 'rect') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <rect x="4" y="6" width="16" height="12" rx="2" {...common} />
      </svg>
    );
  }

  if (element.elementType === 'badge') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <circle cx="12" cy="12" r="8" {...common} />
      </svg>
    );
  }

  if (element.elementType === 'leaf') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14Z" {...common} />
      </svg>
    );
  }

  if (element.elementType === 'separator') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path d="M2 12c3-4 5 4 8 0s5 4 8 0 4 4 4 0" {...common} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <polygon points="12 3 15 10 22 10 16.5 14.5 18.5 21 12 16.8 5.5 21 7.5 14.5 2 10 9 10" {...common} />
    </svg>
  );
}

function DraggableElement({ element }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `element-${element.id}`,
    data: {
      kind: 'library-asset',
      asset: {
        library: 'element',
        assetId: element.id,
        name: element.name,
        width: element.defaultWidth,
        height: element.defaultHeight,
        color: element.defaultColor,
        rotation: 0,
        opacity: 1,
        layer: 'above',
        elementType: element.elementType
      }
    }
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      style={{ transform: transformToString(transform) }}
      className={`flex flex-col items-center gap-1 rounded border border-stone-300 bg-white p-2 text-[10px] text-stone-700 hover:bg-stone-100 ${
        isDragging ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <ElementGlyph element={element} />
      <span className="truncate">{element.name}</span>
    </button>
  );
}

export default function ElementsPanel({ elements }) {
  return (
    <section className="rounded-lg border border-stone-300 bg-white p-3">
      <h3 className="mb-2 text-sm font-semibold text-stone-800">ELEMENTS</h3>
      <div className="space-y-3">
        {ELEMENT_GROUPS.map((group) => {
          const groupElements = elements.filter((item) => item.group === group);
          if (groupElements.length === 0) {
            return null;
          }

          return (
            <div key={group}>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">{group}</div>
              <div className="grid grid-cols-3 gap-2">
                {groupElements.map((element) => (
                  <DraggableElement key={element.id} element={element} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
