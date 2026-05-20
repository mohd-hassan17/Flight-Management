// ============================================================
// store/useFlightStore.ts
// Controls the entire booking journey:
//   search query → flight selection → seat selection →
//   passenger form → booking step tracking
//
// persist middleware saves progress to localStorage so users
// can resume after closing the tab.
//
// partialize EXCLUDES passport_no — sensitive data never
// touches localStorage.
// ============================================================
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Flight,
  Seat,
  FlightSearchParams,
  PassengerFormData,
} from '@/types/database'

// Booking wizard steps
export type BookingStep = 'search' | 'results' | 'seats' | 'passengers' | 'confirmation'

interface FlightState {
  // ---------- search ----------
  searchQuery: FlightSearchParams | null

  // ---------- selection ----------
  selectedFlight: Flight | null
  selectedSeat: Seat | null          // optimistic — set before Supabase write confirms

  // ---------- booking wizard ----------
  currentStep: BookingStep
  passengerData: PassengerFormData | null

  // ---------- confirmed booking ----------
  confirmedBookingId: string | null
  confirmedPnr: string | null

  // ---------- actions ----------
  setSearchQuery: (query: FlightSearchParams) => void
  setSelectedFlight: (flight: Flight) => void
  setSelectedSeat: (seat: Seat | null) => void   // null = deselect (optimistic rollback)
  setCurrentStep: (step: BookingStep) => void
  setPassengerData: (data: PassengerFormData) => void
  setConfirmedBooking: (bookingId: string, pnr: string) => void
  reset: () => void
}

const initialState = {
  searchQuery: null,
  selectedFlight: null,
  selectedSeat: null,
  currentStep: 'search' as BookingStep,
  passengerData: null,
  confirmedBookingId: null,
  confirmedPnr: null,
}

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchQuery: (query) =>
        set({ searchQuery: query, currentStep: 'results' }),

      setSelectedFlight: (flight) =>
        set({ selectedFlight: flight, selectedSeat: null, currentStep: 'seats' }),

      // Optimistic: call this immediately when user clicks a seat,
      // before the Supabase reserve_seat RPC responds.
      // If the RPC fails, call setSelectedSeat(null) to roll back.
      setSelectedSeat: (seat) =>
        set({ selectedSeat: seat }),

      setCurrentStep: (step) =>
        set({ currentStep: step }),

      setPassengerData: (data) =>
        set({ passengerData: data, currentStep: 'confirmation' }),

      setConfirmedBooking: (bookingId, pnr) =>
        set({ confirmedBookingId: bookingId, confirmedPnr: pnr }),

      // Called on booking cancellation or logout
      reset: () => set(initialState),
    }),
    {
      name: 'flight-store',
      storage: createJSONStorage(() => localStorage),

      // IMPORTANT: passport_no is excluded from persistence.
      // Everything else (search query, selected flight/seat, step)
      // is saved so the user can resume after closing the tab.
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        currentStep: state.currentStep,
        confirmedBookingId: state.confirmedBookingId,
        confirmedPnr: state.confirmedPnr,
        // passengerData is intentionally omitted — contains passport_no
      }),
    }
  )
)
