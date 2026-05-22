import ReactMarkdown from 'react-markdown'
import type { ReadingSceneData } from '@/lib/lesson/scenes'

/** `reading` scene — prose taught from primary sources, with visible citations. */
export function ReadingScene({ title, data }: { title: string | null; data: ReadingSceneData }) {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-lg font-medium">{title}</h2>}
      <div className="prose prose-sm max-w-none leading-relaxed text-foreground [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_h3]:font-medium [&_h3]:mt-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs">
        <ReactMarkdown>{data.body}</ReactMarkdown>
      </div>
      {data.citations && data.citations.length > 0 && (
        <div className="border-t border-border pt-3 space-y-1.5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Sources</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            {data.citations.map((c, i) => (
              <li key={i}>
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    {c.label}
                  </a>
                ) : (
                  c.label
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
