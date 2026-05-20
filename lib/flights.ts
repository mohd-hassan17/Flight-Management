// ============================================================
// lib/flights.ts
// Server-side helpers for fetching flight and booking data.
// All functions use the server Supabase client — safe to call
// from Server Components and Route Handlers.
// ============================================================
import { createClient } from '@/lib/supabase/server'
import type {
  Flight,
  Seat,
  BookingWithDetails,
  FlightSearchParams,
} from '@/types/database'

// -----------------------------------------------------------
// Search flights by route and date
// -----------------------------------------------------------
export async function searchFlights(
  params: FlightSearchParams
): Promise<Flight[]> {
  const supabase = await createClient()

  // Build date range: entire day of the requested date
  const dateStart = `${params.date}T00:00:00`
  const dateEnd   = `${params.date}T23:59:59`

  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('origin', params.origin.toUpperCase())
    .eq('destination', params.destination.toUpperCase())
    .gte('departs_at', dateStart)
    .lte('departs_at', dateEnd)
    .neq('status', 'cancelled')
    .order('departs_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

// -----------------------------------------------------------
// Get a single flight by id
// -----------------------------------------------------------
export async function getFlightById(id: string): Promise<Flight | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

// -----------------------------------------------------------
// Get all seats for a flight
// -----------------------------------------------------------
export async function getSeatsForFlight(flightId: string): Promise<Seat[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('seats')
    .select('*')
    .eq('flight_id', flightId)
    .order('seat_number', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

// -----------------------------------------------------------
// Get all bookings for the logged-in user (with details)
// -----------------------------------------------------------
export async function getUserBookings(): Promise<BookingWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flight:flights(*),
      seat:seats(*),
      passengers(*)
    `)
    .order('booked_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as BookingWithDetails[]) ?? []
}

// -----------------------------------------------------------
// Get a single booking by id (with details)
// -----------------------------------------------------------
export async function getBookingById(
  bookingId: string
): Promise<BookingWithDetails | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flight:flights(*),
      seat:seats(*),
      passengers(*)
    `)
    .eq('id', bookingId)
    .single()

  if (error) return null
  return data as BookingWithDetails
}

// -----------------------------------------------------------
// Get alternate flights on the same route (for reschedule)
// -----------------------------------------------------------
export async function getAlternateFlights(
  origin: string,
  destination: string,
  excludeFlightId: string
): Promise<Flight[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .neq('id', excludeFlightId)
    .neq('status', 'cancelled')
    .gt('departs_at', new Date().toISOString())  // only future flights
    .order('departs_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}
