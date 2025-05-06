'use client'

import posthog from 'posthog-js'
import { PostHogProvider as OriginalPostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense, useState } from 'react'

// Use a useEffect for PostHog initialization to prevent hydration mismatch
function PostHogInitializer() {
  const [initialized, setInitialized] = useState(false)
  
  useEffect(() => {
    // Only initialize PostHog on the client side
    if (!initialized && typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host: '/ingest',
        ui_host: 'https://us.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug()
        },
        debug: process.env.NODE_ENV === 'development',
      })
      setInitialized(true)
    }
  }, [initialized])
  
  return null
}

// Create a client component that uses the hooks
function PostHogPageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
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
      <PostHogInitializer />
      <Suspense fallback={<PostHogFallback />}>
        <PostHogPageViewTracker />
      </Suspense>
      {children}
    </OriginalPostHogProvider>
  )
}
