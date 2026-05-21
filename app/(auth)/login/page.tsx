import { Suspense } from 'react'
import { LoginForm } from './login-form'
import Link from 'next/link'

export const metadata = {
  title: 'Sign in — Enso Academy',
  description: 'Sign in to your Enso Academy account.',
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-medium tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue your studies.
        </p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="text-sm text-center text-muted-foreground">
        New to Enso Academy?{' '}
        <Link href="/signup" className="text-primary hover:text-primary-hover font-medium">
          Create an account
        </Link>
      </p>
    </div>
  )
}
