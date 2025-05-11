'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logger } from '@/utils/logger'

export default function ResetPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all localStorage items
    try {
      logger.info('Clearing localStorage')
      
      // Get all localStorage keys
      const keys = Object.keys(localStorage)
      logger.info(`Found ${keys.length} items in localStorage`)
      
      // Log items being removed (for debugging)
      keys.forEach(key => {
        logger.info(`Removing localStorage item: ${key}`)
      })
      
      // Clear all items
      localStorage.clear()
      
      // Redirect back to home page after a short delay
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      logger.error('Error clearing localStorage:', error)
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Resetting Application</h1>
      <p className="mb-6">Clearing all cached data...</p>
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900 mb-4"></div>
      <p className="text-sm text-gray-500">You will be redirected to the home page shortly.</p>
    </div>
  )
}
