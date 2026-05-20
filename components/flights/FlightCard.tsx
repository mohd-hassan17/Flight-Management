'use client'

import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'
import { useUserStore } from '@/store/useUserStore'
import { formatDateTime, flightDuration, formatPrice } from '@/lib/utils'
import type { Flight } from '@/types/database'

interface Props {
  flight: Flight
  passengers: number
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-green-50 text-green-700',
  boarding:  'bg-amber-50 text-amber-700',
  departed:  'bg-slate-100 text-slate-500',
  arrived:   'bg-slate-100 text-slate-500',
  cancelled: 'bg-red-50 text-red-600',
}

export default function FlightCard({ flight, passengers }: Props) {
  const router = useRouter()
  const setSelectedFlight = useFlightStore(s => s.setSelectedFlight)
  const user = useUserStore(s => s.user)

  function handleSelect() {
    if (!user) {
      router.push('/login')
      return
    }
    setSelectedFlight(flight)
    router.push(`/booking/${flight.id}`)
  }

  const duration = flightDuration(flight.departs_at, flight.arrives_at)
  const totalPrice = flight.base_price * passengers

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">

        {/* Left: route + times */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-slate-400 bg-slate-100
                             px-2 py-0.5 rounded-full">
              {flight.flight_no}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize
                             ${STATUS_STYLES[flight.status]}`}>
              {flight.status}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Depart */}
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {new Date(flight.departs_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit', hour12: false
                })}
              </p>
              <p className="text-sm font-semibold text-slate-700">{flight.origin}</p>
              <p className="text-xs text-slate-400">
                {new Date(flight.departs_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short'
                })}
              </p>
            </div>

            {/* Duration */}
            <div className="flex-1 flex flex-col items-center">
              <p className="text-xs text-slate-400 mb-1">{duration}</p>
              <div className="w-full flex items-center gap-1">
                <div className="w-2 h-2 rounded-full border-2 border-blue-400" />
                <div className="flex-1 h-px bg-slate-200" />
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <p className="text-xs text-slate-400 mt-1">Direct</p>
            </div>

            {/* Arrive */}
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">
                {new Date(flight.arrives_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit', hour12: false
                })}
              </p>
              <p className="text-sm font-semibold text-slate-700">{flight.destination}</p>
              <p className="text-xs text-slate-400">
                {new Date(flight.arrives_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short'
                })}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3">{flight.aircraft_type}</p>
        </div>

        {/* Right: price + CTA */}
        <div className="flex flex-col items-end justify-between gap-4 min-w-[120px]">
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {formatPrice(flight.base_price)}
            </p>
            <p className="text-xs text-slate-400">per person</p>
            {passengers > 1 && (
              <p className="text-sm text-slate-500 font-medium">
                {formatPrice(totalPrice)} total
              </p>
            )}
          </div>

          <button
            onClick={handleSelect}
            disabled={flight.status === 'cancelled' || flight.status === 'departed'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed
                       text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition whitespace-nowrap"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  )
}
