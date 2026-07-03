'use client'

import { asInteractiveSpec, asPblSpec, type Scene, type QuizQuestion, type PblSpec } from '@/lib/lesson/scenes'
import { ReadingScene } from './reading-scene'
import { SlideScene } from './slide-scene'
import { QuizScene } from './quiz-scene'
import { PlaceholderScene } from './placeholder-scene'
import { InteractiveScene } from './interactive-scene'
import { ProjectScene } from './pbl/project-scene'

/**
 * Renders a single lesson scene by type. The one entry point the lesson player
 * uses — it switches on the discriminated `Scene` union.
 */
export function SceneRenderer({
  scene,
  onQuizAnswer,
  onQuizContinue,
  onInteractiveComplete,
  onGradeProject,
  onSpeak,
  caseSeed,
  revealed,
}: {
  scene: Scene
  onQuizAnswer?: (question: QuizQuestion, selectedOptionId: string, correct: boolean) => void
  /** Advance past a fully-answered quiz scene (renders its Continue button). */
  onQuizContinue?: () => void
  onInteractiveComplete?: (conceptTags: string[], correct: boolean) => void
  onGradeProject?: (spec: PblSpec, submission: string) => Promise<{ band: string; feedback: string }>
  /** Narrate widget-driven text through the lesson's voice (case-file cards). */
  onSpeak?: (text: string) => void
  /** Per-visit variant seed (case-file rotation across retakes). */
  caseSeed?: string
  /** Progressive reveal count for slide scenes (driven by narration progress). */
  revealed?: number
}) {
  switch (scene.sceneType) {
    case 'reading':
      return <ReadingScene title={scene.title} data={scene.data} />
    case 'slide':
      return <SlideScene data={scene.data} revealed={revealed} />
    case 'quiz':
      return <QuizScene data={scene.data} onAnswer={onQuizAnswer} onContinue={onQuizContinue} />
    case 'interactive': {
      const spec = asInteractiveSpec(scene.data.spec)
      if (spec) {
        const report = (correct: number, total: number) =>
          onInteractiveComplete?.(scene.conceptTags ?? [], total > 0 && correct / total >= 0.6)
        return (
          <InteractiveScene
            title={scene.data.title}
            summary={scene.data.summary}
            spec={spec}
            onComplete={report}
            onContinue={onQuizContinue}
            onSpeak={onSpeak}
            seed={caseSeed}
          />
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
    case 'challenge':
      // The lesson player renders the LessonChallenge for this scene type
      // directly (it needs courseId/lessonId + the knowledge-write path), so the
      // renderer never reaches here in practice.
      return null
  }
}
