import { useDraggable } from '@dnd-kit/core';
import { ICON_GROUPS } from '../data/designAssets';

function transformToString(transform) {
  if (!transform) {
    return undefined;
  }
  return `translate3d(${transform.x}px, ${transform.y}px, 0)`;
}

function IconPreview({ icon }) {
  return (
    <svg viewBox={icon.viewBox} className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icon.nodes.map((node, index) => {
        const [tag, attrs] = node;
        if (tag === 'path') return <path key={index} {...attrs} />;
        if (tag === 'circle') return <circle key={index} {...attrs} />;
        if (tag === 'polygon') return <polygon key={index} {...attrs} />;
        if (tag === 'rect') return <rect key={index} {...attrs} />;
        return null;
      })}
    </svg>
  );
}

function DraggableIcon({ icon }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `icon-${icon.id}`,
    data: {
      kind: 'library-asset',
      asset: {
        library: 'icon',
        assetId: icon.id,
        name: icon.name,
        width: 38,
        height: 38,
        color: '#111827',
        rotation: 0,
        opacity: 1,
        layer: 'above'
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
      <IconPreview icon={icon} />
      <span className="truncate">{icon.name}</span>
    </button>
  );
}

export default function IconLibraryPanel({ icons }) {
  return (
    <section className="rounded-lg border border-stone-300 bg-white p-3">
      <h3 className="mb-2 text-sm font-semibold text-stone-800">ICON LIBRARY</h3>
      <div className="space-y-3">
        {ICON_GROUPS.map((group) => {
          const groupedIcons = icons.filter((icon) => icon.group === group);
          if (groupedIcons.length === 0) {
            return null;
          }

          return (
            <div key={group}>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">{group}</div>
              <div className="grid grid-cols-3 gap-2">
                {groupedIcons.map((icon) => (
                  <DraggableIcon key={icon.id} icon={icon} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
