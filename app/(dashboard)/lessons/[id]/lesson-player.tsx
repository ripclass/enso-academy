'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Volume2, VolumeX, Hand, ArrowLeft, ArrowRight, CornerDownLeft } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Mascot } from '@/components/brand/mascot'
import { askLecturer, completeLesson, recordQuizEvidence, updateListenModePreference } from '@/lib/lesson/actions'
import { checkClassmateGap } from '@/lib/classmate/actions'
import { SceneRenderer } from '@/components/lesson/scenes/scene-renderer'
import { sceneContext, type Scene, type SceneType, type QuizQuestion } from '@/lib/lesson/scenes'
import { toast } from 'sonner'

type Lesson = {
  id: string
  name: string
  description: string | null
  learning_objectives: string[]
  estimated_minutes: number | null
  module: {
    name: string
    course: { slug: string; short_name: string }
  }
}

type Message = {
  role: 'student' | 'lecturer' | 'classmate'
  content: string
  fromCache?: boolean
  audioUrl?: string
  classmateName?: string
}

type Props = {
  sessionId: string
  lesson: Lesson
  scenes: Scene[]
  courseId: string
  courseSlug: string
  lecturerOpening?: string | null
}

type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

const SCENE_LABEL: Record<SceneType, string> = {
  reading: 'Reading',
  slide: 'Slide',
  quiz: 'Knowledge check',
  interactive: 'Interactive',
  pbl: 'Project',
}

export function LessonPlayer({ sessionId, lesson, scenes, courseId, courseSlug, lecturerOpening }: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [messages, setMessages] = useState<Message[]>(
    lecturerOpening ? [{ role: 'lecturer', content: lecturerOpening }] : [],
  )
  const [questionInput, setQuestionInput] = useState('')
  const [askingQuestion, setAskingQuestion] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [listenMode, setListenMode] = useState(false)
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('idle')
  const conversationRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Tracks what the audio element is currently playing, so that a finished
  // Q&A answer does not auto-advance the lesson like a finished narration does.
  const audioSource = useRef<'scene' | 'qa'>('scene')
  // The classmate fires at most once per session; this guards the client side
  // (the checkClassmateGap action also enforces the cap server-side).
  const classmateFired = useRef(false)
  const [classmatePending, setClassmatePending] = useState(false)

  const currentScene = scenes[currentIndex]
  const isLast = currentIndex === scenes.length - 1

  // Auto-scroll the conversation when new messages arrive
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [messages])

  // Listen mode: load + play the current scene's narration when the scene
  // changes, or when listen mode is switched on.
  useEffect(() => {
    if (!listenMode) return
    const audio = audioRef.current
    if (!audio) return
    const url = currentScene?.audioUrl
    if (!url) {
      setAudioStatus('idle')
      return
    }
    audioSource.current = 'scene'
    audio.src = url
    audio.play().catch((err) => {
      console.error('Audio play failed:', err)
      setAudioStatus('error')
    })
  }, [currentIndex, listenMode, currentScene])

  // Persist the Listen-mode preference (debounced; non-critical).
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void updateListenModePreference(listenMode).catch(() => {})
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [listenMode])

  // Lesson context for grounding the lecturer / classmate — the current scene
  // plus its immediate neighbours, as plain text.
  function buildContext(centerIndex: number) {
    const window = scenes.slice(Math.max(0, centerIndex - 1), Math.min(scenes.length, centerIndex + 2))
    const lessonContext = window.map((s) => sceneContext(s)).join('\n\n---\n\n')
    const conceptTags = [
      ...new Set(window.flatMap((s) => [...s.conceptTags, ...s.teachesConcepts])),
    ]
    return { lessonContext, conceptTags }
  }

  // After the student advances past a scene, give the classmate a chance to
  // raise a hand about a concept that scene taught and the student is weak on.
  async function runClassmateCheck(taughtIndex: number) {
    if (classmateFired.current) return
    const taught = scenes[taughtIndex]
    if (!taught) return
    const taughtConceptTags = [...new Set([...taught.conceptTags, ...taught.teachesConcepts])]
    if (taughtConceptTags.length === 0) return

    const { lessonContext } = buildContext(taughtIndex)
    const askedQuestions = messages.filter((m) => m.role === 'student').map((m) => m.content)

    setClassmatePending(true)
    try {
      const result = await checkClassmateGap({
        sessionId,
        lessonId: lesson.id,
        courseId,
        taughtConceptTags,
        lessonContext,
        askedQuestions,
      })
      if (result.fired && result.question && result.answer) {
        classmateFired.current = true
        setMessages((prev) => [
          ...prev,
          { role: 'classmate', content: result.question!, classmateName: result.classmateName },
          { role: 'lecturer', content: result.answer! },
        ])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setClassmatePending(false)
    }
  }

  function goNext() {
    if (currentIndex < scenes.length - 1) {
      const taughtIndex = currentIndex
      setCurrentIndex(currentIndex + 1)
      void runClassmateCheck(taughtIndex)
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  function toggleListenMode() {
    const newMode = !listenMode
    setListenMode(newMode)
    if (!newMode && audioRef.current) {
      audioRef.current.pause()
    }
  }

  // A quiz-scene answer feeds the student knowledge model (same model the mock
  // engine writes to). Fire-and-forget — never blocks the UI.
  function handleQuizAnswer(question: QuizQuestion, _selectedOptionId: string, correct: boolean) {
    void recordQuizEvidence({
      courseId,
      conceptTags: question.conceptTags ?? [],
      correct,
    }).catch(() => {})
  }

  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!questionInput.trim() || askingQuestion) return

    const question = questionInput.trim()
    setQuestionInput('')
    setMessages((prev) => [...prev, { role: 'student', content: question }])
    setAskingQuestion(true)

    try {
      const { lessonContext, conceptTags } = buildContext(currentIndex)

      const result = await askLecturer({
        sessionId,
        lessonId: lesson.id,
        courseId,
        question,
        lessonContext,
        conceptTags,
        listenMode,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'lecturer',
          content: result.answer,
          fromCache: result.fromCache,
          audioUrl: result.audioUrl,
        },
      ])

      // Speak the lecturer's answer if listen mode produced audio.
      if (result.audioUrl && audioRef.current) {
        audioSource.current = 'qa'
        audioRef.current.src = result.audioUrl
        audioRef.current.play().catch(() => {})
      }
    } catch (err) {
      toast.error('Could not reach the lecturer. Try again.')
      console.error(err)
    } finally {
      setAskingQuestion(false)
    }
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      await completeLesson(sessionId, lesson.id)
      toast.success('Lesson complete')
      router.push(`/courses/${courseSlug}`)
    } catch (err) {
      toast.error('Could not save lesson completion.')
      console.error(err)
      setCompleting(false)
    }
  }

  const audioStatusLabel: Record<AudioStatus, string> = {
    idle: 'Ready',
    loading: 'Loading audio…',
    playing: 'Playing',
    paused: 'Paused',
    ended: 'Finished',
    error: 'Audio unavailable for this section',
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Hidden audio element — drives both narration and Q&A playback. */}
      <audio
        ref={audioRef}
        onPlay={() => setAudioStatus('playing')}
        onPlaying={() => setAudioStatus('playing')}
        onTimeUpdate={() => {
          // Catch-all: once playback is actually progressing, the status is
          // 'playing' — reliable even if a discrete play/playing event is missed.
          if (audioRef.current && !audioRef.current.paused) {
            setAudioStatus((s) => (s === 'playing' ? s : 'playing'))
          }
        }}
        onPause={() => setAudioStatus('paused')}
        onEnded={() => {
          setAudioStatus('ended')
          // Auto-advance only when narration (not a Q&A answer) finishes.
          if (audioSource.current === 'scene' && listenMode && currentIndex < scenes.length - 1) {
            setCurrentIndex(currentIndex + 1)
          }
        }}
        onError={() => setAudioStatus('error')}
        onLoadStart={() => setAudioStatus('loading')}
      />

      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <Link href="/dashboard" aria-label="Enso Academy">
              <Logo variant="mark-only" />
            </Link>
            <div className="text-sm text-neutral-500 truncate">
              <Link href={`/courses/${courseSlug}`} className="font-medium hover:text-primary transition-colors">
                {lesson.module.course.short_name}
              </Link>
              <span className="mx-2 text-neutral-300">/</span>
              {lesson.module.name}
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={toggleListenMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                listenMode
                  ? 'bg-primary text-white'
                  : 'border border-neutral-200 text-neutral-600 hover:text-primary'
              }`}
            >
              {listenMode ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              {listenMode ? 'Listen on' : 'Listen off'}
            </button>
            <Link
              href={`/courses/${courseSlug}`}
              className="text-sm font-medium text-neutral-500 hover:text-primary transition-colors"
            >
              Exit
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Lesson content */}
        <div className="space-y-6">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
              Lesson
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">{lesson.name}</h1>
            {lesson.description && (
              <p className="mt-1.5 text-sm text-neutral-500">{lesson.description}</p>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-3">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                {currentScene ? SCENE_LABEL[currentScene.sceneType] : ''}
              </span>
              <span className="text-2xs font-mono text-neutral-400 tabular-nums">
                {currentIndex + 1} / {scenes.length}
              </span>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              {currentScene ? (
                <SceneRenderer scene={currentScene} onQuizAnswer={handleQuizAnswer} />
              ) : (
                <p className="text-sm text-neutral-500">This lesson has no content yet.</p>
              )}

              {listenMode && (
                <div className="flex items-center gap-3 text-2xs font-mono text-neutral-400 pt-3 border-t border-neutral-100">
                  <span>{audioStatusLabel[audioStatus]}</span>
                  {audioStatus === 'playing' && (
                    <button type="button" onClick={() => audioRef.current?.pause()} className="hover:text-primary">
                      Pause
                    </button>
                  )}
                  {audioStatus === 'paused' && (
                    <button type="button" onClick={() => audioRef.current?.play()} className="hover:text-primary">
                      Resume
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={handleComplete}
                disabled={completing}
                className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
              >
                {completing ? 'Saving…' : 'Complete lesson'}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Lecturer Q&A panel */}
        <div className="lg:sticky lg:top-8 self-start">
          <div className="rounded-lg border border-neutral-200 bg-white flex flex-col h-[640px] overflow-hidden">
            {/* Panel header — the Enso Guide */}
            <div className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4 shrink-0">
              <Mascot variant="default" size={40} className="shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Enso Guide</h2>
                <p className="text-2xs font-mono text-neutral-400">Personalized AI lecturer</p>
              </div>
            </div>

            {/* Socratic transcript */}
            <div ref={conversationRef} className="flex-1 overflow-y-auto p-5 space-y-5">
              {messages.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-8">
                  Ask anything about what you just read.
                </p>
              ) : (
                messages.map((msg, i) => {
                  const isClassmate = msg.role === 'classmate'
                  const isLecturer = msg.role === 'lecturer'
                  const label =
                    msg.role === 'student'
                      ? 'You'
                      : isClassmate
                        ? msg.classmateName ?? 'Classmate'
                        : 'Lecturer'
                  const labelColor = isClassmate
                    ? 'text-accent'
                    : isLecturer
                      ? 'text-primary'
                      : 'text-neutral-500'
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        {isClassmate && <Hand className="h-3 w-3 text-accent" />}
                        <span
                          className={`text-2xs font-bold uppercase tracking-widest font-mono ${labelColor}`}
                        >
                          {label}
                        </span>
                      </div>
                      {isLecturer ? (
                        <div className="text-sm leading-relaxed text-neutral-800 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p
                          className={`text-sm leading-relaxed whitespace-pre-wrap ${
                            isClassmate ? 'italic text-neutral-700' : 'text-neutral-800'
                          }`}
                        >
                          {msg.content}
                        </p>
                      )}
                      {isLecturer && (msg.fromCache || msg.audioUrl) && (
                        <div className="flex gap-2 text-2xs font-mono text-neutral-400">
                          {msg.fromCache && <span>cached</span>}
                          {msg.audioUrl && <span>spoken</span>}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
              {askingQuestion && (
                <p className="text-2xs font-mono text-neutral-400">Lecturer is thinking…</p>
              )}
              {classmatePending && (
                <p className="flex items-center gap-1.5 text-2xs font-mono text-accent">
                  <Hand className="h-3 w-3" /> A classmate is raising their hand…
                </p>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleAskQuestion} className="border-t border-neutral-200 p-3 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask the Enso Guide a question…"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  disabled={askingQuestion}
                  className="w-full rounded-md border border-neutral-200 bg-white py-2.5 pl-3 pr-11 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary focus:outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={askingQuestion || !questionInput.trim()}
                  aria-label="Ask"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-40"
                >
                  <CornerDownLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
