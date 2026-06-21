'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Hand, CornerDownLeft, ArrowLeft, MessageSquare, X, Play } from 'lucide-react'
import { askLecturer, completeLesson, recordQuizEvidence, updateListenModePreference, getSceneAudio, synthesizeText } from '@/lib/lesson/actions'
import { checkClassmateGap } from '@/lib/classmate/actions'
import { SceneRenderer } from '@/components/lesson/scenes/scene-renderer'
import { LecturerDock, NarrationBubble, LecturerAvatar, LECTURER_SEED } from '@/components/lesson/classroom/lecturer-presence'
import { TransportBar } from '@/components/lesson/classroom/transport-bar'
import { CastStrip, type CastMember } from '@/components/lesson/classroom/cast-strip'
import { ClassmateMoment, type MomentPhase } from '@/components/lesson/classroom/classmate-moment'
import { Avatar } from '@/components/lesson/classroom/avatar'
import { sceneContext, sceneNarration, suggestedQuestions, type Scene, type SceneType, type QuizQuestion } from '@/lib/lesson/scenes'
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

const SPEEDS = [1, 1.25, 1.5, 2]

// Classmate cadence: a hard cap per session, a cooldown of N scenes between
// fires, and the chance of an ambient (non-gap) question on an eligible scene.
const MAX_CLASSMATE_FIRES = 4
const CLASSMATE_COOLDOWN_SCENES = 2
const AMBIENT_CLASSMATE_CHANCE = 0.6

// What the lecturer says to register a raised hand before answering — so the
// lecture transitions instead of cutting off cold.
const BRIDGE_TEMPLATES = [
  (n: string) => `Hold on — it looks like ${n} has a question. Go ahead, ${n}.`,
  (n: string) => `Yes, ${n}? Let's hear it.`,
  (n: string) => `Let me pause there for a second. ${n}, go ahead.`,
  (n: string) => `Good timing — ${n} has a question.`,
]
const pickBridge = (name: string) =>
  BRIDGE_TEMPLATES[Math.floor(Math.random() * BRIDGE_TEMPLATES.length)](name)

// Estimated spoken duration of a line (~150 wpm), used when narration is muted.
const estimateMs = (text: string) =>
  Math.min(25000, Math.max(1200, Math.round((text.trim().split(/\s+/).length / 2.5) * 1000)))

// The classroom's peer cast — presence-only for now (a later pass wires them to
// speak on stage). The lecturer is separate (LecturerDock).
const CAST: CastMember[] = [
  { name: 'Priya' },
  { name: 'Marcus' },
  { name: 'Aisha' },
  { name: 'Daniel' },
  { name: 'Lena' },
  { name: 'Omar' },
]

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
  const [playbackRate, setPlaybackRate] = useState(1)
  const [hasStarted, setHasStarted] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatUnread, setChatUnread] = useState(false)
  const [speakingClassmate, setSpeakingClassmate] = useState<string | null>(null)
  // The on-stage classmate moment (a peer raises a hand, the lecturer answers).
  const [classmateMoment, setClassmateMoment] = useState<
    { name: string; question: string; answer: string; bridge: string } | null
  >(null)
  const [momentPhase, setMomentPhase] = useState<MomentPhase>('bridge')
  // How many slide items are revealed so far — driven by narration progress
  // when listening, or a gentle timed stagger when reading silently.
  const [revealedCount, setRevealedCount] = useState(1)
  const conversationRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Tracks what the audio element is currently playing, so that a finished
  // Q&A answer does not auto-advance the lesson like a finished narration does.
  const audioSource = useRef<'scene' | 'qa'>('scene')
  // Classmate-moment beat sequencing (bridge → question → answer).
  const momentOnEndRef = useRef<(() => void) | null>(null)
  const momentTimerRef = useRef<number | null>(null)
  // Resolved narration URLs per scene, seeded from any pre-generated audio.
  // Scenes without pre-gen are synthesized on demand and cached here + server-side.
  const audioUrlsRef = useRef<Record<string, string>>(
    Object.fromEntries(scenes.filter((s) => s.audioUrl).map((s) => [s.id, s.audioUrl as string])),
  )
  const inflightAudioRef = useRef<Record<string, Promise<string | null>>>({})

  // Return the narration URL for a scene, synthesizing it on first need.
  async function resolveSceneAudio(scene: Scene): Promise<string | null> {
    const cached = audioUrlsRef.current[scene.id]
    if (cached) return cached
    if (scene.id in inflightAudioRef.current) return inflightAudioRef.current[scene.id]
    const p = getSceneAudio(scene.id)
      .then((res) => {
        const url = res?.url ?? null
        if (url) audioUrlsRef.current[scene.id] = url
        delete inflightAudioRef.current[scene.id]
        return url
      })
      .catch(() => {
        delete inflightAudioRef.current[scene.id]
        return null
      })
    inflightAudioRef.current[scene.id] = p
    return p
  }
  // Classmate cadence guards (client side; the action also enforces the cap).
  const classmateCount = useRef(0)
  const lastClassmateIndex = useRef(-10)
  const [classmatePending, setClassmatePending] = useState(false)

  const currentScene = scenes[currentIndex]
  const isLast = currentIndex === scenes.length - 1
  const slideItemCount =
    currentScene?.sceneType === 'slide' ? currentScene.data.items?.length ?? 1 : 0
  const isPlaying = audioStatus === 'playing'
  const speaking = isPlaying && audioSource.current === 'scene'
  const showPlayOverlay =
    !hasStarted &&
    !!currentScene &&
    (currentScene.sceneType === 'slide' || currentScene.sceneType === 'reading')
  const suggestions = currentScene ? suggestedQuestions(currentScene) : []

  // Auto-scroll the conversation when new messages arrive
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [messages, chatOpen])

  // Listen mode: resolve (synthesize if needed) + play the current scene's
  // narration when the scene changes or listen mode is switched on.
  useEffect(() => {
    if (!listenMode) return
    const audio = audioRef.current
    const scene = currentScene
    if (!audio || !scene) return
    let cancelled = false
    setAudioStatus('loading')
    void resolveSceneAudio(scene).then((url) => {
      if (cancelled) return // scene changed / unmounted while synthesizing
      if (!url) {
        setAudioStatus('idle')
        return
      }
      audioSource.current = 'scene'
      audio.src = url
      audio.playbackRate = playbackRate
      audio.play().catch((err) => {
        // A play() superseded by a newer play/pause (rapid scene changes) is expected.
        if (err?.name === 'AbortError') return
        console.error('Audio play failed:', err)
        setAudioStatus('error')
      })
    })
    return () => {
      cancelled = true
    }
    // playbackRate intentionally excluded — a speed change must not restart audio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, listenMode])

  // Keep the audio element's rate in sync with the chosen speed.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  // Reset progressive reveal when the scene changes (first item shows at once).
  useEffect(() => {
    setRevealedCount(1)
  }, [currentIndex])

  // Silent stagger: when not listening (or this scene has no narration audio),
  // reveal slide items on a gentle timer so the slide still builds in.
  useEffect(() => {
    if (!currentScene || currentScene.sceneType !== 'slide') return
    if (listenMode) return // narration audio drives the reveal when listening
    const n = currentScene.data.items?.length ?? 1
    let k = 1
    const id = setInterval(() => {
      k += 1
      setRevealedCount((r) => Math.max(r, k))
      if (k >= n) clearInterval(id)
    }, 700)
    return () => clearInterval(id)
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
    if (classmateCount.current >= MAX_CLASSMATE_FIRES) return
    if (taughtIndex - lastClassmateIndex.current < CLASSMATE_COOLDOWN_SCENES) return
    const taught = scenes[taughtIndex]
    if (!taught) return
    const taughtConceptTags = [...new Set([...taught.conceptTags, ...taught.teachesConcepts])]
    if (taughtConceptTags.length === 0) return

    // A grounded gap always fires; otherwise allow an ambient on-topic question
    // most of the time, so the class feels alive without piping up every scene.
    const allowAmbient = Math.random() < AMBIENT_CLASSMATE_CHANCE
    const { lessonContext } = buildContext(taughtIndex)
    const askedQuestions = messages
      .filter((m) => m.role === 'student' || m.role === 'classmate')
      .map((m) => m.content)

    setClassmatePending(true)
    try {
      const result = await checkClassmateGap({
        sessionId,
        lessonId: lesson.id,
        courseId,
        taughtConceptTags,
        lessonContext,
        askedQuestions,
        allowAmbient,
      })
      if (result.fired && result.question && result.answer) {
        classmateCount.current += 1
        lastClassmateIndex.current = taughtIndex
        const who = result.classmateName ?? CAST[0].name
        const question = result.question
        const answer = result.answer
        // Keep the exchange in the Ask transcript as history.
        setMessages((prev) => [
          ...prev,
          { role: 'classmate', content: question, classmateName: who },
          { role: 'lecturer', content: answer },
        ])
        // Bring it on stage as three beats so the lecture transitions instead
        // of cutting off cold: the lecturer registers the hand (bridge), the
        // peer asks (question), then the lecturer answers (answer).
        const bridge = pickBridge(who)
        audioRef.current?.pause()
        setSpeakingClassmate(who)
        setMomentPhase('bridge')
        setClassmateMoment({ name: who, question, answer, bridge })
        playMomentBeat(bridge, () => {
          setMomentPhase('question')
          momentTimerRef.current = window.setTimeout(() => {
            setMomentPhase('answer')
            playMomentBeat(answer, () => {})
          }, 1800)
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setClassmatePending(false)
    }
  }

  // Speak one beat of a classmate moment (synthesize + play when listening,
  // calling onDone when the audio ends; else wait an estimated read time). The
  // narration audio element is reused with audioSource = 'qa'.
  function playMomentBeat(text: string, onDone: () => void) {
    const fallback = () => {
      momentTimerRef.current = window.setTimeout(onDone, estimateMs(text))
    }
    if (!listenMode || !audioRef.current) {
      fallback()
      return
    }
    void synthesizeText(text).then(({ url }) => {
      if (!url || !audioRef.current) {
        fallback()
        return
      }
      momentOnEndRef.current = onDone
      audioSource.current = 'qa'
      audioRef.current.src = url
      audioRef.current.playbackRate = playbackRate
      audioRef.current.play().catch(() => {
        momentOnEndRef.current = null
        fallback()
      })
    })
  }

  function dismissMoment() {
    if (momentTimerRef.current) {
      clearTimeout(momentTimerRef.current)
      momentTimerRef.current = null
    }
    momentOnEndRef.current = null
    if (audioSource.current === 'qa') audioRef.current?.pause()
    setClassmateMoment(null)
    setMomentPhase('bridge')
    setSpeakingClassmate(null)
  }

  function goNext() {
    if (currentIndex < scenes.length - 1) {
      const taughtIndex = currentIndex
      dismissMoment()
      setCurrentIndex(currentIndex + 1)
      void runClassmateCheck(taughtIndex)
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      dismissMoment()
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Play/pause the narration. If the lesson is muted (manual reading), pressing
  // play turns narration on — the listen effect then plays the current scene.
  function handlePlayPause() {
    setHasStarted(true)
    if (!listenMode) {
      setListenMode(true)
      return
    }
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      if (audio.ended) audio.currentTime = 0
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  // Restart the current scene's narration (and its reveal) from the top.
  function handleReplay() {
    setRevealedCount(1)
    if (!currentScene) return
    if (!listenMode) {
      setListenMode(true) // the listen effect resolves + plays from the start
      return
    }
    const audio = audioRef.current
    if (!audio) return
    void resolveSceneAudio(currentScene).then((url) => {
      if (!url) return
      audioSource.current = 'scene'
      audio.src = url
      audio.currentTime = 0
      audio.playbackRate = playbackRate
      audio.play().catch(() => {})
    })
  }

  function cycleSpeed() {
    const next = SPEEDS[(SPEEDS.indexOf(playbackRate) + 1) % SPEEDS.length]
    setPlaybackRate(next)
  }

  function openChat() {
    setChatOpen(true)
    setChatUnread(false)
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

  function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault()
    const question = questionInput.trim()
    if (!question || askingQuestion) return
    setQuestionInput('')
    void submitQuestion(question)
  }

  // Ask a suggested question — opens the panel and submits it.
  function askSuggested(question: string) {
    openChat()
    void submitQuestion(question)
  }

  async function submitQuestion(question: string) {
    if (!question || askingQuestion) return
    // Asking pauses the lecture so the lecturer's voice doesn't talk over you.
    // The answer comes back as TEXT (voice stays reserved for teaching); press
    // play to resume the lecture right where it left off.
    audioRef.current?.pause()
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
        listenMode: false, // Q&A is text-only; the lecturer's voice stays with the lecture
      })

      setMessages((prev) => [
        ...prev,
        { role: 'lecturer', content: result.answer, fromCache: result.fromCache },
      ])
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

  return (
    <div className="flex h-screen flex-col bg-[#F4F2ED]">
      {/* Hidden audio element — drives both narration and Q&A playback. */}
      <audio
        ref={audioRef}
        onPlay={() => setAudioStatus('playing')}
        onPlaying={() => setAudioStatus('playing')}
        onTimeUpdate={() => {
          const audio = audioRef.current
          if (!audio) return
          if (!audio.paused) setAudioStatus((s) => (s === 'playing' ? s : 'playing'))
          // Progressive slide reveal, paced to the actual narration length.
          if (audioSource.current === 'scene' && slideItemCount > 0 && audio.duration > 0) {
            const k = Math.min(
              slideItemCount,
              Math.max(1, Math.ceil((audio.currentTime / audio.duration) * slideItemCount)),
            )
            setRevealedCount((r) => Math.max(r, k))
          }
        }}
        onPause={() => setAudioStatus('paused')}
        onEnded={() => {
          setAudioStatus('ended')
          // A finished classmate-moment beat advances the sequence.
          if (audioSource.current === 'qa' && momentOnEndRef.current) {
            const cb = momentOnEndRef.current
            momentOnEndRef.current = null
            cb()
            return
          }
          // Auto-advance only when narration (not a Q&A answer) finishes.
          if (audioSource.current === 'scene' && listenMode && currentIndex < scenes.length - 1) {
            goNext()
          }
        }}
        onError={() => setAudioStatus('error')}
        onLoadStart={() => setAudioStatus('loading')}
      />

      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-200 bg-white/80 px-5 py-2.5 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/courses/${courseSlug}`}
            aria-label="Exit lesson"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="font-mono text-2xs font-semibold uppercase tracking-widest text-neutral-400">
              {lesson.module.course.short_name} · {SCENE_LABEL[currentScene?.sceneType ?? 'reading']}
            </div>
            <div className="truncate text-sm font-semibold text-neutral-900">
              {currentScene?.title ?? lesson.name}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-2xs tabular-nums text-neutral-400">
            {currentIndex + 1} / {scenes.length}
          </span>
          <button
            type="button"
            onClick={() => (chatOpen ? setChatOpen(false) : openChat())}
            aria-label="Toggle lecturer chat"
            className={`relative flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors ${
              chatOpen
                ? 'border-primary bg-primary text-white'
                : 'border-neutral-200 text-neutral-600 hover:text-primary'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Ask
            {chatUnread && !chatOpen && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-accent" />
            )}
          </button>
        </div>
      </header>

      {/* Body: stage + footer on the left, chat pushes in on the right */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Stage */}
          <main className="relative flex-1 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
              <div className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
                {/* Ghosted scene number */}
                <span className="pointer-events-none absolute right-6 top-2 select-none font-mono text-6xl font-bold tracking-tight text-neutral-100">
                  {String(currentIndex + 1).padStart(2, '0')}
                </span>

                {/* Scene content */}
                <div className="flex-1 overflow-y-auto px-8 py-10 md:px-14 md:py-12">
                  {currentScene ? (
                    <div
                      key={currentScene.id}
                      className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                    >
                      <SceneRenderer
                        scene={currentScene}
                        onQuizAnswer={handleQuizAnswer}
                        revealed={currentScene.sceneType === 'slide' ? revealedCount : undefined}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">This lesson has no content yet.</p>
                  )}
                </div>

                {/* Big play overlay — the invitation to begin */}
                {showPlayOverlay && (
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    aria-label="Start the lesson"
                    className="group absolute inset-0 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-[1px]"
                  >
                    <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform group-hover:scale-105">
                      <Play className="ml-1 h-8 w-8" />
                      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/20" />
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* On-stage classmate moment — a peer raises a hand from the class */}
            {classmateMoment && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center p-6 pb-8">
                <ClassmateMoment
                  name={classmateMoment.name}
                  question={classmateMoment.question}
                  answer={classmateMoment.answer}
                  bridge={classmateMoment.bridge}
                  phase={momentPhase}
                  speaking={(momentPhase === 'bridge' || momentPhase === 'answer') && isPlaying}
                  onDismiss={dismissMoment}
                />
              </div>
            )}
          </main>

          {/* Bottom dock */}
          <footer className="shrink-0 border-t border-neutral-200 bg-white/70 px-6 pb-5 pt-3 backdrop-blur">
            {/* Floating transport */}
            <div className="mb-3 flex justify-center">
              <TransportBar
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onPrev={goPrev}
                onNext={goNext}
                onReplay={handleReplay}
                canPrev={currentIndex > 0}
                canNext={!isLast}
                speed={playbackRate}
                onCycleSpeed={cycleSpeed}
                muted={!listenMode}
                onToggleMute={() => setListenMode((m) => !m)}
              />
            </div>

            {/* Dock row: lecturer · narration · cast */}
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6">
              <LecturerDock speaking={speaking} thinking={askingQuestion} />

              <div className="min-w-0 space-y-2">
                <NarrationBubble
                  narration={currentScene ? sceneNarration(currentScene) : ''}
                  thinking={askingQuestion}
                />
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <span className="font-mono text-2xs uppercase tracking-widest text-neutral-400">Ask</span>
                    {suggestions.slice(0, 2).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => askSuggested(q)}
                        className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-2xs text-neutral-600 transition-colors hover:border-primary hover:text-primary"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                {isLast && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={completing}
                      className="inline-flex h-9 items-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
                    >
                      {completing ? 'Saving…' : 'Complete lesson'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-neutral-400">
                  Your class
                </span>
                <CastStrip
                  members={CAST}
                  activeName={classmateMoment ? classmateMoment.name : classmatePending ? speakingClassmate : null}
                />
              </div>
            </div>
          </footer>
        </div>

        {/* Q&A panel — pushes the stage, never overlaps it */}
        {chatOpen && (
          <aside className="flex w-full max-w-sm shrink-0 flex-col border-l border-neutral-200 bg-white animate-in slide-in-from-right duration-300">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <LecturerAvatar size={36} />
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Enso Guide</h2>
                  <p className="font-mono text-2xs text-neutral-400">Ask about this scene</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={conversationRef} className="flex-1 space-y-5 overflow-y-auto p-5">
              {messages.length === 0 ? (
                <div className="py-4">
                  <p className="mb-3 text-center text-sm text-neutral-400">
                    Ask anything about this scene — or start with:
                  </p>
                  <div className="flex flex-col gap-2">
                    {(suggestions.length > 0
                      ? suggestions
                      : ['Explain this more simply', 'Give me an example', 'How is this tested?']
                    ).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => askSuggested(q)}
                        className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:border-primary hover:text-primary"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
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
                    <div key={i} className="flex gap-2.5">
                      <div className="mt-0.5 h-7 w-7 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-white">
                        {isLecturer ? (
                          <Avatar seed={LECTURER_SEED} size={28} bg={['0F3D3E']} />
                        ) : isClassmate ? (
                          <Avatar seed={msg.classmateName ?? 'Classmate'} size={28} />
                        ) : (
                          <Avatar seed="You" size={28} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        {isClassmate && <Hand className="h-3 w-3 text-accent" />}
                        <span className={`font-mono text-2xs font-bold uppercase tracking-widest ${labelColor}`}>
                          {label}
                        </span>
                      </div>
                      {isLecturer ? (
                        <div className="text-sm leading-relaxed text-neutral-800 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p
                          className={`whitespace-pre-wrap text-sm leading-relaxed ${
                            isClassmate ? 'italic text-neutral-700' : 'text-neutral-800'
                          }`}
                        >
                          {msg.content}
                        </p>
                      )}
                      {isLecturer && (msg.fromCache || msg.audioUrl) && (
                        <div className="flex gap-2 font-mono text-2xs text-neutral-400">
                          {msg.fromCache && <span>cached</span>}
                          {msg.audioUrl && <span>spoken</span>}
                        </div>
                      )}
                      </div>
                    </div>
                  )
                })
              )}
              {askingQuestion && (
                <p className="font-mono text-2xs text-neutral-400">Lecturer is thinking…</p>
              )}
              {classmatePending && (
                <p className="flex items-center gap-1.5 font-mono text-2xs text-accent">
                  <Hand className="h-3 w-3" /> A classmate is raising their hand…
                </p>
              )}
            </div>

            <form onSubmit={handleAskQuestion} className="shrink-0 border-t border-neutral-200 p-3">
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
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded bg-primary text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
                >
                  <CornerDownLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>
    </div>
  )
}
