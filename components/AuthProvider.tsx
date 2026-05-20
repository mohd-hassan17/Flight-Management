// ============================================================
// components/AuthProvider.tsx
// Wraps the app and keeps useUserStore in sync with the
// Supabase auth session at all times.
// ============================================================
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'
import { useFlightStore } from '@/store/useFlightStore'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const setSession = useUserStore((s) => s.setSession)
  const resetUser = useUserStore((s) => s.reset)
  const resetFlight = useFlightStore((s) => s.reset)

  useEffect(() => {
    // Hydrate session on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)

        // On logout, clear both stores
        if (!session) {
          resetUser()
          resetFlight()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>
}
