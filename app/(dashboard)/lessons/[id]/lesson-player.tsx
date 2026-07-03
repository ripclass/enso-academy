'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Hand, CornerDownLeft, ArrowLeft, ArrowRight, MessageSquare, X, Play } from 'lucide-react'
import { askLecturer, completeLesson, recordQuizEvidence, updateListenModePreference, getSceneAudio, synthesizeText, gradeProjectSubmission, fetchLecturerOpening, recordSceneProgress } from '@/lib/lesson/actions'
import { checkClassmateGap } from '@/lib/classmate/actions'
import { SceneRenderer } from '@/components/lesson/scenes/scene-renderer'
import { LessonChallenge } from '@/components/lesson/challenge/lesson-challenge'
import { LecturerDock, NarrationBubble, LecturerAvatar } from '@/components/lesson/classroom/lecturer-presence'
import { TransportBar } from '@/components/lesson/classroom/transport-bar'
import { CastStrip, type CastMember } from '@/components/lesson/classroom/cast-strip'
import { ClassmateMoment, type MomentPhase } from '@/components/lesson/classroom/classmate-moment'
import { Avatar } from '@/components/lesson/classroom/avatar'
import { SceneProgress } from '@/components/lesson/classroom/scene-progress'
import { BeatPager } from '@/components/lesson/classroom/beat-pager'
import { WrapUpPanel } from '@/components/lesson/classroom/wrap-up-panel'
import { VoiceInput } from '@/components/lesson/classroom/voice-input'
import { sceneContext, sceneNarration, suggestedQuestions, lecturerVariantFor, splitSentences, type Scene, type SceneType, type QuizQuestion, type PblSpec } from '@/lib/lesson/scenes'
import { readingBeats, slideBeats } from '@/lib/lesson/beats'
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
  /** Scene to start on, so the student resumes where they left off. */
  initialSceneIndex?: number
  /** The student's chosen avatar (from settings). */
  userAvatar?: 'male' | 'female'
  /** The student's first name, for the lecturer to address them in office hours. */
  userName?: string | null
  /** The next lesson in course order — "Complete lesson" advances into it. */
  nextLessonId?: string | null
  /** Deep-case lessons: link to work this case in Case Mode (shown in wrap-up). */
  caseHref?: string
}


type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

const SCENE_LABEL: Record<SceneType, string> = {
  reading: 'Reading',
  slide: 'Slide',
  quiz: 'Knowledge check',
  interactive: 'Interactive',
  pbl: 'Project',
  challenge: 'Apply it',
}

const SPEEDS = [1, 1.25, 1.5, 2]

// Classmates hold their questions for the end of the lesson — the "office
// hours" wrap-up below — rather than interrupting the lecture mid-flow.
// The wrap-up runs a short sequence: lecturer opens the floor → a couple of
// (different) classmates ask → the lecturer turns to the student → if the
// student is quiet for a beat, the lecturer moves on.
const WRAPUP_CLASSMATES = 2
const USER_TURN_MS = 22000
const WRAPUP_PROMPTS = [
  "That's the lesson. Before you go, any questions?",
  'That brings us to the end. Any questions before we wrap up?',
  "That's everything for this lesson. Anything you want to ask before you go?",
]
const ANYONE_ELSE = ['Anyone else?', 'Good question. Anyone else?', 'Right. Anybody else?']
const userPrompt = (name?: string | null) =>
  name
    ? `${name}, do you have a question?`
    : 'And how about you? Anything you want to ask?'
const MOVE_ON = ["OK, let's move on.", 'All right, let’s wrap up there.', 'Good. Let us leave it there.']
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
const pickWrapUp = () => pick(WRAPUP_PROMPTS)

// What the lecturer says to register a raised hand before answering — so the
// lecture transitions instead of cutting off cold.
const BRIDGE_TEMPLATES = [
  (n: string) => `Hold on, it looks like ${n} has a question. Go ahead, ${n}.`,
  (n: string) => `Yes, ${n}? Let's hear it.`,
  (n: string) => `Let me pause there for a second. ${n}, go ahead.`,
  (n: string) => `Good timing. ${n} has a question.`,
]
const pickBridge = (name: string) =>
  BRIDGE_TEMPLATES[Math.floor(Math.random() * BRIDGE_TEMPLATES.length)](name)

// Estimated spoken duration of a line (~150 wpm), used when narration is muted.
const estimateMs = (text: string) =>
  Math.min(25000, Math.max(1200, Math.round((text.trim().split(/\s+/).length / 2.5) * 1000)))

// Which sentence is "live" at a given audio progress (0–1), weighted by length.
function activeSentence(sentences: string[], progress: number): number {
  if (sentences.length <= 1) return 0
  const lens = sentences.map((s) => s.length)
  const total = lens.reduce((a, b) => a + b, 0) || 1
  const target = Math.max(0, Math.min(1, progress)) * total
  let acc = 0
  for (let i = 0; i < sentences.length; i++) {
    acc += lens[i]
    if (target <= acc) return i
  }
  return sentences.length - 1
}

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

export function LessonPlayer({ sessionId, lesson, scenes, courseId, courseSlug, initialSceneIndex = 0, userAvatar = 'female', userName, nextLessonId, caseHref }: Props) {
  const router = useRouter()
  const lecturerVariant = lecturerVariantFor(lesson.id)
  const userAvatarSrc = `/avatars/user-${userAvatar}.webp`
  const [currentIndex, setCurrentIndex] = useState(initialSceneIndex)
  const [messages, setMessages] = useState<Message[]>([])

  // The lecturer's continuity greeting (an LLM call) is fetched after mount so it
  // never blocks the lesson from rendering. Prepend it when it arrives.
  useEffect(() => {
    let cancelled = false
    fetchLecturerOpening(courseId, lesson.name)
      .then((greeting) => {
        if (!cancelled && greeting) {
          setMessages((prev) => [{ role: 'lecturer', content: greeting }, ...prev])
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [courseId, lesson.name])

  // If we resumed past the start, say so once so the student isn't confused
  // about why they didn't begin at scene one.
  useEffect(() => {
    if (initialSceneIndex > 0) toast('Picking up where you left off.')
  }, [initialSceneIndex])

  // Persist the current scene so the student resumes here next time. The server
  // action writes it to this session; fire-and-forget on every scene change.
  useEffect(() => {
    void recordSceneProgress(sessionId, currentIndex).catch(() => {})
  }, [sessionId, currentIndex])

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
  // Which narration sentence is "live" — advanced by audio progress for the
  // subtitle, so the bubble tracks what the lecturer is actually saying.
  const [spokenIdx, setSpokenIdx] = useState(0)
  // Narration progress 0–1 for the current scene — drives beat pagination.
  const [narrationProgress, setNarrationProgress] = useState(0)
  // Beat pagination: ON by default — scenes play "one thought at a time" with
  // each beat narrated by its own clip, so the on-screen beat is always exactly
  // what the lecturer is saying. `?beats=0` opts out (the old whole-scene view)
  // for A/B comparison. Server-renders to on so the default never mismatches.
  const [beatMode] = useState(() =>
    typeof window === 'undefined'
      ? true
      : new URLSearchParams(window.location.search).get('beats') !== '0',
  )
  // Per-beat audio (reading scenes in beat mode): the active beat index, plus a
  // per-scene cache of resolved beat narration URLs so each beat plays its own
  // clip in sequence — the displayed beat is always exactly the clip playing.
  const [activeBeat, setActiveBeat] = useState(0)
  const beatUrlsRef = useRef<Record<string, (string | null)[]>>({})
  const beatInflightRef = useRef<Record<string, Record<number, Promise<string | null>>>>({})
  const conversationRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Tracks what the audio element is currently playing, so that a finished
  // Q&A answer does not auto-advance the lesson like a finished narration does.
  const audioSource = useRef<'scene' | 'qa'>('scene')
  // Classmate-moment beat sequencing (bridge → question → answer).
  const momentOnEndRef = useRef<(() => void) | null>(null)
  const momentTimerRef = useRef<number | null>(null)
  // Where the lecture narration was when a hand interrupted it, so Continue can
  // resume the lecture from that point instead of leaving it stopped.
  const lecturePosRef = useRef<number | null>(null)
  // One classmate at a time: held from the moment a check is claimed until the
  // moment is dismissed, so a second raised hand can never interrupt the first.
  const momentBusyRef = useRef(false)
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

  // Per-beat narration text for each beat: reading → the paragraph chunk
  // (which is itself the narration); slide → the narration slice for each
  // item-page. Empty array for scene types that don't paginate with audio.
  function beatNarrationTexts(s: Scene | undefined): string[] {
    if (!s) return []
    if (s.sceneType === 'reading') return readingBeats(s.data.body)
    if (s.sceneType === 'slide') {
      return slideBeats(s.data.narration, s.data.items?.length ?? 0, s.data.template).map((b) => b.narration)
    }
    return []
  }

  // Whether a scene uses per-beat audio: in beat mode, more than one beat, and
  // every beat has narration to synthesize (a slide whose script can't be split
  // per page falls back to its single whole-slide clip).
  function beatAudio(s: Scene | undefined): boolean {
    if (!s || !beatMode) return false
    const texts = beatNarrationTexts(s)
    return texts.length > 1 && texts.every((t) => t.trim().length > 0)
  }

  // Resolve (synthesize-or-cache) the narration clip for one beat. Cached per
  // scene + index; dedups in-flight requests.
  async function resolveBeatAudio(scene: Scene, index: number): Promise<string | null> {
    const texts = beatNarrationTexts(scene)
    if (index < 0 || index >= texts.length || !texts[index]?.trim()) return null
    const cache = (beatUrlsRef.current[scene.id] ??= [])
    if (cache[index] !== undefined) return cache[index]
    const inflight = (beatInflightRef.current[scene.id] ??= {})
    if (index in inflight) return inflight[index]
    const variant = lecturerVariantFor(lesson.id)
    const p = synthesizeText(texts[index], variant)
      .then((res) => {
        const url = res?.url ?? null
        cache[index] = url
        delete inflight[index]
        return url
      })
      .catch(() => {
        delete inflight[index]
        return null
      })
    inflight[index] = p
    return p
  }
  // Whether a classmate is currently being generated (shown in the Ask panel).
  const [classmatePending, setClassmatePending] = useState(false)

  // End-of-lesson office hours. `wrapUp` gates the phase; `wrapStage` walks the
  // sequence (classmates asking → the student's turn → closing); the prompt is
  // the lecturer's current on-panel line.
  const [wrapUp, setWrapUp] = useState(false)
  const [wrapStage, setWrapStage] = useState<'asking' | 'user-turn' | 'closing'>('asking')
  const [wrapUpPrompt, setWrapUpPrompt] = useState('')
  const wrapUpCountRef = useRef(0)
  const wrapUpNamesRef = useRef<string[]>([]) // classmates already called on
  // The NEXT office-hours Q&A, generated while the current one plays so the
  // class never sits in minutes of silence between questions.
  const wrapNextRef = useRef<Promise<{ question: string; answer: string } | null> | null>(null)
  // Live remediation state: consecutive wrong answers this session, concepts
  // missed this session (feeds the wrap-up focus), and how many times the
  // lecturer has already stepped in (capped so it never nags).
  const wrongStreakRef = useRef(0)
  const missedConceptsRef = useRef<Set<string>>(new Set())
  const remediationCountRef = useRef(0)
  const userTurnTimerRef = useRef<number | null>(null)

  const currentScene = scenes[currentIndex]
  const isLast = currentIndex === scenes.length - 1
  const slideItemCount =
    currentScene?.sceneType === 'slide' ? currentScene.data.items?.length ?? 1 : 0
  const isPlaying = audioStatus === 'playing'
  const speaking = isPlaying && audioSource.current === 'scene'
  const showPlayOverlay =
    !hasStarted &&
    !wrapUp &&
    !!currentScene &&
    (currentScene.sceneType === 'slide' || currentScene.sceneType === 'reading')
  const suggestions = currentScene ? suggestedQuestions(currentScene) : []
  // Narration split into sentences for the live subtitle.
  const narrationSentences = useMemo(
    () => (currentScene ? splitSentences(sceneNarration(currentScene)) : []),
    [currentScene],
  )
  // The lecturer's speech bubble. In per-beat mode it shows the FIRST line of the
  // current beat: a short, stable caption that updates once per beat, so it never
  // jumps ahead of the voice mid-beat and never truncates. The full beat text is
  // on the stage. Estimating a sub-sentence position from playback progress is
  // what made it jump ahead, so we no longer do that. Non-beat mode keeps the
  // scene-narration sentence.
  const bubbleText = useMemo(() => {
    if (!speaking) return ''
    if (beatAudio(currentScene)) {
      const texts = beatNarrationTexts(currentScene)
      const beat = texts[Math.min(activeBeat, texts.length - 1)] ?? ''
      return splitSentences(beat)[0] ?? beat
    }
    return narrationSentences[spokenIdx] ?? ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speaking, beatMode, currentScene, activeBeat, narrationSentences, spokenIdx])

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
    if (beatAudio(scene)) return // per-beat reading is driven by the beat-audio effect
    if (scene.sceneType === 'challenge') {
      setAudioStatus('idle') // the Apply-it round has no narration
      return
    }
    let cancelled = false
    // Stop the previous scene's narration immediately so it never plays over
    // the new slide while the new audio resolves (synthesis/cache lookup).
    audio.pause()
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

  // Per-beat audio: play the current beat's clip for a reading scene in beat
  // mode, and prefetch the next. Re-runs when the beat changes (sequential
  // playback advances activeBeat on each clip's end), so the on-screen beat is
  // always exactly the clip being spoken.
  useEffect(() => {
    if (!listenMode || !beatMode) return
    const audio = audioRef.current
    const scene = currentScene
    if (!audio || !scene || !beatAudio(scene)) return
    let cancelled = false
    audio.pause()
    setAudioStatus('loading')
    void resolveBeatAudio(scene, activeBeat).then((url) => {
      if (cancelled) return
      if (!url) {
        setAudioStatus('idle')
        return
      }
      audioSource.current = 'scene'
      audio.src = url
      audio.playbackRate = playbackRate
      audio.play().catch((err) => {
        if (err?.name === 'AbortError') return
        console.error('Beat audio play failed:', err)
        setAudioStatus('error')
      })
      void resolveBeatAudio(scene, activeBeat + 1) // prefetch the next beat
    })
    return () => {
      cancelled = true
    }
    // playbackRate intentionally excluded — a speed change must not restart audio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, listenMode, activeBeat, beatMode])

  // Keep the audio element's rate in sync with the chosen speed.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  // Reset progressive reveal + subtitle when the scene changes.
  useEffect(() => {
    setRevealedCount(1)
    setSpokenIdx(0)
    setNarrationProgress(0)
    setActiveBeat(0)
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

  // Bring a classmate's question on stage as three beats (bridge → question →
  // answer), keeping the exchange in the Ask transcript. Shared by the in-lesson
  // hand-raise and the end-of-lesson office hours. The caller claims
  // momentBusyRef before staging and releases it on dismiss.
  function stageMoment(who: string, question: string, answer: string) {
    setMessages((prev) => [
      ...prev,
      { role: 'classmate', content: question, classmateName: who },
      { role: 'lecturer', content: answer },
    ])
    const bridge = pickBridge(who)
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
    void synthesizeText(text, lecturerVariant).then(({ url }) => {
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

  // Speak widget-driven text (case-file evidence cards / reveals) through the
  // lesson's shared voice. Listen-mode only; a newer call simply replaces the
  // playing clip, so the voice always follows the card on screen.
  function speakWidgetText(text: string) {
    if (!listenMode || !audioRef.current || !text.trim()) return
    void synthesizeText(text, lecturerVariant).then(({ url }) => {
      const audio = audioRef.current
      if (!url || !audio) return
      audioSource.current = 'qa'
      audio.src = url
      audio.playbackRate = playbackRate
      audio.play().catch(() => {})
    })
  }

  // Resume the lecture narration from where a hand interrupted it.
  function resumeLecture() {
    const audio = audioRef.current
    const at = lecturePosRef.current
    lecturePosRef.current = null
    if (!listenMode || !audio || !currentScene) return
    void resolveSceneAudio(currentScene).then((url) => {
      if (!url) return
      audioSource.current = 'scene'
      audio.src = url
      const seek = () => {
        try {
          if (at != null) audio.currentTime = at
        } catch {
          /* seek past end — ignore */
        }
        audio.playbackRate = playbackRate
        audio.play().catch(() => {})
        audio.removeEventListener('loadedmetadata', seek)
      }
      audio.addEventListener('loadedmetadata', seek)
      audio.load()
    })
  }

  // Common teardown for an on-stage moment (no lecture resume, no next-up).
  function clearMoment() {
    if (momentTimerRef.current) {
      clearTimeout(momentTimerRef.current)
      momentTimerRef.current = null
    }
    momentOnEndRef.current = null
    momentBusyRef.current = false // release the slot for the next classmate
    if (userTurnTimerRef.current) {
      clearTimeout(userTurnTimerRef.current)
      userTurnTimerRef.current = null
    }
    if (audioSource.current === 'qa') audioRef.current?.pause()
    setClassmateMoment(null)
    setMomentPhase('bridge')
    setSpeakingClassmate(null)
  }

  function dismissMoment(resume = false) {
    clearMoment()
    if (resume) resumeLecture()
    else lecturePosRef.current = null // navigating away — drop the saved spot
  }

  // Pick a classmate who hasn't been called on yet this wrap-up, so the office
  // hours rotates across the class instead of one person asking everything.
  function pickNextClassmate(): string {
    const used = wrapUpNamesRef.current
    const fresh = CAST.map((c) => c.name).filter((n) => !used.includes(n))
    const pool = fresh.length > 0 ? fresh : CAST.map((c) => c.name)
    const name = pool[Math.floor(Math.random() * pool.length)]
    wrapUpNamesRef.current = [...used, name]
    return name
  }

  // After a wrap-up classmate's answer: if the class still has questions, the
  // lecturer invites another (different) classmate; once they're done, the
  // lecturer turns to the student. The next Q&A was prefetched while this one
  // played, so the handoff is near-instant instead of a full LLM round-trip.
  function dismissWrapUpMoment() {
    clearMoment()
    if (wrapUpCountRef.current < WRAPUP_CLASSMATES) {
      momentBusyRef.current = true
      const prefetched = wrapNextRef.current
      wrapNextRef.current = null
      playMomentBeat(pick(ANYONE_ELSE), () => {
        momentBusyRef.current = false
        void fireWrapUpClassmate(prefetched ?? undefined)
      })
    } else {
      enterUserTurn()
    }
  }

  // Generate one office-hours classmate Q&A (question + lecturer answer),
  // grounded in the whole lesson's concepts. `extraAsked` carries questions
  // already staged but not yet in `messages` (the prefetch case), so a
  // prefetched question never duplicates the one currently playing.
  async function generateWrapUpQA(
    extraAsked: string[],
  ): Promise<{ question: string; answer: string } | null> {
    const lastIndex = scenes.length - 1
    const { lessonContext } = buildContext(lastIndex)
    const taughtConceptTags = [
      ...new Set(scenes.flatMap((s) => [...s.conceptTags, ...s.teachesConcepts])),
    ].slice(0, 12)
    const askedQuestions = [
      ...messages
        .filter((m) => m.role === 'student' || m.role === 'classmate')
        .map((m) => m.content),
      ...extraAsked,
    ]
    try {
      const result = await checkClassmateGap({
        sessionId,
        lessonId: lesson.id,
        courseId,
        taughtConceptTags,
        lessonContext,
        askedQuestions,
        wrapUp: true,
        sessionMissedConcepts: [...missedConceptsRef.current],
      })
      if (result.fired && result.question && result.answer) {
        return { question: result.question, answer: result.answer }
      }
    } catch (err) {
      console.error(err)
    }
    return null
  }

  // Enter the end-of-lesson office hours: the lecturer opens the floor, then the
  // first classmate raises a hand. The first Q&A starts generating immediately,
  // overlapping the lecturer's opening line. Idempotent.
  function enterWrapUp() {
    if (wrapUp || momentBusyRef.current) return
    setWrapUp(true)
    setWrapStage('asking')
    wrapUpCountRef.current = 0
    wrapUpNamesRef.current = []
    lecturePosRef.current = null
    audioRef.current?.pause()
    const prompt = pickWrapUp()
    setWrapUpPrompt(prompt)
    setSpeakingClassmate(null)
    momentBusyRef.current = true
    const first = generateWrapUpQA([])
    playMomentBeat(prompt, () => {
      momentBusyRef.current = false
      void fireWrapUpClassmate(first)
    })
  }

  // A (rotating) classmate raises a hand with a closing question. Uses the
  // prefetched Q&A when one is ready; kicks off the NEXT prefetch as soon as
  // this one goes on stage, so generation always overlaps playback.
  async function fireWrapUpClassmate(prefetched?: Promise<{ question: string; answer: string } | null>) {
    if (momentBusyRef.current) return
    momentBusyRef.current = true
    setClassmatePending(true)
    const qa = await (prefetched ?? generateWrapUpQA([]))
    setClassmatePending(false)
    if (qa) {
      wrapUpCountRef.current += 1
      wrapNextRef.current =
        wrapUpCountRef.current < WRAPUP_CLASSMATES ? generateWrapUpQA([qa.question]) : null
      stageMoment(pickNextClassmate(), qa.question, qa.answer)
    } else {
      // Generation failed — don't strand the wrap-up; turn to the student.
      momentBusyRef.current = false
      enterUserTurn()
    }
  }

  // The lecturer turns to the student by name and waits a beat. If the student
  // asks (typed or spoken), submitQuestion handles it and then closes; if they
  // stay quiet past USER_TURN_MS, the lecturer moves on.
  function enterUserTurn() {
    setWrapStage('user-turn')
    const line = userPrompt(userName)
    setWrapUpPrompt(line)
    openChat() // give them the box to type or use the mic
    momentBusyRef.current = true
    playMomentBeat(line, () => {
      momentBusyRef.current = false
      if (userTurnTimerRef.current) clearTimeout(userTurnTimerRef.current)
      userTurnTimerRef.current = window.setTimeout(() => enterClosing(), USER_TURN_MS)
    })
  }

  // Close the office hours: the lecturer moves on; "Complete lesson" is the
  // clear next action.
  function enterClosing() {
    if (userTurnTimerRef.current) {
      clearTimeout(userTurnTimerRef.current)
      userTurnTimerRef.current = null
    }
    if (wrapStage === 'closing') return
    setWrapStage('closing')
    const line = pick(MOVE_ON)
    setWrapUpPrompt(line)
    momentBusyRef.current = true
    playMomentBeat(line, () => {
      momentBusyRef.current = false
    })
  }

  function goNext() {
    if (currentIndex < scenes.length - 1) {
      setWrapUp(false)
      dismissMoment()
      setActiveBeat(0)
      setCurrentIndex(currentIndex + 1)
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setWrapUp(false)
      dismissMoment()
      setActiveBeat(0)
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Jump to any scene from the chapter-tick scrubber.
  function goToScene(index: number) {
    if (index === currentIndex || index < 0 || index >= scenes.length) return
    setWrapUp(false)
    dismissMoment()
    setActiveBeat(0)
    setCurrentIndex(index)
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
    // Beat-mode scene: "replay" means restart from the first beat. Moving the
    // active beat re-fires the per-beat audio effect; if we're already on beat 0
    // (so the effect won't re-run), replay beat 0's clip directly.
    if (beatAudio(currentScene)) {
      if (activeBeat !== 0) {
        setActiveBeat(0)
      } else {
        void resolveBeatAudio(currentScene, 0).then((url) => {
          if (!url) return
          audioSource.current = 'scene'
          audio.src = url
          audio.currentTime = 0
          audio.playbackRate = playbackRate
          audio.play().catch(() => {})
        })
      }
      return
    }
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
  // engine writes to). Fire-and-forget — never blocks the UI. Wrong answers
  // also feed the session's live miss-tracking: a two-in-a-row wrong streak
  // triggers the lecturer's remediation interjection, and every missed concept
  // is carried into the office-hours question at the end.
  function handleQuizAnswer(question: QuizQuestion, _selectedOptionId: string, correct: boolean) {
    void recordQuizEvidence({
      courseId,
      conceptTags: question.conceptTags ?? [],
      correct,
    }).catch(() => {})
    if (correct) {
      wrongStreakRef.current = 0
      return
    }
    for (const t of question.conceptTags ?? []) missedConceptsRef.current.add(t)
    wrongStreakRef.current += 1
    if (wrongStreakRef.current >= 2 && remediationCountRef.current < 1 && !wrapUp) {
      remediationCountRef.current += 1
      wrongStreakRef.current = 0
      // The lecturer steps in, in the student's own voice — an honest chat
      // exchange through the normal Q&A path (pauses the lecture, shows in the
      // panel, answer shaped by the student model's mastery preamble).
      askSuggested(
        'I have gotten two of these wrong in a row. Can you slow down and explain the key idea here differently, with one concrete example?',
      )
    }
  }

  // An interactive scene's result also feeds the student knowledge model, and
  // a below-bar result marks its concepts as missed for the wrap-up.
  function handleInteractiveComplete(conceptTags: string[], correct: boolean) {
    void recordQuizEvidence({ courseId, conceptTags, correct }).catch(() => {})
    if (!correct) for (const t of conceptTags) missedConceptsRef.current.add(t)
  }

  // Grade a PBL project submission via the AI mentor.
  function handleGradeProject(spec: PblSpec, submission: string) {
    return gradeProjectSubmission({
      courseId,
      lessonId: lesson.id,
      sessionId,
      brief: spec.brief,
      task: spec.task,
      deliverable: spec.deliverable,
      rubric: spec.rubric,
      submission,
      conceptTags: currentScene?.conceptTags ?? [],
    })
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
    // If it's the student's turn in office hours, they took it — stop the
    // move-on timer so the lecturer doesn't talk over them.
    if (userTurnTimerRef.current) {
      clearTimeout(userTurnTimerRef.current)
      userTurnTimerRef.current = null
    }
    const wasUserTurn = wrapUp && wrapStage === 'user-turn'
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
      // The student took their office-hours turn — close out afterwards.
      if (wasUserTurn) enterClosing()
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
      // Advance straight into the next lesson; fall back to the course page on
      // the last lesson of the course.
      router.push(nextLessonId ? `/lessons/${nextLessonId}` : `/courses/${courseSlug}`)
    } catch (err) {
      toast.error('Could not save lesson completion.')
      console.error(err)
      setCompleting(false)
    }
  }

  return (
    <div className="fixed inset-0 h-[100dvh] flex flex-col overflow-hidden bg-background">
      {/* Hidden audio element — drives both narration and Q&A playback. */}
      <audio
        ref={audioRef}
        onPlay={() => setAudioStatus('playing')}
        onPlaying={() => setAudioStatus('playing')}
        onTimeUpdate={() => {
          const audio = audioRef.current
          if (!audio) return
          if (!audio.paused) setAudioStatus((s) => (s === 'playing' ? s : 'playing'))
          if (audioSource.current === 'scene' && audio.duration > 0) {
            const progress = audio.currentTime / audio.duration
            if (beatMode) setNarrationProgress(progress)
            // Progressive slide reveal, paced to the actual narration length.
            if (slideItemCount > 0) {
              const k = Math.min(slideItemCount, Math.max(1, Math.ceil(progress * slideItemCount)))
              setRevealedCount((r) => Math.max(r, k))
            }
            // Live subtitle: advance to the sentence being spoken.
            if (narrationSentences.length > 0) {
              const idx = activeSentence(narrationSentences, progress)
              setSpokenIdx((p) => (p === idx ? p : idx))
            }
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
          if (audioSource.current === 'scene' && listenMode) {
            const scene = currentScene
            // Per-beat scene: a finished beat advances to the next beat; only
            // move to the next scene once the last beat has played.
            if (beatAudio(scene)) {
              const total = beatNarrationTexts(scene).length
              if (activeBeat < total - 1) {
                setActiveBeat((b) => b + 1)
                return
              }
            }
            // Only passive scenes auto-advance. Quiz / interactive / PBL require
            // the student to act, so narration ending must not carry them past
            // the scene before they engage with it.
            const passive =
              scene?.sceneType === 'reading' || scene?.sceneType === 'slide'
            if (passive && currentIndex < scenes.length - 1) goNext()
            // Last passive scene finished → open the end-of-lesson office hours.
            else if (passive && currentIndex === scenes.length - 1 && !wrapUp) {
              enterWrapUp()
            }
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
      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Chapter ticks — one per scene; click to jump */}
          <div className="border-b border-neutral-200 bg-white/60 px-6 py-2.5 backdrop-blur">
            <SceneProgress scenes={scenes} currentIndex={currentIndex} onJump={goToScene} />
          </div>

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
                  {wrapUp ? (
                    <WrapUpPanel
                      lecturerVariant={lecturerVariant}
                      prompt={wrapUpPrompt}
                      stage={wrapStage}
                      speaking={isPlaying && !classmateMoment}
                      hasNext={!!nextLessonId}
                      onAsk={(q) => (q ? askSuggested(q) : openChat())}
                      onComplete={handleComplete}
                      completing={completing}
                      caseHref={caseHref}
                      // Personal chips from THIS session's misses (max two) —
                      // the student's own gaps lead the generic closers.
                      missedPrompts={[...missedConceptsRef.current].slice(0, 2).map(
                        (tag) =>
                          `Can you go over ${tag.replace(/_/g, ' ')} once more? I kept getting it wrong today.`,
                      )}
                    />
                  ) : currentScene ? (
                    currentScene.sceneType === 'challenge' ? (
                      <div key={currentScene.id} className="animate-in fade-in duration-500">
                        <LessonChallenge
                          courseId={courseId}
                          lessonSlug={currentScene.data.lessonSlug}
                          conceptTags={currentScene.data.conceptTags}
                          onResult={handleInteractiveComplete}
                        />
                      </div>
                    ) : beatMode &&
                    (currentScene.sceneType === 'reading' || currentScene.sceneType === 'slide') ? (
                      <div key={currentScene.id} className="h-full animate-in fade-in duration-500">
                        <BeatPager
                          scene={currentScene}
                          progress={narrationProgress}
                          audioBeat={beatAudio(currentScene) ? activeBeat : null}
                          playing={speaking}
                          onSeekBeat={beatAudio(currentScene) ? (i) => setActiveBeat(i) : undefined}
                        />
                      </div>
                    ) : (
                      <div
                        key={currentScene.id}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                      >
                        <SceneRenderer
                          scene={currentScene}
                          onQuizAnswer={handleQuizAnswer}
                          onQuizContinue={currentIndex < scenes.length - 1 ? goNext : undefined}
                          onInteractiveComplete={handleInteractiveComplete}
                          onGradeProject={handleGradeProject}
                          onSpeak={speakWidgetText}
                          caseSeed={sessionId}
                          revealed={currentScene.sceneType === 'slide' ? revealedCount : undefined}
                        />
                      </div>
                    )
                  ) : (
                    <p className="text-sm text-neutral-500">This lesson has no content yet.</p>
                  )}
                </div>

                {/* Last scene → a clear on-stage CTA into the end-of-lesson
                    office hours (the lecture itself has no dock buttons). */}
                {isLast && !wrapUp && (
                  <div className="flex shrink-0 justify-end border-t border-neutral-200 px-8 py-3.5 md:px-14">
                    <button
                      type="button"
                      onClick={enterWrapUp}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
                    >
                      Finish lesson
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

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
                  lecturerVariant={lecturerVariant}
                  onDismiss={wrapUp ? dismissWrapUpMoment : () => dismissMoment(true)}
                />
              </div>
            )}
          </main>

          {/* Bottom dock */}
          <footer className="shrink-0 border-t border-neutral-200 bg-white/70 px-6 pb-5 pt-3 backdrop-blur">
            {/* Floating transport (hidden during the end-of-lesson wrap-up) */}
            {!wrapUp && (
              <div className="mb-3 flex justify-center">
                <TransportBar
                  isPlaying={isPlaying}
                  loading={audioStatus === 'loading'}
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
            )}

            {/* Dock row: lecturer + speech bubble on the left, cast on the right */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <LecturerDock
                  variant={lecturerVariant}
                  speaking={speaking}
                  thinking={askingQuestion}
                  preparing={audioStatus === 'loading'}
                />

                <div className="hidden min-w-0 flex-1 space-y-2 sm:block">
                  <NarrationBubble
                    text={bubbleText}
                    speaking={speaking}
                    thinking={askingQuestion}
                  />
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
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
          <aside className="absolute inset-0 z-20 flex w-full max-w-none shrink-0 flex-col border-l border-neutral-200 bg-white animate-in slide-in-from-right duration-300 sm:relative sm:inset-auto sm:z-auto sm:max-w-sm">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <LecturerAvatar size={36} variant={lecturerVariant} />
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
                    Ask anything about this scene, or start with:
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
                          <Avatar src={`/avatars/lecturer-${lecturerVariant}.webp`} size={28} />
                        ) : isClassmate ? (
                          <Avatar seed={msg.classmateName ?? 'Classmate'} size={28} />
                        ) : (
                          <Avatar src={userAvatarSrc} size={28} />
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
                  placeholder="Ask the Enso Guide, or use the mic…"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  disabled={askingQuestion}
                  className="w-full rounded-md border border-neutral-200 bg-white py-2.5 pl-3 pr-[4.75rem] text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary focus:outline-none disabled:opacity-60"
                />
                {/* Voice question: record, then transcribe via Whisper (any language). */}
                <div className="absolute right-9 top-1/2 -translate-y-1/2">
                  <VoiceInput
                    onTranscript={(t) => setQuestionInput(t)}
                    disabled={askingQuestion}
                  />
                </div>
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
