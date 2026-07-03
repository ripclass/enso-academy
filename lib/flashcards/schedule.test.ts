// Run: pnpm tsx lib/flashcards/schedule.test.ts
// Pure-logic test for the Leitner flashcard scheduler. No framework (the project
// has none); plain node:assert, throws on failure -> non-zero exit.
import assert from 'node:assert/strict'
import { nextState, intervalHint, LEARNED_BOX } from './schedule'

const now = new Date('2026-07-03T12:00:00Z')
const DAY = 86400000
const at = (days: number) => new Date(now.getTime() + days * DAY)

// ── new card (prevBox null) is treated as box 1 ───────────────────────────────
assert.deepEqual(nextState(null, 'again', now), { box: 1, dueAt: now }, 'new+again -> box1, due now')
assert.deepEqual(nextState(null, 'good', now), { box: 2, dueAt: at(1) }, 'new+good -> box2, +1d')
assert.deepEqual(nextState(null, 'easy', now), { box: 3, dueAt: at(3) }, 'new+easy -> box3, +3d')

// ── mid-ladder transitions ────────────────────────────────────────────────────
assert.deepEqual(nextState(2, 'again', now), { box: 1, dueAt: now }, 'box2+again -> box1, due now')
assert.deepEqual(nextState(2, 'good', now), { box: 3, dueAt: at(3) }, 'box2+good -> box3, +3d')
assert.deepEqual(nextState(2, 'easy', now), { box: 4, dueAt: at(7) }, 'box2+easy -> box4, +7d')
assert.deepEqual(nextState(3, 'easy', now), { box: 5, dueAt: at(21) }, 'box3+easy -> box5 (min), +21d')
assert.deepEqual(nextState(4, 'good', now), { box: 5, dueAt: at(21) }, 'box4+good -> box5, +21d')

// ── clamp at box 5 ────────────────────────────────────────────────────────────
assert.deepEqual(nextState(5, 'good', now), { box: 5, dueAt: at(21) }, 'box5+good stays box5')
assert.deepEqual(nextState(5, 'easy', now), { box: 5, dueAt: at(21) }, 'box5+easy stays box5')
assert.deepEqual(nextState(5, 'again', now), { box: 1, dueAt: now }, 'box5+again resets to box1')

// ── learned threshold ─────────────────────────────────────────────────────────
assert.equal(LEARNED_BOX, 4, 'learned starts at box 4 (>= 7d interval)')

// ── interval hints (what each button would produce from the current box) ──────
assert.equal(intervalHint(null, 'again'), '<1d', 'new again hint')
assert.equal(intervalHint(null, 'good'), '+1d', 'new good hint')
assert.equal(intervalHint(2, 'good'), '+3d', 'box2 good hint')
assert.equal(intervalHint(2, 'easy'), '+7d', 'box2 easy hint')
assert.equal(intervalHint(4, 'good'), '+21d', 'box4 good hint')

console.log('schedule: all assertions passed')
