import Link from "next/link";
import { ArrowLeftIcon, CalendarDaysIcon, SearchXIcon, UsersIcon } from "lucide-react";

import FlightCard from "@/components/flights/FlightCard";
import { PageHeader } from "@/components/travel/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { getAirportLabel } from "@/lib/constants";
import { searchFlights } from "@/lib/flights";
import { formatDate } from "@/lib/utils";

interface Props {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    date?: string;
    passengers?: string;
  }>;
}

export default async function FlightsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { origin = "", destination = "", date = "", passengers = "1" } = params;
  const passengerCount = Math.max(1, Number(passengers) || 1);

  if (!origin || !destination || !date) {
    return (
      <main className="mx-auto flex min-h-[70dvh] w-full max-w-3xl items-center px-4 py-10">
        <Empty className="premium-card border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon className="size-4" />
            </EmptyMedia>
            <EmptyTitle>Search details are missing</EmptyTitle>
            <EmptyDescription>
              Start a fresh search so we can find matching flights and fares.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/search">Back to search</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </main>
    );
  }

  const flights = await searchFlights({
    origin,
    destination,
    date,
    passengers: passengerCount,
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Available flights"
        title={
          <>
            {origin} <span className="text-muted-foreground">to</span> {destination}
          </>
        }
        description={`${getAirportLabel(origin)} to ${getAirportLabel(destination)} on ${formatDate(`${date}T00:00:00`)}`}
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link href="/search">
              <ArrowLeftIcon className="size-4" />
              Modify search
            </Link>
          </Button>
        }
      />

      <Card className="premium-card mt-6">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Badge variant="secondary" className="gap-1">
            <CalendarDaysIcon className="size-3" />
            {formatDate(`${date}T00:00:00`)}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <UsersIcon className="size-3" />
            {passengerCount} passenger{passengerCount > 1 ? "s" : ""}
          </Badge>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <p className="text-sm text-muted-foreground">
            {flights.length} flight{flights.length === 1 ? "" : "s"} available
          </p>
        </CardContent>
      </Card>

      {flights.length === 0 ? (
        <Empty className="premium-card mt-6 border bg-card py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No flights found</EmptyTitle>
            <EmptyDescription>
              There are no flights on this route for the selected date. Try another travel day or route.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/search">Search another date</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-6 space-y-4">
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} passengers={passengerCount} />
          ))}
        </div>
      )}
    </main>
  );
}
