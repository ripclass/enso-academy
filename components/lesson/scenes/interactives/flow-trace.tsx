'use client'

import { useMemo, useState } from 'react'
import { Check, RotateCcw, AlertTriangle } from 'lucide-react'
import type { FlowNode, FlowEdge } from '@/lib/lesson/scenes'

/**
 * Transaction-network "follow the money" widget. A hand-laid graph of entities
 * (HTML nodes) connected by directed transactions (SVG edges). The student
 * clicks nodes in order to trace the laundering route from the source to the
 * destination; only nodes reachable by an outgoing edge from the current tail
 * are selectable, so the route is always a valid walk — the challenge is picking
 * the right branch among the feeders/decoys. "Check route" validates the ordered
 * route against `path`. Binary result feeds the knowledge model.
 */
export function FlowTrace({
  prompt,
  nodes,
  edges,
  path,
  why,
  onComplete,
}: {
  prompt?: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  path: string[]
  why: string
  onComplete?: (correct: number, total: number) => void
}) {
  const [route, setRoute] = useState<string[]>([])
  const [checked, setChecked] = useState(false)

  const byId = useMemo(() => {
    const m: Record<string, FlowNode> = {}
    for (const n of nodes) m[n.id] = n
    return m
  }, [nodes])

  const tail = route[route.length - 1]
  const correct = route.length === path.length && route.every((id, i) => id === path[i])
  const sourceLabel = byId[path[0]]?.label ?? 'the source'
  const destLabel = byId[path[path.length - 1]]?.label ?? 'the destination'

  function nodeClickable(id: string): boolean {
    if (checked) return false
    if (route.length === 0) return id === path[0] // must start at the source
    if (id === tail) return true // click the tail again to undo
    return edges.some((e) => e.from === tail && e.to === id)
  }

  function clickNode(id: string) {
    if (!nodeClickable(id)) return
    setRoute((r) => (id === r[r.length - 1] ? r.slice(0, -1) : [...r, id]))
  }

  function check() {
    setChecked(true)
    onComplete?.(correct ? 1 : 0, 1)
  }

  function reset() {
    setChecked(false)
    setRoute([])
  }

  function edgeOnRoute(e: FlowEdge): boolean {
    for (let i = 0; i < route.length - 1; i++) {
      if (route[i] === e.from && route[i + 1] === e.to) return true
    }
    return false
  }

  return (
    <div className="space-y-4">
      {prompt && <p className="text-sm leading-relaxed text-neutral-600">{prompt}</p>}
      <p className="text-sm text-neutral-700">
        Trace how the funds get from <span className="font-semibold">{sourceLabel}</span> to{' '}
        <span className="font-semibold">{destLabel}</span>. Click each account along the path.
      </p>

      <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50/50" style={{ aspectRatio: '5 / 3' }}>
        {/* Edges */}
        <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
          <defs>
            <marker id="ft-arrow" markerWidth="5" markerHeight="5" refX="4.2" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z" className="fill-neutral-300" />
            </marker>
            <marker id="ft-arrow-on" markerWidth="5" markerHeight="5" refX="4.2" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5 Z" className="fill-primary" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const a = byId[e.from]
            const b = byId[e.to]
            if (!a || !b) return null
            const on = edgeOnRoute(e)
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={on ? 'stroke-primary' : 'stroke-neutral-300'}
                strokeWidth={on ? 1.1 : 0.6}
                markerEnd={`url(#${on ? 'ft-arrow-on' : 'ft-arrow'})`}
              />
            )
          })}
        </svg>

        {/* Amount labels */}
        {edges.map((e, i) => {
          const a = byId[e.from]
          const b = byId[e.to]
          if (!a || !b || !e.amount) return null
          return (
            <span
              key={i}
              style={{ left: `${(a.x + b.x) / 2}%`, top: `${(((a.y + b.y) / 2) / 60) * 100}%` }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded bg-white/90 px-1 font-mono text-[10px] leading-tight text-neutral-500 shadow-sm"
            >
              {e.amount}
            </span>
          )
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const order = route.indexOf(n.id)
          const inRoute = order >= 0
          const clickable = nodeClickable(n.id)
          const isDecoy = checked && !correct && n.role === 'decoy'
          let tone =
            'border-neutral-300 bg-white text-neutral-700'
          if (inRoute) tone = 'border-primary bg-primary text-white shadow-md'
          else if (isDecoy) tone = 'border-rose-300 bg-rose-50 text-rose-700'
          else if (clickable) tone = 'border-primary/60 bg-white text-primary ring-2 ring-primary/20'
          else if (checked) tone = 'border-neutral-200 bg-white text-neutral-400'
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => clickNode(n.id)}
              disabled={!clickable && !inRoute}
              style={{ left: `${n.x}%`, top: `${(n.y / 60) * 100}%` }}
              className={`absolute flex max-w-[28%] -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border px-2 py-1 text-center text-[11px] font-medium leading-tight transition-colors ${tone} ${
                clickable || inRoute ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {inRoute && (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary">
                  {order + 1}
                </span>
              )}
              <span className="min-w-0">{n.label}</span>
            </button>
          )
        })}
      </div>

      {/* Controls + feedback */}
      {checked ? (
        <div className="space-y-3">
          <div
            className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
              correct ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
            }`}
          >
            {correct ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            )}
            <span>
              <span className="font-semibold">{correct ? 'That follows the money. ' : 'Not the laundering route. '}</span>
              {correct ? why : `That path doesn't reach ${destLabel} the way the funds moved. The red nodes are feeders or dead-ends. Try again.`}
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition-colors hover:text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-neutral-400">
            {route.length === 0
              ? `Start at ${sourceLabel}.`
              : `${route.map((id) => byId[id]?.label ?? id).join(' → ')}`}
          </span>
          <button
            type="button"
            onClick={check}
            disabled={route.length < 2}
            className="inline-flex h-9 shrink-0 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            Check route
          </button>
        </div>
      )}
    </div>
  )
}
