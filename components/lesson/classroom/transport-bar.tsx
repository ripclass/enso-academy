'use client'

import { Play, Pause, SkipBack, SkipForward, RotateCcw, Volume2, VolumeX } from 'lucide-react'

/**
 * Video-style transport for the lesson stage. Play/pause drives narration;
 * prev/next moves between scenes; replay restarts the current scene's
 * narration; the speed pill cycles playback rate; the sound toggle mutes
 * narration (manual reading) without leaving the player.
 */
export function TransportBar({
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  onReplay,
  canPrev,
  canNext,
  speed,
  onCycleSpeed,
  muted,
  onToggleMute,
}: {
  isPlaying: boolean
  onPlayPause: () => void
  onPrev: () => void
  onNext: () => void
  onReplay: () => void
  canPrev: boolean
  canNext: boolean
  speed: number
  onCycleSpeed: () => void
  muted: boolean
  onToggleMute: () => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white/90 px-2 py-1.5 shadow-md backdrop-blur">
      <IconBtn label="Mute narration" onClick={onToggleMute}>
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </IconBtn>

      <button
        type="button"
        onClick={onCycleSpeed}
        className="rounded-md px-2 py-1 font-mono text-2xs font-semibold tabular-nums text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary"
        aria-label="Playback speed"
      >
        {speed}×
      </button>

      <IconBtn label="Previous scene" onClick={onPrev} disabled={!canPrev}>
        <SkipBack className="h-4 w-4" />
      </IconBtn>

      {/* Primary play / pause */}
      <button
        type="button"
        onClick={onPlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="mx-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary-hover"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
      </button>

      <IconBtn label="Next scene" onClick={onNext} disabled={!canNext}>
        <SkipForward className="h-4 w-4" />
      </IconBtn>

      <IconBtn label="Replay scene" onClick={onReplay}>
        <RotateCcw className="h-4 w-4" />
      </IconBtn>
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}
