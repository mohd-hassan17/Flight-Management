// ============================================================
// store/useUserStore.ts
// Manages the Supabase auth session and the user's booking
// cache (for My Bookings page).
//
// persist saves ONLY the session token — not booking details.
// Booking data is always re-fetched fresh on mount.
// ============================================================
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import type { BookingWithDetails } from '@/types/database'

interface UserState {
  // ---------- auth ----------
  session: Session | null
  user: User | null

  // ---------- bookings cache ----------
  // Populated after fetching from Supabase.
  // Used to render My Bookings page without a loading flash
  // on return visits (stale-while-revalidate pattern).
  cachedBookings: BookingWithDetails[]
  bookingsLoading: boolean

  // ---------- actions ----------
  setSession: (session: Session | null) => void
  setCachedBookings: (bookings: BookingWithDetails[]) => void
  setBookingsLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  session: null,
  user: null,
  cachedBookings: [],
  bookingsLoading: false,
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setSession: (session) =>
        set({ session, user: session?.user ?? null }),

      setCachedBookings: (bookings) =>
        set({ cachedBookings: bookings }),

      setBookingsLoading: (loading) =>
        set({ bookingsLoading: loading }),

      // Called on logout — wipes session and cache
      reset: () => set(initialState),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),

      // Only persist the session token.
      // Booking details are never stored in localStorage —
      // they're re-fetched on every page load.
      partialize: (state) => ({
        session: state.session,
        user: state.user,
      }),
    }
  )
)
