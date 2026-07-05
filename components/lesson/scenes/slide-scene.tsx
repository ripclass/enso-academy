import type { SlideSceneData, SlideItem } from '@/lib/lesson/scenes'

/**
 * `slide` scene — a designed slide. The layout is selected by `data.template`.
 *
 * `revealed` controls progressive disclosure: only the first `revealed` items
 * are shown (the rest are present but transparent, so layout never shifts).
 * The player drives `revealed` from narration playback progress, so a slide
 * "builds as the lecturer speaks". Defaults to all-revealed when omitted.
 */
export function SlideScene({ data, revealed }: { data: SlideSceneData; revealed?: number }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">{data.heading}</h2>
        {data.subheading && <p className="text-sm text-muted-foreground">{data.subheading}</p>}
      </div>
      <SlideBody data={data} revealed={revealed ?? Infinity} />
    </div>
  )
}

/** Reveal transition for the item at index `i` given how many are revealed. */
function revealCls(i: number, revealed: number): string {
  const shown = i < revealed
  return `transition-all duration-500 ease-out ${
    shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
  }`
}

function SlideBody({ data, revealed }: { data: SlideSceneData; revealed: number }) {
  const items = data.items ?? []

  switch (data.template) {
    case 'key-points':
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <div
              key={i}
              className={`rounded-lg border border-border bg-card p-4 ${revealCls(i, revealed)}`}
            >
              <div className="flex gap-3">
                {item.icon ? (
                  <span className="text-lg leading-none">{item.icon}</span>
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                )}
                <div className="space-y-0.5">
                  {item.label && <div className="font-semibold text-foreground">{item.label}</div>}
                  <div className="text-sm text-muted-foreground leading-relaxed">{item.text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )

    case 'definition':
      return (
        <div className="space-y-3">
          <div className={`rounded-lg border-l-4 border-accent bg-accent/5 p-5 ${revealCls(0, revealed)}`}>
            <p className="text-base leading-relaxed text-foreground">{items[0]?.text}</p>
          </div>
          {items.slice(1).map((item, i) => (
            <p
              key={i}
              className={`text-sm text-muted-foreground leading-relaxed ${revealCls(i + 1, revealed)}`}
            >
              {item.label && <span className="font-semibold text-foreground">{item.label}: </span>}
              {item.text}
            </p>
          ))}
        </div>
      )

    case 'comparison': {
      // Group items into columns by their `label` (the column heading). Reveal
      // is tracked across the flat item order so columns fill in reading order.
      const columns: { label: string; items: { item: SlideItem; index: number }[] }[] = []
      items.forEach((item, index) => {
        const key = item.label ?? '—'
        let col = columns.find((c) => c.label === key)
        if (!col) {
          col = { label: key, items: [] }
          columns.push(col)
        }
        col.items.push({ item, index })
      })
      // Fit the grid to the number of columns so three jurisdictions do not sit
      // in a 2x2 with an empty fourth cell.
      const gridByCols: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-2 lg:grid-cols-3',
        4: 'sm:grid-cols-2 lg:grid-cols-4',
      }
      const gridCls = gridByCols[Math.min(4, columns.length)] ?? 'sm:grid-cols-2'
      return (
        <div className={`grid grid-cols-1 gap-4 ${gridCls}`}>
          {columns.map((col, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-border">
              <div className="border-b border-border bg-muted/50 px-4 py-2 font-semibold text-primary">
                {col.label}
              </div>
              <ul className="space-y-2 px-4 py-3 text-sm text-muted-foreground">
                {col.items.map(({ item, index }, j) => (
                  <li key={j} className={`leading-relaxed ${revealCls(index, revealed)}`}>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    }

    case 'callout':
      return (
        <div
          className={`rounded-lg border border-primary/20 bg-primary/5 p-6 text-center ${revealCls(0, revealed)}`}
        >
          <p className="text-lg font-medium leading-relaxed text-primary">
            {items[0]?.text ?? data.heading}
          </p>
        </div>
      )

    default:
      return null
  }
}
