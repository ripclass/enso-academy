import type { PlaceholderSceneData } from '@/lib/lesson/scenes'

/**
 * `interactive` / `pbl` scenes — defined in the contract so the pipeline can
 * emit them, but rendered as a graceful placeholder in v1. The interactive
 * simulation and project runtimes are a fast-follow; the scene structure here
 * means no course needs regenerating when they ship.
 */
export function PlaceholderScene({
  kind,
  data,
}: {
  kind: 'interactive' | 'pbl'
  data: PlaceholderSceneData
}) {
  const label = kind === 'interactive' ? 'Interactive simulation' : 'Project-based activity'
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <h2 className="text-lg font-medium">{data.title}</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-5 text-center">
        <p className="text-sm text-muted-foreground">
          This {label.toLowerCase()} is part of the lesson and will be playable here soon.
        </p>
      </div>
    </div>
  )
}
