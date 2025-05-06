// Server component for the built-in _not-found route
// This avoids the useSearchParams() client-side hook issue

import Image from 'next/image'
import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <Image
        src="/sanne-transparent.png"
        alt="Sanne"
        width={120}
        height={40}
        className="mb-8"
      />
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-8">
        We couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link
        href="/"
        className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition"
      >
        Return to Shop
      </Link>
    </div>
  )
}
