'use client'

import { ReactNode } from 'react'
import { PostHogProvider } from './PostHogProvider'

export default function Providers({ children }: { children: ReactNode }) {
  return <PostHogProvider>{children}</PostHogProvider>
}