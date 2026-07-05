import { redirect } from 'next/navigation'

// The course library and catalog now live on the home (dashboard). Keep this
// route working for old links by sending it there.
export default function CoursesPage() {
  redirect('/dashboard')
}
