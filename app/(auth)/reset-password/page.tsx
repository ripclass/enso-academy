import { ResetPasswordForm } from './reset-password-form'
import Link from 'next/link'

export const metadata = {
  title: 'Reset your password — Enso Academy',
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-medium tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you a link.
        </p>
      </div>

      <ResetPasswordForm />

      <p className="text-sm text-center text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
