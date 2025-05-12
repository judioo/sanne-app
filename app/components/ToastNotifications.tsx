'use client'

import { Toaster } from 'react-hot-toast'

/**
 * Global toast container component that can be used throughout the app
 */
export default function ToastNotifications() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#333',
          color: '#fff',
          maxWidth: '90%',
          width: 'auto',
        },
        success: {
          duration: 8000,
          iconTheme: {
            primary: '#4ade80',
            secondary: '#fff',
          },
        },
        error: {
          duration: 8000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}
