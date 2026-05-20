export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Authentication error</h1>
        <p className="text-neutral-600">Something went wrong. Please try again.</p>
      </div>
    </div>
  )
}
