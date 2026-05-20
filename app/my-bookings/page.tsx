import { redirect } from "next/navigation";

import MyBookingsClient from "@/components/bookings/MyBookingsClient";
import { getAlternateFlights, getSeatsForFlight, getUserBookings } from "@/lib/flights";
import { createClient } from "@/lib/supabase/server";
import { departsWithinHours } from "@/lib/utils";
import type { RescheduleOptionsByBooking } from "@/types/database";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/my-bookings");

  const bookings = await getUserBookings();
  const manageableBookings = bookings.filter(
    (booking) => booking.status !== "cancelled" && !departsWithinHours(booking.flight.departs_at, 2)
  );

  const optionEntries = await Promise.all(
    manageableBookings.map(async (booking) => {
      const alternateFlights = await getAlternateFlights(
        booking.flight.origin,
        booking.flight.destination,
        booking.flight.id
      );

      const options = await Promise.all(
        alternateFlights.map(async (flight) => ({
          flight,
          seats: (await getSeatsForFlight(flight.id)).filter((seat) => seat.is_available),
        }))
      );

      return [booking.id, options] as const;
    })
  );

  const rescheduleOptions: RescheduleOptionsByBooking = Object.fromEntries(optionEntries);

  return (
    <MyBookingsClient
      initialBookings={bookings}
      rescheduleOptions={rescheduleOptions}
      userEmail={user.email ?? "Traveller"}
    />
  );
}
