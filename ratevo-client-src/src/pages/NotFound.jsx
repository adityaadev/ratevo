import { Link } from 'react-router-dom'
import { Button } from '../components'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--text-subtle)]">404</h1>
        <h2 className="mt-4 text-heading-lg font-semibold text-white">Page not found</h2>
        <p className="mt-2 text-[var(--text-muted)]">Sorry, we couldn&apos;t find the page you&apos;re looking for.</p>
        <Button variant="primary" size="lg" asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}