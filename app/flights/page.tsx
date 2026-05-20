import { searchFlights } from '@/lib/flights'
import FlightCard from '@/components/flights/FlightCard'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Props {
  searchParams: Promise<{
    origin?: string
    destination?: string
    date?: string
    passengers?: string
  }>
}

export default async function FlightsPage({ searchParams }: Props) {
  const params = await searchParams
  const { origin = '', destination = '', date = '', passengers = '1' } = params

  if (!origin || !destination || !date) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Missing search parameters.</p>
          <Link href="/search" className="text-blue-600 hover:underline">Back to search</Link>
        </div>
      </main>
    )
  }

  const flights = await searchFlights({
    origin,
    destination,
    date,
    passengers: Number(passengers),
  })

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <Link href="/search" className="text-blue-200 hover:text-white text-sm mb-3 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Modify search
          </Link>
          <h1 className="text-2xl font-bold">
            {origin} → {destination}
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            {formatDate(date + 'T00:00:00')} · {passengers} passenger{Number(passengers) > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        {flights.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✈️</div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No flights found</h2>
            <p className="text-slate-500 mb-6">
              No flights from {origin} to {destination} on {formatDate(date + 'T00:00:00')}.
            </p>
            <Link
              href="/search"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition"
            >
              Try another date
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              {flights.length} flight{flights.length > 1 ? 's' : ''} available
            </p>
            {flights.map(flight => (
              <FlightCard
                key={flight.id}
                flight={flight}
                passengers={Number(passengers)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
