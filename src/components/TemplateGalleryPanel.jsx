export default function TemplateGalleryPanel({ templates, selectedTemplateId, onSelectTemplate }) {
  return (
    <section className="rounded-lg border border-stone-300 bg-white p-3">
      <h3 className="mb-2 text-sm font-semibold text-stone-800">Template Gallery</h3>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`rounded-lg border p-2 text-left transition ${
              selectedTemplateId === template.id
                ? 'border-amber-700 bg-amber-50'
                : 'border-stone-300 bg-white hover:bg-stone-50'
            }`}
          >
            <div
              className="mb-2 h-16 rounded"
              style={{
                background: template.thumbnail?.background || '#f5f5f4',
                border: `1px solid ${template.thumbnail?.border || '#d6d3d1'}`
              }}
            >
              <div
                className="pt-2 text-center text-[10px]"
                style={{
                  fontFamily: template.thumbnail?.titleFont || 'serif',
                  color: template.thumbnail?.text || '#1f2937'
                }}
              >
                MENU
              </div>
              <div className="mx-3 mt-2 h-[1px]" style={{ background: template.thumbnail?.divider || '#9ca3af' }} />
              <div className="mx-3 mt-2 h-[1px]" style={{ background: template.thumbnail?.divider || '#9ca3af' }} />
            </div>
            <div className="text-[11px] font-semibold text-stone-700">{template.name}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
