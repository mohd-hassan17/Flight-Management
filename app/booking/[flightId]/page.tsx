import { getFlightById, getSeatsForFlight } from '@/lib/flights'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingClient from '@/components/booking/BookingClient'

interface Props {
  params: Promise<{ flightId: string }>
}

export default async function BookingPage({ params }: Props) {
  const { flightId } = await params

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch flight + seats server-side
  const [flight, seats] = await Promise.all([
    getFlightById(flightId),
    getSeatsForFlight(flightId),
  ])

  if (!flight) redirect('/search')

  return (
    <BookingClient
      flight={flight}
      initialSeats={seats}
      userId={user.id}
    />
  )
}
