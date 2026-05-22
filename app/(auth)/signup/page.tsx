import { SignupForm } from './signup-form'
import Link from 'next/link'

export const metadata = {
  title: 'Create your account',
  description: 'Create your Enso Academy account.',
}

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-medium tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start preparing for your certification.
        </p>
      </div>

      <SignupForm />

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
