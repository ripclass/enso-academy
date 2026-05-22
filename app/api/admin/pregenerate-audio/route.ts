import { NextResponse } from 'next/server'
import { pregenerateCourseAudio } from '@/lib/audio/pregenerate'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for Vercel

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { courseId, force = false } = await request.json()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  try {
    const result = await pregenerateCourseAudio({
      courseId,
      force,
      onProgress: (current, total, elementId) => {
        console.log(`[pregenerate] ${current}/${total} ${elementId}`)
      },
    })
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 },
    )
  }
}
