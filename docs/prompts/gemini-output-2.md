=== FILE: components/in-app/UiKit.tsx ===
```tsx
import React from 'react'

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-neutral-200 pb-3 mb-6">
      <h2 className="text-lg font-bold tracking-tight text-primary font-sans">{title}</h2>
      {subtitle && <p className="text-xs text-neutral-500 mt-1 font-sans">{subtitle}</p>}
    </div>
  )
}

export function StatDisplay({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-sans">{label}</p>
      <p className="text-2xl font-bold text-neutral-900 mt-1 font-mono">{value}</p>
      {subtext && <p className="text-xs text-neutral-400 mt-1 font-sans">{subtext}</p>}
    </div>
  )
}

export function StatusBadge({ status }: { status: 'ready' | 'approaching' | 'locked' }) {
  const styles = {
    ready: { bg: 'bg-primary-light text-primary border-primary/20', label: 'Ready' },
    approaching: { bg: 'bg-accent-light text-accent border-accent/20', label: 'Approaching' },
    locked: { bg: 'bg-neutral-100 text-neutral-500 border-neutral-200', label: 'Locked' },
  }
  const config = styles[status]
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider font-mono ${config.bg}`}>
      {config.label}
    </span>
  )
}

export function ConceptMasteryRow({ concept, score }: { concept: string; score: number }) {
  const isStrong = score >= 80
  const isWeak = score < 65
  const barColor = isStrong ? 'bg-primary' : isWeak ? 'bg-accent' : 'bg-neutral-400'
  const textColor = isStrong ? 'text-primary' : isWeak ? 'text-accent' : 'text-neutral-600'

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-neutral-100">
      <span className="text-sm font-semibold text-neutral-700 font-sans truncate pr-4">{concept}</span>
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-24 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
        </div>
        <span className={`text-sm font-bold font-mono w-10 text-right ${textColor}`}>
          {score}%
        </span>
      </div>
    </div>
  )
}
```

=== FILE: components/in-app/Dashboard.tsx ===
```tsx
import React from 'react'
import { ArrowRight, CheckCircle2, AlertTriangle, Play, HelpCircle } from 'lucide-react'
import { SectionHeader, StatusBadge } from './UiKit'
import Link from 'next/link'

interface DashboardProps {
  studentName: string
  courses: Array<{
    id: string
    title: string
    code: string
    progress: number
    mocksTaken: number
    readinessScore: number
  }>
  readinessState: {
    mocksCompleted: number
    averageScore: number
    targetScore: number
    weakestDomain: string
    status: 'ready' | 'approaching' | 'locked'
  }
}

export function Dashboard({ studentName, courses, readinessState }: DashboardProps) {
  const isReady = readinessState.status === 'ready'
  
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 font-sans">
            Welcome back, {studentName}
          </h1>
          <p className="text-sm text-neutral-500 mt-1 font-sans">
            Compliance Officer &bull; Dhaka Bank Ltd.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold font-mono bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded text-neutral-600">
          Last Session: 22 May 2026
        </div>
      </div>

      {/* Readiness / Signoff Status Card (Focal Point) */}
      <div className="rounded-lg border-2 border-neutral-900 bg-white shadow-sm overflow-hidden relative">
        <div className={`h-1.5 w-full ${isReady ? 'bg-primary' : 'bg-accent'}`} />
        
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-neutral-900 font-sans">Readiness Evaluation Status</h2>
                <StatusBadge status={readinessState.status} />
              </div>
              <p className="text-xs text-neutral-500 mt-1 max-w-xl font-sans">
                Official Enso Academy readiness signoff requires 5 full-length mock exams completed with an overall average score of at least 80.0%.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-3xl font-extrabold text-neutral-900 font-mono">
                {readinessState.averageScore}%
              </span>
              <span className="text-xs text-neutral-400 font-mono block">Current Average</span>
            </div>
          </div>

          {/* Monospace stats grid */}
          <div className="grid gap-6 sm:grid-cols-3 mt-6">
            <div className="border-r border-neutral-100 last:border-0 pr-4">
              <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider font-sans block">Mock Progress</span>
              <span className="text-lg font-bold text-neutral-900 font-mono mt-1 block">
                {readinessState.mocksCompleted} / 5 <span className="text-xs text-neutral-400">completed</span>
              </span>
            </div>
            
            <div className="border-r border-neutral-100 last:border-0 pr-4">
              <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider font-sans block">Target Hurdle</span>
              <span className="text-lg font-bold text-neutral-900 font-mono mt-1 block">
                {readinessState.targetScore}.0% <span className="text-xs text-neutral-400">required</span>
              </span>
            </div>

            <div className="pr-4">
              <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider font-sans block">Weakest Domain</span>
              <span className="text-sm font-bold text-accent font-sans mt-1.5 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {readinessState.weakestDomain}
              </span>
            </div>
          </div>

          {/* Action / Warning Notice */}
          <div className="mt-8 bg-neutral-50 rounded border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {isReady ? (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              ) : (
                <HelpCircle className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-bold text-neutral-800 font-sans">
                  {isReady 
                    ? 'Evaluation Criteria Met: Certified Exam Ready.' 
                    : 'Evaluation Criteria Incomplete: Study required.'}
                </p>
                <p className="text-2xs text-neutral-500 mt-0.5 font-sans">
                  {isReady 
                    ? 'Your score profile suggests high probability of first-time pass. You may schedule your official exam.'
                    : `Complete ${5 - readinessState.mocksCompleted} more mock exam(s) and address the ${readinessState.weakestDomain} gap to qualify for signoff.`}
                </p>
              </div>
            </div>
            {isReady ? (
              <button className="bg-primary text-white text-xs font-bold py-2 px-4 rounded hover:bg-primary-hover transition-colors shrink-0">
                Generate Readiness Claim
              </button>
            ) : (
              <Link href="#courses" className="text-xs font-semibold text-primary hover:underline shrink-0 flex items-center gap-1">
                Go to Classroom <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <SectionHeader title="Enrolled Coursework" />
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="rounded-lg border border-neutral-200 bg-white p-6 hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-widest font-mono">
                    {course.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-neutral-400 font-mono">Readiness</span>
                    <span className="text-sm font-bold text-primary font-mono">{course.readinessScore}%</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 mt-2 font-sans">{course.title}</h3>
                
                {/* Progress bar */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 bg-neutral-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 font-mono shrink-0 w-8 text-right">
                    {course.progress}%
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-mono">
                  {course.mocksTaken} mock attempts
                </span>
                <Link
                  href={`/in-app/course`}
                  className="inline-flex h-8 items-center justify-center rounded bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover transition-colors gap-1.5"
                >
                  <Play className="h-3 w-3 fill-current" />
                  Resume Class
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

=== FILE: components/in-app/CoursePage.tsx ===
```tsx
import React from 'react'
import { CheckCircle2, Circle, ArrowLeft, BookOpen, Clock } from 'lucide-react'
import { SectionHeader, ConceptMasteryRow } from './UiKit'
import Link from 'next/link'

interface CoursePageProps {
  courseTitle: string
  courseCode: string
  modules: Array<{
    id: string
    title: string
    lessons: Array<{
      id: string
      title: string
      duration: string
      completed: boolean
    }>
  }>
  concepts: Array<{
    name: string
    score: number
  }>
}

export function CoursePage({ courseTitle, courseCode, modules, concepts }: CoursePageProps) {
  const masteredConcepts = concepts.filter((c) => c.score >= 80)
  const reviewConcepts = concepts.filter((c) => c.score < 80)

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link href="/in-app" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-widest font-mono">
            {courseCode}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 font-sans mt-1">
            {courseTitle}
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Lesson Modules */}
        <div className="lg:col-span-8 space-y-6">
          <SectionHeader title="Course Modules" />
          
          {modules.map((mod, index) => (
            <div key={mod.id} className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
                <span className="text-2xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                  Module {index + 1}
                </span>
                <h3 className="text-base font-bold text-neutral-900 font-sans mt-0.5">{mod.title}</h3>
              </div>
              
              <div className="divide-y divide-neutral-100">
                {mod.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      {lesson.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-4 w-4 text-neutral-300 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <Link href="/in-app/lesson" className="text-sm font-semibold text-neutral-800 hover:text-primary hover:underline transition-colors font-sans">
                          {lesson.title}
                        </Link>
                        <div className="flex items-center gap-3 text-2xs text-neutral-400 mt-1 font-sans">
                          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Core Lesson</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      href="/in-app/lesson"
                      className="inline-flex h-7 items-center justify-center rounded border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      {lesson.completed ? 'Review' : 'Start'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Your Knowledge Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 font-sans">Your Knowledge State</h3>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              Live Bayesian mastery tracking across key exam concepts.
            </p>

            <div className="mt-6 space-y-6">
              {/* Focus Needed */}
              <div>
                <span className="text-2xs font-semibold text-accent uppercase tracking-wider font-mono block mb-2">
                  Focus Needed ({reviewConcepts.length})
                </span>
                <div className="space-y-1">
                  {reviewConcepts.map((concept) => (
                    <ConceptMasteryRow key={concept.name} concept={concept.name} score={concept.score} />
                  ))}
                </div>
              </div>

              {/* Mastered */}
              <div>
                <span className="text-2xs font-semibold text-primary uppercase tracking-wider font-mono block mb-2">
                  Mastered ({masteredConcepts.length})
                </span>
                <div className="space-y-1">
                  {masteredConcepts.map((concept) => (
                    <ConceptMasteryRow key={concept.name} concept={concept.name} score={concept.score} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

=== FILE: components/in-app/LessonPlayer.tsx ===
```tsx
'use client'

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, CornerDownLeft, CircleDot } from 'lucide-react'
import { Mascot } from '../landing/Mascot'
import Link from 'next/link'

interface DialogueMessage {
  role: 'lecturer' | 'student' | 'classmate'
  text: string
  timestamp: string
}

export function LessonPlayer() {
  const [currentScene, setCurrentScene] = useState(3)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  
  const transcript: DialogueMessage[] = [
    {
      role: 'lecturer',
      text: 'Last week you understood the basic definitions of correspondent banking, but downstream relationships were unclear. Remember: in a downstream relationship, the respondent bank acts as an intermediary, routing transactions from its own domestic customers through its correspondent account. Let\'s verify this.',
      timestamp: '14:32'
    },
    {
      role: 'classmate',
      text: 'Wait, does that mean the correspondent bank has direct visibility into the downstream bank\'s individual customers?',
      timestamp: '14:33'
    },
    {
      role: 'lecturer',
      text: 'Excellent question. No, they do not. The correspondent bank only sees the transaction in the respondent bank\'s name, which is exactly why downstream correspondent banking poses a significantly higher AML risk. The respondent bank must perform due diligence, but the correspondent remains blind. Let\'s test this concept.',
      timestamp: '14:34'
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Bar Navigation */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between shrink-0">
        <Link href="/in-app/course" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-3 w-3" /> Exit Classroom
        </Link>
        <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-widest font-mono">
          CDCS Prep &bull; Lesson 4: Correspondent Risk
        </span>
      </header>

      {/* Main Container */}
      <div className="flex-1 grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 overflow-hidden">
        
        {/* Left Column: Lesson Scene Area */}
        <div className="lg:col-span-7 bg-white p-6 md:p-12 flex flex-col justify-between overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full my-auto space-y-8">
            <div>
              <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                Knowledge check
              </span>
              <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight font-sans mt-2">
                Evaluate downstream risk
              </h1>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                A correspondent bank in London provides services to a respondent bank in Dhaka. The respondent bank offers downstream clearing services to small local institutions in the region. 
                What is the primary compliance obligation of the London correspondent bank?
              </p>

              <div className="space-y-3">
                {[
                  { id: 'A', text: 'Conduct direct KYC on all customers of the local Dhaka institutions.' },
                  { id: 'B', text: 'Verify the adequacy and effectiveness of the respondent bank\'s AML controls and due diligence process.' },
                  { id: 'C', text: 'Request copies of all transactions routed through the account on a weekly basis.' },
                  { id: 'D', text: 'Require the respondent bank to disable all downstream services immediately.' }
                ].map((opt) => {
                  const isSelected = selectedOption === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id)}
                      className={`w-full flex items-start gap-4 p-4 text-left border rounded transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary-light/30 text-neutral-900' 
                          : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                      }`}
                    >
                      <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-2xs font-bold mt-0.5 ${
                        isSelected ? 'border-primary bg-primary text-white' : 'border-neutral-300 text-neutral-500'
                      }`}>
                        {opt.id}
                      </span>
                      <span className="text-sm font-semibold font-sans leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto w-full border-t border-neutral-100 pt-6 mt-8 flex items-center justify-between">
            <button 
              disabled={currentScene === 1}
              onClick={() => setCurrentScene(prev => Math.max(1, prev - 1))}
              className="inline-flex h-9 items-center justify-center rounded border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs font-semibold font-mono text-neutral-500">
              Scene {currentScene} of 8
            </span>
            <button 
              onClick={() => setCurrentScene(prev => Math.min(8, prev + 1))}
              className="inline-flex h-9 items-center justify-center rounded bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover transition-colors gap-1.5"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: AI Lecturer Q&A Panel */}
        <div className="lg:col-span-5 bg-neutral-50 flex flex-col justify-between overflow-hidden">
          <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3 shrink-0">
            <Mascot variant="default" size={40} className="shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-neutral-900 font-sans">Enso Guide</h3>
              <p className="text-2xs text-neutral-400 font-mono">Personalized AI Lecturer</p>
            </div>
          </div>

          {/* Socratic Transcript dialogue */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
            {transcript.map((msg, i) => {
              const isLecturer = msg.role === 'lecturer'
              const isClassmate = msg.role === 'classmate'
              
              let prefix = "Lecturer"
              let colorClass = "text-primary"
              if (isClassmate) {
                prefix = "Classmate (Lena)"
                colorClass = "text-accent"
              } else if (msg.role === 'student') {
                prefix = "You"
                colorClass = "text-neutral-700"
              }

              return (
                <div key={i} className="space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xs font-extrabold uppercase tracking-widest font-mono ${colorClass}`}>
                      {prefix}
                    </span>
                    <span className="text-2xs font-mono text-neutral-400">{msg.timestamp}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isClassmate ? 'italic text-neutral-700' : 'text-neutral-800'}`}>
                    {msg.text}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Q&A Input */}
          <div className="bg-white border-t border-neutral-200 p-4 shrink-0">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <input
                type="text"
                placeholder="Ask the Enso Guide a question or answer the prompt..."
                className="w-full rounded border border-neutral-200 bg-white py-3 pl-4 pr-12 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary focus:outline-none font-sans"
              />
              <button 
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded bg-primary text-white hover:bg-primary-hover transition-colors"
                aria-label="Send message"
              >
                <CornerDownLeft className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="mt-2 flex items-center gap-1.5 text-2xs text-neutral-400 font-mono">
              <CircleDot className="h-3 w-3 text-primary animate-pulse" />
              <span>AI Guide is active based on your student knowledge state.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
```

=== FILE: components/in-app/MockExam.tsx ===
```tsx
'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, Flag, CornerDownRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function MockExam() {
  const [currentQuestion, setCurrentQuestion] = useState(12)
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([3, 10])
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, string>>({
    1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A', 6: 'B', 7: 'A', 8: 'D', 9: 'C', 10: 'A', 11: 'B'
  })
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10800) // 3 hours

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${hrs}:${mins}:${secs}`
  }

  const toggleFlag = (qNum: number) => {
    if (flaggedQuestions.includes(qNum)) {
      setFlaggedQuestions(flaggedQuestions.filter((q) => q !== qNum))
    } else {
      setFlaggedQuestions([...flaggedQuestions, qNum])
    }
  }

  const selectAnswer = (ans: string) => {
    setAnsweredQuestions({ ...answeredQuestions, [currentQuestion]: ans })
  }

  const isFlagged = flaggedQuestions.includes(currentQuestion)
  const selectedAnswer = answeredQuestions[currentQuestion] || null
  const unansweredCount = 120 - Object.keys(answeredQuestions).length

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col font-sans select-none">
      
      {/* Sterile Exam Header */}
      <header className="bg-[#1E293B] text-white border-b border-slate-700 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-widest font-mono">
            MOCK EXAM ENGINE
          </span>
          <h1 className="text-sm font-bold text-slate-100 font-sans mt-0.5">
            CDCS-MOCK-4 &bull; Standard Evaluation Mode
          </h1>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-2xs text-slate-400 uppercase font-mono block">TIME REMAINING</span>
            <span className="text-lg font-bold text-amber-500 font-mono tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="bg-red-700 text-white font-bold text-xs py-2.5 px-5 rounded border border-red-800 hover:bg-red-600 transition-colors uppercase tracking-wider font-mono shrink-0 shadow-sm"
          >
            End Test
          </button>
        </div>
      </header>

      {/* Main Work Area */}
      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
        
        {/* Left Column: Navigation Matrix */}
        <div className="lg:col-span-3 bg-white border-r border-slate-200 flex flex-col justify-between overflow-hidden">
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-3">
              Question Navigator (120 Total)
            </h2>
            
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 120 }, (_, i) => {
                const qNum = i + 1
                const isCurrent = qNum === currentQuestion
                const isAns = answeredQuestions[qNum] !== undefined
                const isFlg = flaggedQuestions.includes(qNum)
                
                let bgClass = "bg-slate-50 border-slate-200 text-slate-600"
                if (isCurrent) {
                  bgClass = "bg-blue-900 border-blue-900 text-white"
                } else if (isFlg) {
                  bgClass = "bg-amber-100 border-amber-300 text-amber-800"
                } else if (isAns) {
                  bgClass = "bg-slate-200 border-slate-300 text-slate-800"
                }

                return (
                  <button
                    key={qNum}
                    onClick={() => setCurrentQuestion(qNum)}
                    className={`h-9 border text-center text-xs font-bold font-mono rounded flex items-center justify-center relative ${bgClass}`}
                  >
                    {qNum}
                    {isFlg && <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-slate-500 font-mono text-2xs space-y-1.5 shrink-0">
            <div className="flex justify-between">
              <span>ANSWERED:</span>
              <span className="font-bold text-slate-700">{Object.keys(answeredQuestions).length}</span>
            </div>
            <div className="flex justify-between">
              <span>UNANSWERED:</span>
              <span className="font-bold text-slate-700">{unansweredCount}</span>
            </div>
            <div className="flex justify-between">
              <span>FLAGGED FOR REVIEW:</span>
              <span className="font-bold text-amber-700">{flaggedQuestions.length}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Question Panel */}
        <div className="lg:col-span-9 bg-slate-50 p-6 md:p-12 flex flex-col justify-between overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full my-auto space-y-8 bg-white border border-slate-200 rounded p-8 shadow-sm">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-2xs font-semibold text-slate-400 font-mono uppercase">
                  QUESTION {currentQuestion} OF 120
                </span>
                <h3 className="text-sm font-medium text-slate-500 font-sans mt-0.5">
                  Category: Trade Finance Documents &bull; UCP 600
                </h3>
              </div>
              
              <button
                onClick={() => toggleFlag(currentQuestion)}
                className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded text-xs font-semibold font-mono uppercase tracking-wider transition-colors ${
                  isFlagged 
                    ? 'border-amber-400 bg-amber-50 text-amber-800' 
                    : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700'
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                {isFlagged ? 'Flagged' : 'Flag Question'}
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed font-sans">
                An issuing bank receives a document presentation under a letter of credit governed by UCP 600. 
                The invoice specifies the shipment description as "Refined Bangladeshi Leather Goods," whereas the 
                Letter of Credit specifies the cargo description as "Refined Bangladeshi Leather Bags." 
                The invoice total value and quantities align with the LC rules. 
                According to UCP 600 Article 14(f), how should the examiner treat this presentation?
              </p>

              <div className="space-y-3">
                {[
                  { id: 'A', text: 'Reject the presentation because the shipment description on the invoice must match the LC identically.' },
                  { id: 'B', text: 'Accept the presentation because invoice descriptions need not be identical, provided they describe the goods in terms that are not in conflict.' },
                  { id: 'C', text: 'Reject the presentation because invoice description must correspond to the description of the goods in the credit.' },
                  { id: 'D', text: 'Accept the presentation only if accompanied by a supplementary statement from the beneficiary explaining the terminology.' }
                ].map((opt) => {
                  const isSel = selectedAnswer === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectAnswer(opt.id)}
                      className={`w-full flex items-start gap-4 p-4 text-left border rounded transition-all ${
                        isSel 
                          ? 'border-slate-600 bg-slate-100 text-slate-900' 
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-2xs font-bold mt-0.5 ${
                        isSel ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-300 text-slate-500'
                      }`}>
                        {opt.id}
                      </span>
                      <span className="text-sm font-semibold font-sans leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto w-full mt-6 flex items-center justify-between shrink-0">
            <button
              disabled={currentQuestion === 1}
              onClick={() => setCurrentQuestion((prev) => Math.max(1, prev - 1))}
              className="inline-flex h-9 items-center justify-center rounded border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              disabled={currentQuestion === 120}
              onClick={() => setCurrentQuestion((prev) => Math.min(120, prev + 1))}
              className="inline-flex h-9 items-center justify-center rounded border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Two-step Submit Modal Overlay */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 rounded shadow-xl max-w-md w-full p-6 text-left">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Confirm Test Submission</h3>
                <p className="text-xs text-slate-500 mt-2 font-sans">
                  You are about to submit this mock exam for grading. This action is irreversible and the clock will stop.
                </p>
                
                {unansweredCount > 0 && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3 text-2xs text-amber-800 font-mono flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                      WARNING: You have {unansweredCount} unanswered questions remaining. Unanswered questions are graded as incorrect.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="inline-flex h-9 items-center justify-center rounded border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors font-mono"
              >
                Cancel
              </button>
              <Link
                href="/in-app/results"
                className="inline-flex h-9 items-center justify-center rounded bg-red-700 px-4 text-xs font-semibold text-white hover:bg-red-600 transition-colors font-mono gap-1"
              >
                Confirm Submit <CornerDownRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
```

=== FILE: components/in-app/MockResults.tsx ===
```tsx
'use client'

import React, { useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Bookmark } from 'lucide-react'
import { SectionHeader, StatDisplay } from './UiKit'
import Link from 'next/link'

interface MockResultsProps {
  score: number
  totalQuestions: number
  correctCount: number
  duration: string
  readinessDelta: number
  newReadiness: number
  domains: Array<{
    name: string
    score: number
    total: number
    correct: number
  }>
  questions: Array<{
    id: number
    category: string
    question: string
    correctOption: string
    selectedOption: string
    explanation: string
    source: string
  }>
}

export function MockResults({
  score,
  totalQuestions,
  correctCount,
  duration,
  readinessDelta,
  newReadiness,
  domains,
  questions
}: MockResultsProps) {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)

  const toggleQuestion = (id: number) => {
    setOpenQuestion(openQuestion === id ? null : id)
  }

  const isPassed = score >= 80

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link href="/in-app" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary transition-colors">
        <ArrowLeft className="h-3 w-3" /> Return to Dashboard
      </Link>

      {/* Main Results summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border-2 border-neutral-900 bg-white p-6 flex flex-col justify-between">
          <div>
            <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider font-sans block">Overall Score</span>
            <span className={`text-4xl font-extrabold font-mono mt-2 block ${isPassed ? 'text-primary' : 'text-accent'}`}>
              {score}%
            </span>
          </div>
          <span className="text-2xs font-semibold font-mono text-neutral-400 uppercase mt-4 block">
            {correctCount} / {totalQuestions} Correct
          </span>
        </div>

        <StatDisplay label="TIME SPENT" value={duration} subtext="Time management active" />
        
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider font-sans block">Readiness Impact</span>
          <span className="text-2xl font-bold text-primary font-mono mt-1 block">
            {readinessDelta > 0 ? `+${readinessDelta}%` : `${readinessDelta}%`}
          </span>
          <span className="text-2xs text-neutral-400 mt-1 block font-mono">
            New Readiness Score: {newReadiness}%
          </span>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 flex flex-col justify-between">
          <div>
            <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider font-sans block">Evaluation Verdict</span>
            <span className={`text-sm font-bold font-sans mt-2 block ${isPassed ? 'text-primary' : 'text-accent'}`}>
              {isPassed ? 'Target Hurdle Surpassed' : 'Target Hurdle Unmet'}
            </span>
          </div>
          <span className="text-2xs text-neutral-400 font-sans block mt-2">
            Target signoff requires &gt;= 80.0%
          </span>
        </div>
      </div>

      {/* Domain Breakdown */}
      <div>
        <SectionHeader title="Performance by Domain" />
        <div className="grid gap-4 sm:grid-cols-2">
          {domains.map((dom, i) => {
            const passed = dom.score >= 80
            const weak = dom.score < 65
            const barColor = passed ? 'bg-primary' : weak ? 'bg-accent' : 'bg-neutral-400'
            const textColor = passed ? 'text-primary' : weak ? 'text-accent' : 'text-neutral-600'

            return (
              <div key={i} className="rounded border border-neutral-200 bg-white p-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-neutral-800 font-sans">{dom.name}</span>
                  <span className={`text-xs font-bold font-mono ${textColor}`}>{dom.score}%</span>
                </div>
                
                <div className="mt-3 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor}`} style={{ width: `${dom.score}%` }} />
                </div>
                
                <div className="mt-2 flex justify-between text-2xs text-neutral-400 font-mono">
                  <span>{dom.correct} / {dom.total} Correct</span>
                  <span>Target: 80%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Question Review Section */}
      <div>
        <SectionHeader title="Question-by-Question Evaluation" />
        <div className="space-y-4">
          {questions.map((q) => {
            const isOpen = openQuestion === q.id
            const isCorrect = q.selectedOption === q.correctOption

            return (
              <div key={q.id} className="rounded border border-neutral-200 bg-white overflow-hidden">
                <button
                  onClick={() => toggleQuestion(q.id)}
                  className="flex w-full items-center justify-between p-4 text-left font-sans hover:bg-neutral-50/50 transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-neutral-400 shrink-0 w-8">
                      Q {q.id}
                    </span>
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-accent shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-neutral-800 truncate pr-6">
                      {q.question}
                    </span>
                  </div>
                  
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isOpen && (
                  <div className="border-t border-neutral-100 bg-neutral-50/30 p-6 space-y-4 text-sm font-sans">
                    <div>
                      <p className="font-bold text-neutral-800">Question Content</p>
                      <p className="text-neutral-600 mt-1 leading-relaxed">{q.question}</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className={`p-3 rounded border ${isCorrect ? 'border-primary/20 bg-primary-light/10' : 'border-accent/20 bg-accent-light/10'}`}>
                        <span className="text-2xs font-semibold uppercase tracking-wider font-mono block text-neutral-400">
                          Your Selected Response
                        </span>
                        <span className={`text-sm font-semibold font-mono block mt-1 ${isCorrect ? 'text-primary' : 'text-accent'}`}>
                          Option {q.selectedOption}
                        </span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="p-3 rounded border border-primary/20 bg-primary-light/10">
                          <span className="text-2xs font-semibold uppercase tracking-wider font-mono block text-neutral-400">
                            Correct Reference Response
                          </span>
                          <span className="text-sm font-semibold font-mono text-primary block mt-1">
                            Option {q.correctOption}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-neutral-100 pt-4 space-y-2">
                      <p className="font-bold text-neutral-800">Supervisory Evaluation & Rationale</p>
                      <p className="text-neutral-600 leading-relaxed text-xs">{q.explanation}</p>
                      
                      <div className="flex items-center gap-1.5 text-2xs font-semibold text-neutral-400 font-mono pt-2">
                        <Bookmark className="h-3.5 w-3.5" />
                        <span>Source Material Reference: {q.source}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

=== FILE: app/in-app/page.tsx ===
```tsx
'use client'

import React, { useState } from 'react'
import { Logo } from '@/components/landing/Logo'
import { Dashboard } from '@/components/in-app/Dashboard'
import { CoursePage } from '@/components/in-app/CoursePage'
import { LessonPlayer } from '@/components/in-app/LessonPlayer'
import { MockExam } from '@/components/in-app/MockExam'
import { MockResults } from '@/components/in-app/MockResults'
import { LayoutDashboard, GraduationCap, PlayCircle, ClipboardList, BarChart3 } from 'lucide-react'

const mockDashboardData = {
  studentName: "Mohammad Rahman",
  courses: [
    {
      id: "cdcs",
      title: "Certified Documentary Credit Specialist (CDCS)",
      code: "LIBF-CDCS",
      progress: 74,
      mocksTaken: 3,
      readinessScore: 78
    },
    {
      id: "cams",
      title: "Certified Anti-Money Laundering Specialist (CAMS)",
      code: "ACAMS-CAMS",
      progress: 12,
      mocksTaken: 0,
      readinessScore: 45
    }
  ],
  readinessState: {
    mocksCompleted: 3,
    averageScore: 78.4,
    targetScore: 80.0,
    weakestDomain: "UCP 600 Standard Examinations",
    status: 'approaching' as const
  }
}

const mockCourseData = {
  courseTitle: "Certified Documentary Credit Specialist (CDCS)",
  courseCode: "LIBF-CDCS",
  modules: [
    {
      id: "m1",
      title: "International Trade Operations & Rules",
      lessons: [
        { id: "l1", title: "Introduction to Trade Finance & Settlement Methods", duration: "25 min", completed: true },
        { id: "l2", title: "UCP 600 Structure, Scope, and Key Definitions", duration: "45 min", completed: true },
        { id: "l3", title: "Standby Letters of Credit & ISP98 Framework", duration: "35 min", completed: false }
      ]
    },
    {
      id: "m2",
      title: "Standard Document Examination under UCP 600",
      lessons: [
        { id: "l4", title: "Article 14: Standard Examination Obligations", duration: "50 min", completed: false },
        { id: "l5", title: "Article 18-21: Commercial Invoices, Bills of Lading", duration: "60 min", completed: false }
      ]
    }
  ],
  concepts: [
    { name: "Letters of Credit core mechanics", score: 88 },
    { name: "UCP 600 Article 14 standard", score: 62 },
    { name: "Commercial Invoices exam criteria", score: 85 },
    { name: "Nested Correspondent Banking risk", score: 58 },
    { name: "ISP98 Standby Letter of Credit rules", score: 72 }
  ]
}

const mockResultsData = {
  score: 78.4,
  totalQuestions: 120,
  correctCount: 94,
  duration: "02:34:11",
  readinessDelta: 2.4,
  newReadiness: 78.4,
  domains: [
    { name: "UCP 600 Rules & Definitions", score: 82, total: 40, correct: 33 },
    { name: "Standard Examinations (Art. 14)", score: 62, total: 30, correct: 19 },
    { name: "ISP98 & Standby Credits", score: 85, total: 25, correct: 21 },
    { name: "Guarantees & Trade Finance Risk", score: 84, total: 25, correct: 21 }
  ],
  questions: [
    {
      id: 1,
      category: "UCP 600 Article 14",
      question: "An invoice lists cargo as 'Refined Bangladeshi Leather Goods' whereas the LC specifies 'Refined Bangladeshi Leather Bags'. Invoice values, codes, and quantities match. Under UCP 600 Article 14(f), does this constitute a discrepant document?",
      selectedOption: "A",
      correctOption: "C",
      explanation: "UCP 600 Article 14(f) states that a document description of goods, services, or performance, if any, must not conflict with that in the credit. However, Article 18(c) specifically mandates that the description of the goods in a commercial invoice must correspond with that in the credit. Therefore, 'Goods' vs 'Bags' represents a discrepancy because the invoice must correspond to the credit description exactly, whereas other documents only require non-conflicting descriptions.",
      source: "UCP 600 Article 18(c) and ICC Publication 745 (ISBP)"
    },
    {
      id: 2,
      category: "Trade Finance Risk",
      question: "Which relationship type describes a scenario where a correspondent bank processes transactions routed from local respondent bank branches via a centralized hub bank without the correspondent having direct KYC access?",
      selectedOption: "B",
      correctOption: "B",
      explanation: "This describes downstream correspondent clearing. The respondent bank pools customer deposits and trade transactions, clearing them in its own name. The foreign correspondent bank does not see individual customer data, elevating AML/CFT exposure. Controls must focus on auditing the respondent bank's institutional compliance checks.",
      source: "Wolfsberg Group Correspondent Banking Principles, Section 2"
    }
  ]
}

export default function InAppSandbox() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'course' | 'lesson' | 'mock' | 'results'>('dashboard')

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
            <Dashboard {...mockDashboardData} />
          </div>
        )
      case 'course':
        return (
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
            <CoursePage {...mockCourseData} />
          </div>
        )
      case 'lesson':
        return <LessonPlayer />
      case 'mock':
        return <MockExam />
      case 'results':
        return (
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
            <MockResults {...mockResultsData} />
          </div>
        )
    }
  }

  const isCustomLayout = activeTab === 'lesson' || activeTab === 'mock'

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Side Navigation Bar */}
      {!isCustomLayout && (
        <aside className="w-64 bg-[#0F1717] text-white flex flex-col justify-between shrink-0 hidden md:flex">
          <div>
            <div className="p-6 border-b border-neutral-800">
              <Logo className="text-white" />
            </div>

            <nav className="p-4 space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'course', label: 'Course Overview', icon: GraduationCap },
                { id: 'lesson', label: 'Active Lesson', icon: PlayCircle },
                { id: 'mock', label: 'Mock Exam Room', icon: ClipboardList },
                { id: 'results', label: 'Mock Evaluation', icon: BarChart3 }
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-semibold transition-colors ${
                      isActive ? 'bg-primary text-white font-bold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-neutral-800 text-2xs text-neutral-500 font-mono">
            <span>Enso Academy v6.0.0</span>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!isCustomLayout && (
          <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 md:hidden">
              <Logo />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex md:hidden gap-1 bg-neutral-100 p-1 rounded">
                {['dashboard', 'course', 'lesson', 'mock', 'results'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-2 py-1 text-2xs font-bold rounded uppercase tracking-wider ${
                      activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'
                    }`}
                  >
                    {tab.substring(0, 4)}
                  </button>
                ))}
              </div>
              
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-2xs font-semibold text-neutral-500 font-mono">SECURE ENVIRONMENT</span>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </div>
    </div>
  )
}
```

---

## Design Rationale

1. **Brand System Integration**: Extends the core visual system—combining the primary Deep Teal (`#0F3D3E`) representing institutional structure, with functional highlights of Warm Coral (`#E07856`) pointing out weak concept areas, flagged questions, and incorrect reviews.
2. **Typography Rules**: Set headings strictly in `font-sans` (`Outfit`), utilizing a heavier tracking and bold sizing to echo standard Bloomberg Law / Financial Times report headers. Built all stats, completion counts, timers, and mathematical scores in `font-mono` (`Geist Mono`) to project data audibility and empirical precision.
3. **Auditable Evaluation Layout**: Designed the Dashboard Readiness status card to look like a secure regulatory checklist, detailing requirements (X/5 mocks, minimum average, weakest sub-domain) using structured outlines and warning flags rather than printable certificate vectors, signaling a strict, professional evaluation program.
4. **Cold Fidelity Testing Engine**: Styled the Mock Exam engine using a sterile layout (cold slate borders, high-contrast grid numbers, simple headers), visually preparing the student for Pearson VUE testing conditions.
5. **Focused Socratic Panel**: Rendered the Lesson Player's AI Q&A panel as a simple transcript, displaying chronological, unadorned typography instead of game-like chat bubbles.

## Assumptions

1. **Path Alias Mapping**: Assumes `@/components/...` resolves to the project's root components directory for importing standard Mascot and Logo configurations.
2. **Device Responsiveness**: Designed layouts to adapt from mobile-first screens (stacked blocks) to multi-column desktop structures (lesson sidebar dialogue).
3. **Client-Side States**: Assumes interactive modal panels (submit warnings, review toggles) compile under Next.js App Router rules using `'use client'`.
