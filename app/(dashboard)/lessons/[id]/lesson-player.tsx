'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Wordmark } from '@/components/brand/wordmark'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { askLecturer, completeLesson, updateListenModePreference } from '@/lib/lesson/actions'
import { checkClassmateGap } from '@/lib/classmate/actions'
import { toast } from 'sonner'

type Element = {
  id: string
  element_type: string
  title: string | null
  body: string
  estimated_seconds: number | null
  audio_url: string | null
  concept_tags: string[] | null
  teaches_concepts: string[] | null
}

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
  elements: Element[]
  courseId: string
  courseSlug: string
  lecturerOpening?: string | null
}

type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

export function LessonPlayer({ sessionId, lesson, elements, courseId, courseSlug, lecturerOpening }: Props) {
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
  const audioSource = useRef<'element' | 'qa'>('element')
  // The classmate fires at most once per session; this guards the client side
  // (the checkClassmateGap action also enforces the cap server-side).
  const classmateFired = useRef(false)
  const [classmatePending, setClassmatePending] = useState(false)

  const currentElement = elements[currentIndex]
  const isLast = currentIndex === elements.length - 1

  // Auto-scroll the conversation when new messages arrive
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [messages])

  // Listen mode: load + play the current element's narration when the
  // element changes, or when listen mode is switched on.
  useEffect(() => {
    if (!listenMode) return
    const audio = audioRef.current
    if (!audio) return
    const url = currentElement?.audio_url
    if (!url) {
      setAudioStatus('idle')
      return
    }
    audioSource.current = 'element'
    audio.src = url
    audio.play().catch((err) => {
      console.error('Audio play failed:', err)
      setAudioStatus('error')
    })
  }, [currentIndex, listenMode, currentElement])

  // Persist the Listen-mode preference (debounced; non-critical).
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void updateListenModePreference(listenMode).catch(() => {})
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [listenMode])

  // After the student advances past an element, give the classmate a chance to
  // raise a hand about a concept that element taught and the student is weak on.
  async function runClassmateCheck(taughtIndex: number) {
    if (classmateFired.current) return
    const taught = elements[taughtIndex]
    if (!taught) return
    const taughtConceptTags = [...new Set([
      ...(taught.concept_tags ?? []),
      ...(taught.teaches_concepts ?? []),
    ])]
    if (taughtConceptTags.length === 0) return

    const ctx = elements.slice(Math.max(0, taughtIndex - 1), Math.min(elements.length, taughtIndex + 2))
    const lessonContext = ctx
      .map(el => `[${el.element_type}] ${el.title ?? ''}\n${el.body}`)
      .join('\n\n---\n\n')
    const askedQuestions = messages.filter(m => m.role === 'student').map(m => m.content)

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
        setMessages(prev => [
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
    if (currentIndex < elements.length - 1) {
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

  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!questionInput.trim() || askingQuestion) return

    const question = questionInput.trim()
    setQuestionInput('')
    setMessages(prev => [...prev, { role: 'student', content: question }])
    setAskingQuestion(true)

    try {
      // Build lesson context: combine the current element + a couple surrounding
      const contextElements = elements.slice(Math.max(0, currentIndex - 1), Math.min(elements.length, currentIndex + 2))
      const lessonContext = contextElements
        .map(el => `[${el.element_type}] ${el.title ?? ''}\n${el.body}`)
        .join('\n\n---\n\n')
      const conceptTags = [...new Set(contextElements.flatMap(el => [
        ...(el.concept_tags ?? []),
        ...(el.teaches_concepts ?? []),
      ]))]

      const result = await askLecturer({
        sessionId,
        lessonId: lesson.id,
        courseId,
        question,
        lessonContext,
        conceptTags,
        listenMode,
      })

      setMessages(prev => [...prev, {
        role: 'lecturer',
        content: result.answer,
        fromCache: result.fromCache,
        audioUrl: result.audioUrl,
      }])

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

  return (
    <div className="min-h-screen flex flex-col bg-muted">
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
          if (audioSource.current === 'element' && listenMode && currentIndex < elements.length - 1) {
            setCurrentIndex(currentIndex + 1)
          }
        }}
        onError={() => setAudioStatus('error')}
        onLoadStart={() => setAudioStatus('loading')}
      />

      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Wordmark />
            <div className="text-sm text-muted-foreground">
              <Link href={`/courses/${courseSlug}`} className="hover:text-foreground">
                {lesson.module.course.short_name}
              </Link>
              <span className="mx-2">·</span>
              {lesson.module.name}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleListenMode}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                listenMode
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {listenMode ? '🔊 Listen mode on' : '🔇 Listen mode off'}
            </button>
            <Link href={`/courses/${courseSlug}`} className="text-sm text-muted-foreground hover:text-foreground">
              Exit lesson
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Lesson content */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Lesson</div>
            <h1 className="text-2xl font-medium tracking-tight">{lesson.name}</h1>
            {lesson.description && <p className="text-sm text-muted-foreground">{lesson.description}</p>}
          </div>

          <Card>
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="uppercase tracking-wide">{currentElement?.element_type?.replace('_', ' ')}</span>
                <span>{currentIndex + 1} of {elements.length}</span>
              </div>
              {currentElement?.title && (
                <h2 className="text-lg font-medium">{currentElement.title}</h2>
              )}
              <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-foreground">
                {currentElement?.body}
              </div>

              {listenMode && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>
                    {audioStatus === 'loading' && 'Loading audio…'}
                    {audioStatus === 'playing' && '▶ Playing'}
                    {audioStatus === 'paused' && '⏸ Paused'}
                    {audioStatus === 'ended' && '✓ Finished'}
                    {audioStatus === 'error' && '⚠ Audio unavailable for this section'}
                    {audioStatus === 'idle' && 'Ready'}
                  </span>
                  {audioStatus === 'playing' && (
                    <button
                      type="button"
                      onClick={() => audioRef.current?.pause()}
                      className="hover:text-foreground"
                    >
                      Pause
                    </button>
                  )}
                  {audioStatus === 'paused' && (
                    <button
                      type="button"
                      onClick={() => audioRef.current?.play()}
                      className="hover:text-foreground"
                    >
                      Resume
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
              Previous
            </Button>
            {isLast ? (
              <Button onClick={handleComplete} disabled={completing}>
                {completing ? 'Saving…' : 'Complete lesson'}
              </Button>
            ) : (
              <Button onClick={goNext}>
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Lecturer Q&A panel */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Ask the lecturer</div>
            <p className="text-xs text-muted-foreground">Questions about the current section or anything you want clarified.</p>
          </div>

          <Card className="flex flex-col h-[600px]">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3" ref={conversationRef}>
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Ask anything about what you just read.
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={msg.role === 'student' ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <div
                      className={
                        msg.role === 'student'
                          ? 'max-w-[85%] bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm'
                          : msg.role === 'classmate'
                            ? 'max-w-[90%] bg-accent/10 border border-accent/30 rounded-md px-3 py-2 text-sm space-y-1'
                            : 'max-w-[90%] bg-muted rounded-md px-3 py-2 text-sm space-y-1'
                      }
                    >
                      {msg.role === 'classmate' && (
                        <div className="text-xs font-medium text-accent">
                          ✋ {msg.classmateName ?? 'A classmate'} raised their hand
                        </div>
                      )}
                      {msg.role === 'lecturer' ? (
                        <div className="leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_code]:rounded [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      )}
                      {msg.role === 'lecturer' && (msg.fromCache || msg.audioUrl) && (
                        <div className="text-xs text-muted-foreground opacity-70 flex gap-2">
                          {msg.fromCache && <span>cached</span>}
                          {msg.audioUrl && <span>🔊 spoken</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {askingQuestion && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-md px-3 py-2 text-sm text-muted-foreground">
                    Thinking…
                  </div>
                </div>
              )}
              {classmatePending && (
                <div className="flex justify-start">
                  <div className="bg-accent/10 border border-accent/30 rounded-md px-3 py-2 text-xs text-accent">
                    ✋ A classmate is raising their hand…
                  </div>
                </div>
              )}
            </CardContent>

            <form onSubmit={handleAskQuestion} className="border-t border-border p-3 flex gap-2">
              <Input
                type="text"
                placeholder="Type your question…"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                disabled={askingQuestion}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={askingQuestion || !questionInput.trim()}>
                Ask
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
