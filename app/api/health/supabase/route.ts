import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = createAdminClient()
  const { error, count } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    courses_count: count ?? 0,
    timestamp: new Date().toISOString(),
  })
}
