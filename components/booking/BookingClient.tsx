'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/store/useFlightStore'
import SeatMap from '@/components/seats/SeatMap'
import PassengerForm from '@/components/booking/PassengerForm'
import { formatDateTime, flightDuration, formatPrice } from '@/lib/utils'
import type { Flight, Seat, PassengerFormData } from '@/types/database'
import Link from 'next/link'

interface Props {
  flight: Flight
  initialSeats: Seat[]
  userId: string
}

type Step = 'seats' | 'passengers'

export default function BookingClient({ flight, initialSeats, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('seats')
  const [seats, setSeats] = useState<Seat[]>(initialSeats)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedSeat = useFlightStore(s => s.selectedSeat)
  const setSelectedSeat = useFlightStore(s => s.setSelectedSeat)
  const setConfirmedBooking = useFlightStore(s => s.setConfirmedBooking)

  // ── Supabase Realtime subscription ─────────────────────────
  // Seats booked by other users update live without page refresh
  useEffect(() => {
    const channel = supabase
      .channel(`seats:${flight.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flight.id}`,
        },
        (payload) => {
          const updated = payload.new as Seat
          setSeats(prev =>
            prev.map(s => s.id === updated.id ? updated : s)
          )
          // If the seat this user optimistically selected just got taken
          // by someone else, deselect it
          if (selectedSeat?.id === updated.id && !updated.is_available) {
            setSelectedSeat(null)
            setError('That seat was just taken by another passenger. Please select another.')
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [flight.id, selectedSeat?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleConfirmBooking(passengerData: PassengerFormData) {
    if (!selectedSeat) return
    setSubmitting(true)
    setError(null)

    try {
      // 1. Reserve the seat atomically via RPC
      const { error: rpcError } = await supabase.rpc('reserve_seat', {
        p_seat_id: selectedSeat.id,
        p_flight_id: flight.id,
      })

      if (rpcError) {
        setSelectedSeat(null) // rollback optimistic selection
        throw new Error(rpcError.message)
      }

      // 2. Insert the booking
      const totalPrice = flight.base_price + selectedSeat.extra_fee
      const pnrCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          flight_id: flight.id,
          seat_id: selectedSeat.id,
          total_price: totalPrice,
          pnr_code: pnrCode,
        })
        .select()
        .single()

      if (bookingError) throw new Error(bookingError.message)

      // 3. Insert passenger details
      const { error: passengerError } = await supabase
        .from('passengers')
        .insert({
          booking_id: booking.id,
          full_name: passengerData.full_name,
          passport_no: passengerData.passport_no,
          nationality: passengerData.nationality,
          dob: passengerData.dob,
        })

      if (passengerError) throw new Error(passengerError.message)

      // 4. Navigate to confirmation
      setConfirmedBooking(booking.id, booking.pnr_code)
      router.push(`/confirmation/${booking.id}`)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.')
      setSubmitting(false)
    }
  }

  const duration = flightDuration(flight.departs_at, flight.arrives_at)

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <Link href="/flights" className="text-blue-200 hover:text-white text-sm mb-3 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to results
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <h1 className="text-xl font-bold">
              {flight.origin} → {flight.destination}
            </h1>
            <span className="text-blue-200 text-sm">{flight.flight_no}</span>
            <span className="text-blue-200 text-sm">
              {formatDateTime(flight.departs_at)} · {duration}
            </span>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-3 flex gap-6">
          {(['seats', 'passengers'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${step === s ? 'bg-blue-600 text-white' :
                  (step === 'passengers' && s === 'seats') ? 'bg-green-500 text-white' :
                  'bg-slate-200 text-slate-400'}`}>
                {step === 'passengers' && s === 'seats' ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium capitalize
                ${step === s ? 'text-slate-900' : 'text-slate-400'}`}>
                {s === 'seats' ? 'Choose seat' : 'Passenger details'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                          rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {step === 'seats' && (
          <div>
            <SeatMap
              seats={seats}
              selectedSeat={selectedSeat}
              onSelect={(seat: Seat | null) => {
                setSelectedSeat(seat)
                setError(null)
              }}
            />
            {selectedSeat && (
              <div className="mt-6 flex items-center justify-between bg-white
                              rounded-2xl border border-slate-200 p-5">
                <div>
                  <p className="font-semibold text-slate-900">
                    Seat {selectedSeat.seat_number}
                    <span className="ml-2 text-xs font-normal bg-blue-100 text-blue-700
                                     px-2 py-0.5 rounded-full capitalize">
                      {selectedSeat.class}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {formatPrice(flight.base_price + selectedSeat.extra_fee)} total
                    {selectedSeat.extra_fee > 0 &&
                      ` (includes ${formatPrice(selectedSeat.extra_fee)} seat fee)`}
                  </p>
                </div>
                <button
                  onClick={() => setStep('passengers')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold
                             px-6 py-2.5 rounded-xl transition"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'passengers' && (
          <PassengerForm
            flight={flight}
            seat={selectedSeat!}
            onBack={() => setStep('seats')}
            onSubmit={handleConfirmBooking}
            submitting={submitting}
          />
        )}
      </div>
    </main>
  )
}
