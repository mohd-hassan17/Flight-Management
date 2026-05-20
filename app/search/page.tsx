'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'
import { useUserStore } from '@/store/useUserStore'
import { createClient } from '@/lib/supabase/client'

const AIRPORTS = [
  { code: 'BOM', name: 'Mumbai' },
  { code: 'DEL', name: 'Delhi' },
  { code: 'BLR', name: 'Bangalore' },
  { code: 'MAA', name: 'Chennai' },
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'CCU', name: 'Kolkata' },
]

export default function SearchPage() {
  const router = useRouter()
  const supabase = createClient()
  const setSearchQuery = useFlightStore(s => s.setSearchQuery)
  const user = useUserStore(s => s.user)
  const resetUser = useUserStore(s => s.reset)
  const resetFlight = useFlightStore(s => s.reset)

  const [origin, setOrigin] = useState('BOM')
  const [destination, setDestination] = useState('DEL')
  const [date, setDate] = useState(() => {
    // Default to tomorrow
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [passengers, setPassengers] = useState(1)

  function handleSwap() {
    setOrigin(destination)
    setDestination(origin)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (origin === destination) return
    setSearchQuery({ origin, destination, date, passengers })
    router.push(`/flights?origin=${origin}&destination=${destination}&date=${date}&passengers=${passengers}`)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    resetUser()
    resetFlight()
    router.push('/login')
  }

  // Min date = today
  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">FlightApp</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={() => router.push('/my-bookings')}
              className="text-white/80 hover:text-white text-sm transition"
            >
              My Bookings
            </button>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white text-sm
                         px-4 py-2 rounded-xl transition"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-white text-blue-700 font-medium text-sm
                         px-4 py-2 rounded-xl hover:bg-blue-50 transition"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Where do you want to fly?
        </h1>
        <p className="text-blue-200 text-lg">
          Search flights, pick your seat, and take off.
        </p>
      </div>

      {/* Search Card */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          {/* Origin / Destination */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                From
              </label>
              <select
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                           font-medium focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent bg-slate-50 transition"
              >
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap button */}
            <button
              type="button"
              onClick={handleSwap}
              className="mt-6 w-10 h-10 flex items-center justify-center rounded-full
                         border border-slate-200 hover:bg-slate-100 transition flex-shrink-0"
              aria-label="Swap origin and destination"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                To
              </label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                           font-medium focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent bg-slate-50 transition"
              >
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Same airport warning */}
          {origin === destination && (
            <p className="text-red-500 text-sm mb-4">
              Origin and destination cannot be the same.
            </p>
          )}

          {/* Date + Passengers */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent bg-slate-50 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Passengers
              </label>
              <select
                value={passengers}
                onChange={e => setPassengers(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900
                           font-medium focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent bg-slate-50 transition"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={origin === destination}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300
                       text-white font-semibold py-3.5 rounded-xl text-lg transition"
          >
            Search Flights
          </button>
        </form>

        {/* Popular routes */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            { from: 'BOM', to: 'DEL' },
            { from: 'DEL', to: 'BOM' },
            { from: 'BOM', to: 'BLR' },
            { from: 'BLR', to: 'BOM' },
          ].map(route => (
            <button
              key={`${route.from}-${route.to}`}
              onClick={() => {
                setOrigin(route.from)
                setDestination(route.to)
              }}
              className="bg-white/10 hover:bg-white/20 text-white text-sm
                         px-4 py-2 rounded-full transition"
            >
              {route.from} → {route.to}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
