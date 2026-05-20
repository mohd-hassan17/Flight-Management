"use client";

import { useRouter } from "next/navigation";
import { ArmchairIcon, InfoIcon, PlaneIcon } from "lucide-react";

import { FlightStatusBadge } from "@/components/travel/FlightStatusBadge";
import { RouteTimeline } from "@/components/travel/RouteTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { flightDuration, formatPrice, toNumber } from "@/lib/utils";
import { useFlightStore } from "@/store/useFlightStore";
import { useUserStore } from "@/store/useUserStore";
import type { Flight } from "@/types/database";

interface Props {
  flight: Flight;
  passengers: number;
}

function isBookable(status: string) {
  return !["cancelled", "departed", "arrived", "completed"].includes(status);
}

export default function FlightCard({ flight, passengers }: Props) {
  const router = useRouter();
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);
  const user = useUserStore((state) => state.user);

  const duration = flightDuration(flight.departs_at, flight.arrives_at);
  const basePrice = toNumber(flight.base_price);
  const totalPrice = basePrice * passengers;
  const canBook = isBookable(flight.status);

  function handleSelect() {
    if (!canBook) return;

    if (!user) {
      router.push(`/login?redirectTo=/booking/${flight.id}`);
      return;
    }

    setSelectedFlight(flight);
    router.push(`/booking/${flight.id}`);
  }

  return (
    <Card className="premium-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl">
      <CardContent className="p-0">
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <PlaneIcon className="size-3" />
                {flight.flight_no}
              </Badge>
              <FlightStatusBadge status={flight.status} />
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-muted-foreground">
                    <InfoIcon className="size-3.5" />
                    Details
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium">{flight.aircraft_type}</p>
                      <p className="text-muted-foreground">Direct service with live seat selection.</p>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fare class</span>
                      <span>Standard economy from</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Seats</span>
                      <span>Choose after booking starts</span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>

            <RouteTimeline
              origin={flight.origin}
              destination={flight.destination}
              departsAt={flight.departs_at}
              arrivesAt={flight.arrives_at}
              duration={duration}
            />

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ArmchairIcon className="size-4" />
                Seat selection included
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/35 sm:block" />
              <span>{flight.aircraft_type}</span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-lg border bg-muted/35 p-4 lg:items-end">
            <div className="lg:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                From
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {formatPrice(basePrice)}
              </p>
              <p className="text-xs text-muted-foreground">per traveller</p>
              {passengers > 1 && (
                <p className="mt-2 text-sm font-medium text-foreground">
                  {formatPrice(totalPrice)} total
                </p>
              )}
            </div>

            <Button
              onClick={handleSelect}
              disabled={!canBook}
              className="h-10 w-full lg:w-auto"
            >
              {canBook ? "Select flight" : "Unavailable"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
