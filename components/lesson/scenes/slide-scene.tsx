import type { SlideSceneData, SlideItem } from '@/lib/lesson/scenes'

/** `slide` scene — a designed slide. The layout is selected by `data.template`. */
export function SlideScene({ data }: { data: SlideSceneData }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">{data.heading}</h2>
        {data.subheading && <p className="text-sm text-muted-foreground">{data.subheading}</p>}
      </div>
      <SlideBody data={data} />
    </div>
  )
}

function SlideBody({ data }: { data: SlideSceneData }) {
  const items = data.items ?? []

  switch (data.template) {
    case 'key-points':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="flex gap-2.5">
                {item.icon && <span className="text-lg leading-none">{item.icon}</span>}
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
          <div className="rounded-lg border-l-4 border-accent bg-accent/5 p-5">
            <p className="text-base leading-relaxed text-foreground">{items[0]?.text}</p>
          </div>
          {items.slice(1).map((item, i) => (
            <p key={i} className="text-sm text-muted-foreground leading-relaxed">
              {item.label && <span className="font-semibold text-foreground">{item.label}: </span>}
              {item.text}
            </p>
          ))}
        </div>
      )

    case 'comparison': {
      // Group items into columns by their `label` (the column heading).
      const columns: { label: string; items: SlideItem[] }[] = []
      for (const item of items) {
        const key = item.label ?? '—'
        let col = columns.find((c) => c.label === key)
        if (!col) {
          col = { label: key, items: [] }
          columns.push(col)
        }
        col.items.push(item)
      }
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {columns.map((col, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="mb-2 font-semibold text-primary">{col.label}</div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {col.items.map((item, j) => (
                  <li key={j} className="leading-relaxed">
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
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-lg font-medium leading-relaxed text-primary">
            {items[0]?.text ?? data.heading}
          </p>
        </div>
      )

    default:
      return null
  }
}
