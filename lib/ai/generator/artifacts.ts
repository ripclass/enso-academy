// lib/ai/generator/artifacts.ts
// Persists each generation stage's output as a JSON artifact under generated/
// (gitignored) before anything is written to the database. This makes a run
// resumable — a $-thousands run that dies mid-way resumes from its artifacts —
// and lets a human review the content before it becomes a course.

import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function courseDir(slug: string): string {
  const dir = join(process.cwd(), 'generated', slug)
  mkdirSync(join(dir, 'lessons'), { recursive: true })
  mkdirSync(join(dir, 'assessment'), { recursive: true })
  return dir
}

export function saveArtifact(slug: string, name: string, data: unknown): string {
  const path = join(courseDir(slug), name)
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
  return path
}

export function loadArtifact<T>(slug: string, name: string): T | null {
  const path = join(courseDir(slug), name)
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : null
}

export function artifactExists(slug: string, name: string): boolean {
  return existsSync(join(courseDir(slug), name))
}

/** Artifact filenames in a subdir, relative to the course dir — e.g. listArtifacts(slug, 'lessons'). */
export function listArtifacts(slug: string, subdir: string): string[] {
  const dir = join(courseDir(slug), subdir)
  return existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => `${subdir}/${f}`)
    : []
}
