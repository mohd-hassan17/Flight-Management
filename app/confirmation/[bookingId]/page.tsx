import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeCheckIcon,
  CalendarDaysIcon,
  DownloadIcon,
  PlaneIcon,
  TicketCheckIcon,
  UserIcon,
} from "lucide-react";

import { RouteTimeline } from "@/components/travel/RouteTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getBookingById } from "@/lib/flights";
import { createClient } from "@/lib/supabase/server";
import { flightDuration, formatDate, formatDateTime, formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ bookingId: string }>;
}

export default async function ConfirmationPage({ params }: Props) {
  const { bookingId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const booking = await getBookingById(bookingId);
  if (!booking || booking.user_id !== user.id) redirect("/my-bookings");

  const passenger = booking.passengers?.[0];
  const duration = flightDuration(booking.flight.departs_at, booking.flight.arrives_at);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg">
          <BadgeCheckIcon className="size-7" />
        </div>
        <Badge variant="outline" className="mb-3 border-emerald-200 bg-emerald-50 text-emerald-700">
          Booking confirmed
        </Badge>
        <h1 className="text-3xl font-semibold sm:text-4xl">Your ticket is ready.</h1>
        <p className="mt-3 text-muted-foreground">
          Keep this booking reference handy for check-in and support.
        </p>
      </div>

      <Card className="premium-card mx-auto mt-8 max-w-3xl overflow-hidden">
        <div className="bg-[linear-gradient(135deg,var(--primary),var(--accent))] p-6 text-primary-foreground">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm opacity-85">Booking reference</p>
              <p className="mt-1 text-4xl font-black tracking-widest">{booking.pnr_code}</p>
            </div>
            <Badge className="w-fit bg-white/15 text-primary-foreground hover:bg-white/20">
              <TicketCheckIcon className="size-3" />
              Confirmed
            </Badge>
          </div>
        </div>

        <CardContent className="space-y-6 p-6">
          <RouteTimeline
            origin={booking.flight.origin}
            destination={booking.flight.destination}
            departsAt={booking.flight.departs_at}
            arrivesAt={booking.flight.arrives_at}
            duration={duration}
          />

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Flight", value: booking.flight.flight_no, icon: PlaneIcon },
              { label: "Aircraft", value: booking.flight.aircraft_type, icon: PlaneIcon },
              { label: "Departure", value: formatDateTime(booking.flight.departs_at), icon: CalendarDaysIcon },
              { label: "Seat", value: `${booking.seat.seat_number} - ${booking.seat.class}`, icon: TicketCheckIcon },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border bg-muted/35 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Icon className="size-3.5" />
                    {item.label}
                  </div>
                  <p className="mt-2 font-medium capitalize">{item.value}</p>
                </div>
              );
            })}
          </div>

          {passenger && (
            <>
              <Separator />
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <UserIcon className="size-4 text-primary" />
                  <h2 className="font-semibold">Passenger</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="mt-1 font-medium">{passenger.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nationality</p>
                    <p className="mt-1 font-medium">{passenger.nationality}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date of birth</p>
                    <p className="mt-1 font-medium">{formatDate(passenger.dob)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total paid</p>
              <p className="text-3xl font-semibold text-primary">{formatPrice(booking.total_price)}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/search">Book another</Link>
              </Button>
              <Button asChild>
                <Link href="/my-bookings">
                  <DownloadIcon className="size-4" />
                  My bookings
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
