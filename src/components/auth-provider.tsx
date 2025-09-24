'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Check if NextAuth environment variables are properly set
    if (typeof window !== 'undefined') {
      console.log('NextAuth URL:', process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'not set')
    }
  }, [])

  return (
    <SessionProvider
      // Add refetch interval to prevent stale sessions
      refetchInterval={5 * 60} // 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}