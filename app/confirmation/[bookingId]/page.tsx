import { getBookingById } from '@/lib/flights'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateTime, formatDate, formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  params: Promise<{ bookingId: string }>
}

export default async function ConfirmationPage({ params }: Props) {
  const { bookingId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const booking = await getBookingById(bookingId)
  if (!booking || booking.user_id !== user.id) redirect('/my-bookings')

  const passenger = booking.passengers?.[0]

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Success badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Booking confirmed!</h1>
          <p className="text-slate-500 mt-1">Your ticket is ready. Have a great flight!</p>
        </div>

        {/* Ticket card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

          {/* PNR header */}
          <div className="bg-blue-600 px-6 py-5 text-white">
            <p className="text-blue-200 text-sm font-medium mb-1">Booking reference</p>
            <p className="text-4xl font-black tracking-widest">{booking.pnr_code}</p>
          </div>

          {/* Flight details */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{booking.flight.origin}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {formatDateTime(booking.flight.departs_at)}
                </p>
              </div>

              <div className="flex flex-col items-center px-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-xs text-slate-400 mt-1">Direct</span>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">{booking.flight.destination}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {formatDateTime(booking.flight.arrives_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm border-b border-slate-100">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Flight</p>
              <p className="font-semibold text-slate-900">{booking.flight.flight_no}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Aircraft</p>
              <p className="font-semibold text-slate-900">{booking.flight.aircraft_type}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Seat</p>
              <p className="font-semibold text-slate-900">
                {booking.seat.seat_number}
                <span className="ml-1.5 text-xs bg-blue-50 text-blue-700
                                 px-1.5 py-0.5 rounded capitalize">
                  {booking.seat.class}
                </span>
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total paid</p>
              <p className="font-semibold text-blue-600">{formatPrice(booking.total_price)}</p>
            </div>
          </div>

          {/* Passenger */}
          {passenger && (
            <div className="px-6 py-5 border-b border-slate-100">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-3">Passenger</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Name</p>
                  <p className="font-medium text-slate-900">{passenger.full_name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Nationality</p>
                  <p className="font-medium text-slate-900">{passenger.nationality}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Date of birth</p>
                  <p className="font-medium text-slate-900">{formatDate(passenger.dob)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-5 flex gap-3">
            <Link
              href="/my-bookings"
              className="flex-1 text-center bg-blue-600 hover:bg-blue-700
                         text-white font-semibold py-2.5 rounded-xl transition"
            >
              My bookings
            </Link>
            <Link
              href="/search"
              className="flex-1 text-center border border-slate-200 text-slate-700
                         font-medium py-2.5 rounded-xl hover:bg-slate-50 transition"
            >
              Book another
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
