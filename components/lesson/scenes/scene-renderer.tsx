'use client'

import type { Scene, QuizQuestion } from '@/lib/lesson/scenes'
import { ReadingScene } from './reading-scene'
import { SlideScene } from './slide-scene'
import { QuizScene } from './quiz-scene'
import { PlaceholderScene } from './placeholder-scene'

/**
 * Renders a single lesson scene by type. The one entry point the lesson player
 * uses — it switches on the discriminated `Scene` union.
 */
export function SceneRenderer({
  scene,
  onQuizAnswer,
}: {
  scene: Scene
  onQuizAnswer?: (question: QuizQuestion, selectedOptionId: string, correct: boolean) => void
}) {
  switch (scene.sceneType) {
    case 'reading':
      return <ReadingScene title={scene.title} data={scene.data} />
    case 'slide':
      return <SlideScene data={scene.data} />
    case 'quiz':
      return <QuizScene data={scene.data} onAnswer={onQuizAnswer} />
    case 'interactive':
      return <PlaceholderScene kind="interactive" data={scene.data} />
    case 'pbl':
      return <PlaceholderScene kind="pbl" data={scene.data} />
  }
}
