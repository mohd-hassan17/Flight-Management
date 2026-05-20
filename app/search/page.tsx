"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRightIcon,
  CalendarIcon,
  PlaneIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";

import { AIRPORTS, POPULAR_ROUTES, getAirportLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useFlightStore } from "@/store/useFlightStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export default function SearchPage() {
  const router = useRouter();
  const setSearchQuery = useFlightStore((state) => state.setSearchQuery);

  const [origin, setOrigin] = useState("BOM");
  const [destination, setDestination] = useState("DEL");
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toDateInputValue(tomorrow);
  });
  const [passengers, setPassengers] = useState("1");

  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);
  const selectedDate = parseInputDate(date);
  const sameAirport = origin === destination;

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (sameAirport) return;

    const passengerCount = Number(passengers);
    setSearchQuery({ origin, destination, date, passengers: passengerCount });

    const params = new URLSearchParams({
      origin,
      destination,
      date,
      passengers,
    });
    router.push(`/flights?${params.toString()}`);
  }

  return (
    <main className="relative overflow-hidden">
      <section className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)] lg:px-8">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-5 border-primary/20 bg-primary/5 text-primary">
            <SparklesIcon className="size-3" />
            Startup-grade flight booking
          </Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
            Plan the next takeoff with less friction.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Search routes, compare premium fares, reserve seats live, and keep every booking organized from one polished dashboard.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Live seats", value: "Realtime", icon: ShieldCheckIcon },
              { label: "Routes", value: "6 cities", icon: PlaneIcon },
              { label: "Booking flow", value: "2 steps", icon: UsersIcon },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="premium-card">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="glass-panel">
          <CardContent className="p-5 sm:p-6 lg:p-7">
            <div className="mb-6">
              <p className="text-sm font-semibold text-primary">Flight search</p>
              <h2 className="mt-1 text-2xl font-semibold">Where are you flying?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a route and travel date to see available flights.
              </p>
            </div>

            <form onSubmit={handleSearch}>
              <FieldGroup>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                  <Field>
                    <FieldLabel>From</FieldLabel>
                    <Select value={origin} onValueChange={setOrigin}>
                      <SelectTrigger className="h-12 w-full bg-background/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AIRPORTS.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            <span className="font-medium">{airport.code}</span>
                            <span className="text-muted-foreground">{airport.city}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>{getAirportLabel(origin)}</FieldDescription>
                  </Field>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    className="mb-6 justify-self-start rounded-full bg-background/85 sm:justify-self-center"
                    onClick={handleSwap}
                    aria-label="Swap origin and destination"
                  >
                    <ArrowLeftRightIcon className="size-4" />
                  </Button>

                  <Field>
                    <FieldLabel>To</FieldLabel>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger className="h-12 w-full bg-background/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AIRPORTS.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            <span className="font-medium">{airport.code}</span>
                            <span className="text-muted-foreground">{airport.city}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>{getAirportLabel(destination)}</FieldDescription>
                  </Field>
                </div>

                {sameAirport && (
                  <Alert variant="destructive">
                    <AlertTitle>Choose a different destination</AlertTitle>
                    <AlertDescription>
                      Origin and destination cannot be the same airport.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Departure date</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn("h-12 justify-start gap-2 bg-background/80 font-normal")}
                        >
                          <CalendarIcon className="size-4 text-muted-foreground" />
                          {selectedDate.toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(value) => {
                            if (value) setDate(toDateInputValue(value));
                          }}
                          disabled={{ before: today }}
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>

                  <Field>
                    <FieldLabel>Passengers</FieldLabel>
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger className="h-12 w-full bg-background/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((count) => (
                          <SelectItem key={count} value={String(count)}>
                            {count} passenger{count > 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Button type="submit" size="lg" className="h-12 w-full gap-2" disabled={sameAirport}>
                  <SearchIcon className="size-4" />
                  Search flights
                </Button>
              </FieldGroup>
            </form>

            <Separator className="my-6" />

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Popular routes
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_ROUTES.map((route) => (
                  <Button
                    key={`${route.from}-${route.to}`}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setOrigin(route.from);
                      setDestination(route.to);
                    }}
                  >
                    {route.from} to {route.to}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
