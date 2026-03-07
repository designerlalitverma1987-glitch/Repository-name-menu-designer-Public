function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-stone-300 bg-white p-3">
      <h3 className="mb-2 text-sm font-semibold text-stone-800">{title}</h3>
      {children}
    </section>
  );
}

export default function MenuInputPanel({
  menuTitle,
  setMenuTitle,
  menuText,
  setMenuText,
  parsedMenu,
  manualTypes,
  setManualTypes,
  onGenerateDemo
}) {
  const items = parsedMenu.categories.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryName: category.name
    }))
  );

  return (
    <div className="grid gap-3">
      <Section title="Menu Input">
        <div className="grid gap-2">
          <label className="grid gap-1 text-xs">
            <span className="text-stone-700">Menu Title</span>
            <input
              type="text"
              className="rounded border border-stone-300 px-2 py-1"
              value={menuTitle}
              onChange={(event) => setMenuTitle(event.target.value)}
              placeholder="Restaurant Menu"
            />
          </label>

          <label className="grid gap-1 text-xs">
            <span className="text-stone-700">Paste Menu Text</span>
            <textarea
              className="h-64 resize-y rounded border border-stone-300 p-2 font-mono text-xs"
              value={menuText}
              onChange={(event) => setMenuText(event.target.value)}
              placeholder="Category: Starters&#10;Paneer Tikka - 180"
            />
          </label>

          <button
            onClick={onGenerateDemo}
            className="rounded bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            Generate Demo Menu
          </button>
        </div>
      </Section>

      <Section title="Veg / Non-Veg Manual Override">
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {items.length === 0 && <p className="text-xs text-stone-500">No items detected yet.</p>}
          {items.map((item) => (
            <div key={item.id} className="rounded border border-stone-200 bg-stone-50 p-2 text-xs">
              <div className="truncate font-medium text-stone-800">{item.name}</div>
              <div className="mb-1 truncate text-[11px] text-stone-500">{item.categoryName}</div>
              <select
                className="w-full rounded border border-stone-300 px-2 py-1"
                value={manualTypes[item.id] || 'auto'}
                onChange={(event) =>
                  setManualTypes((prev) => ({
                    ...prev,
                    [item.id]: event.target.value
                  }))
                }
              >
                <option value="auto">Auto ({item.type === 'nonveg' ? 'Non-Veg' : 'Veg'})</option>
                <option value="veg">Veg</option>
                <option value="nonveg">Non-Veg</option>
              </select>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
