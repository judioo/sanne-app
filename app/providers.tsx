'use client'

import posthog from 'posthog-js'
import { PostHogProvider as OriginalPostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    },
    debug: process.env.NODE_ENV === 'development',
  })
}

// Create a client component that uses the hooks
function PostHogPageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])
  
  return null
}

// Add a fallback component
function PostHogFallback() {
  return null // Empty fallback for the Suspense boundary
}

// Main provider component
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <OriginalPostHogProvider client={posthog}>
      <Suspense fallback={<PostHogFallback />}>
        <PostHogPageViewTracker />
      </Suspense>
      {children}
    </OriginalPostHogProvider>
  )
}
