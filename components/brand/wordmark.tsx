import Link from 'next/link'

export function Wordmark({ href = '/', className = '' }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`wordmark text-xl text-foreground hover:text-primary transition-colors ${className}`}
    >
      Enso Academy
    </Link>
  )
}
