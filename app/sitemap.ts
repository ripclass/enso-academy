import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE = 'https://www.ensoacademy.ai'

// Public, indexable surfaces only. Course routes are derived from the DB so a
// newly published course (e.g. CCAS) appears without a code change.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  try {
    const admin = createAdminClient()
    const { data: courses } = await admin
      .from('courses')
      .select('slug')
      .eq('status', 'published')
    for (const c of courses ?? []) {
      entries.push(
        { url: `${BASE}/courses/${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE}/courses/${c.slug}/guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE}/courses/${c.slug}/cases`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      )
    }
  } catch {
    // DB unavailable at build: ship the static entries rather than failing.
  }

  return entries
}
