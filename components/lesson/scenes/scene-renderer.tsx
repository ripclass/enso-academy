'use client'

import { asInteractiveSpec, asPblSpec, type Scene, type QuizQuestion, type PblSpec } from '@/lib/lesson/scenes'
import { ReadingScene } from './reading-scene'
import { SlideScene } from './slide-scene'
import { QuizScene } from './quiz-scene'
import { PlaceholderScene } from './placeholder-scene'
import { RiskClassify } from './interactives/risk-classify'
import { ProjectScene } from './pbl/project-scene'

/**
 * Renders a single lesson scene by type. The one entry point the lesson player
 * uses — it switches on the discriminated `Scene` union.
 */
export function SceneRenderer({
  scene,
  onQuizAnswer,
  onInteractiveComplete,
  onGradeProject,
  revealed,
}: {
  scene: Scene
  onQuizAnswer?: (question: QuizQuestion, selectedOptionId: string, correct: boolean) => void
  onInteractiveComplete?: (conceptTags: string[], correct: boolean) => void
  onGradeProject?: (spec: PblSpec, submission: string) => Promise<{ band: string; feedback: string }>
  /** Progressive reveal count for slide scenes (driven by narration progress). */
  revealed?: number
}) {
  switch (scene.sceneType) {
    case 'reading':
      return <ReadingScene title={scene.title} data={scene.data} />
    case 'slide':
      return <SlideScene data={scene.data} revealed={revealed} />
    case 'quiz':
      return <QuizScene data={scene.data} onAnswer={onQuizAnswer} />
    case 'interactive': {
      const spec = asInteractiveSpec(scene.data.spec)
      if (spec?.kind === 'risk-classify') {
        return (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-primary">{scene.data.title}</h2>
              {scene.data.summary && <p className="text-sm text-muted-foreground">{scene.data.summary}</p>}
            </div>
            <RiskClassify
              prompt={spec.prompt}
              items={spec.items}
              onComplete={(correct, total) =>
                onInteractiveComplete?.(scene.conceptTags ?? [], total > 0 && correct / total >= 0.6)
              }
            />
          </div>
        )
      }
      return <PlaceholderScene kind="interactive" data={scene.data} />
    }
    case 'pbl': {
      const pbl = asPblSpec(scene.data.spec)
      if (pbl && onGradeProject) {
        return (
          <ProjectScene
            title={scene.data.title}
            summary={scene.data.summary}
            spec={pbl}
            onGrade={onGradeProject}
          />
        )
      }
      return <PlaceholderScene kind="pbl" data={scene.data} />
    }
  }
}
