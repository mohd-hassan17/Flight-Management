// ============================================================
// types/database.ts
// Single source of truth for all DB types.
// ============================================================

export type FlightStatus =
  | 'scheduled'
  | 'boarding'
  | 'departed'
  | 'arrived'
  | 'cancelled'
  | 'delayed'
  | 'completed'
export type SeatClass = 'economy' | 'business' | 'first'
export type BookingStatus = 'confirmed' | 'rescheduled' | 'cancelled'

// -----------------------------------------------------------
// flights
// -----------------------------------------------------------
export interface Flight {
  id: string
  flight_no: string
  origin: string
  destination: string
  departs_at: string        // ISO timestamptz string from Supabase
  arrives_at: string
  aircraft_type: string
  status: FlightStatus
  base_price: number
  created_at: string
}

// -----------------------------------------------------------
// seats
// -----------------------------------------------------------
export interface Seat {
  id: string
  flight_id: string
  seat_number: string
  class: SeatClass
  is_available: boolean
  extra_fee: number
  created_at: string
}

// -----------------------------------------------------------
// bookings
// -----------------------------------------------------------
export interface Booking {
  id: string
  user_id: string
  flight_id: string
  seat_id: string
  status: BookingStatus
  booked_at: string
  total_price: number
  pnr_code: string
  created_at: string
}

// -----------------------------------------------------------
// passengers
// -----------------------------------------------------------
export interface Passenger {
  id: string
  booking_id: string
  full_name: string
  passport_no: string
  nationality: string
  dob: string               // ISO date string  e.g. "1990-05-15"
  created_at: string
}

// -----------------------------------------------------------
// reschedules
// -----------------------------------------------------------
export interface Reschedule {
  id: string
  booking_id: string
  old_flight_id: string
  new_flight_id: string
  requested_at: string
  fee_charged: number
}

// -----------------------------------------------------------
// Joined / enriched types used in UI
// -----------------------------------------------------------

/** Booking with its flight and seat details joined */
export interface BookingWithDetails extends Booking {
  flight: Flight
  seat: Seat
  passengers: Passenger[]
}

export interface RescheduleFlightOption {
  flight: Flight
  seats: Seat[]
}

export type RescheduleOptionsByBooking = Record<string, RescheduleFlightOption[]>

/** Flight search params used on the search page */
export interface FlightSearchParams {
  origin: string
  destination: string
  date: string              // "YYYY-MM-DD"
  passengers: number
}

/** Passenger form data collected during booking */
export interface PassengerFormData {
  full_name: string
  passport_no: string       // excluded from localStorage via partialize
  nationality: string
  dob: string
}

/** RPC reserve_seat response shape */
export interface ReserveSeatResult {
  id: string
  flight_id: string
  seat_number: string
  class: SeatClass
  is_available: boolean
  extra_fee: number
}

