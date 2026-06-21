'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { setAvatarChoice, type AvatarChoice } from '@/lib/settings'

/** Lets the student pick their avatar (male / female). Saves on click. */
export function AvatarPicker({ initial }: { initial: AvatarChoice }) {
  const [choice, setChoice] = useState<AvatarChoice>(initial)
  const [saving, setSaving] = useState(false)

  async function pick(c: AvatarChoice) {
    if (c === choice || saving) return
    setChoice(c)
    setSaving(true)
    try {
      await setAvatarChoice(c)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {(['female', 'male'] as AvatarChoice[]).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => pick(c)}
          aria-label={`Use the ${c} avatar`}
          className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 transition-all ${
            choice === c
              ? 'border-primary shadow-[0_0_0_3px_rgba(15,61,62,0.12)]'
              : 'border-neutral-200 hover:border-primary/50'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/avatars/user-${c}.webp`} alt={c} className="h-full w-full bg-white object-cover" />
          {choice === c && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-primary text-white">
              <Check className="h-3 w-3" />
            </span>
          )}
        </button>
      ))}
      <span className="font-mono text-2xs text-neutral-400">{saving ? 'Saving…' : 'Choose your avatar'}</span>
    </div>
  )
}
