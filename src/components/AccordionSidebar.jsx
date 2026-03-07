function AccordionSection({ title, isOpen, onToggle, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-300 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="text-sm font-semibold text-stone-800">{title}</span>
        <span className="text-lg leading-none text-stone-500">{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <div className="border-t border-stone-200 p-3">{children}</div>}
    </section>
  );
}

export default function AccordionSidebar({ sections, openKey, setOpenKey }) {
  return (
    <aside className="w-[370px] shrink-0 space-y-3 overflow-y-auto border-r border-stone-300 bg-stone-50 p-3">
      {sections.map((section) => (
        <AccordionSection
          key={section.key}
          title={section.title}
          isOpen={openKey === section.key}
          onToggle={() => setOpenKey(section.key === openKey ? '' : section.key)}
        >
          {section.content}
        </AccordionSection>
      ))}
    </aside>
  );
}
