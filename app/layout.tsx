import '@/styles/globals.css'
import { Geist, Geist_Mono } from "next/font/google"
import { PostHogProvider } from '@/app/providers'
import { TRPCProvider } from './trpc-provider'
import { Metadata } from 'next'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: 'Sanne - Mobile Clothing Store',
  description: 'Explore our collection of men\'s and women\'s clothing',
}

// We'll use a Client Component wrapper to handle hydration mismatches
function ClientOnlyProvider({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <PostHogProvider>
        {children}
      </PostHogProvider>
    </TRPCProvider>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <ClientOnlyProvider>
          {children}
        </ClientOnlyProvider>
      </body>
    </html>
  )
}
