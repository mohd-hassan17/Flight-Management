"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArmchairIcon,
  CheckCircle2Icon,
  PlaneIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

import PassengerForm from "@/components/booking/PassengerForm";
import SeatMap from "@/components/seats/SeatMap";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/travel/PageHeader";
import { RouteTimeline } from "@/components/travel/RouteTimeline";
import { createClient } from "@/lib/supabase/client";
import { flightDuration, formatPrice, toNumber } from "@/lib/utils";
import { useFlightStore } from "@/store/useFlightStore";
import type { Flight, PassengerFormData, Seat } from "@/types/database";

interface Props {
  flight: Flight;
  initialSeats: Seat[];
  userId: string;
}

type Step = "seats" | "passengers";

type ReserveSeatRpcResult = {
  booking_id: string;
  pnr_code: string;
};

export default function BookingClient({ flight, initialSeats, userId }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<Step>("seats");
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = useFlightStore((state) => state.searchQuery);
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const setSelectedSeat = useFlightStore((state) => state.setSelectedSeat);
  const setConfirmedBooking = useFlightStore((state) => state.setConfirmedBooking);

  const activeSelectedSeat = selectedSeat?.flight_id === flight.id ? selectedSeat : null;
  const duration = flightDuration(flight.departs_at, flight.arrives_at);
  const resultsHref = searchQuery
    ? `/flights?${new URLSearchParams({
        origin: searchQuery.origin,
        destination: searchQuery.destination,
        date: searchQuery.date,
        passengers: String(searchQuery.passengers),
      }).toString()}`
    : "/search";

  useEffect(() => {
    const channel = supabase
      .channel(`seats:${flight.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "seats",
          filter: `flight_id=eq.${flight.id}`,
        },
        (payload) => {
          const updated = payload.new as Seat;
          setSeats((previous) =>
            previous.map((seat) => (seat.id === updated.id ? updated : seat))
          );

          if (activeSelectedSeat?.id === updated.id && !updated.is_available) {
            setSelectedSeat(null);
            setError("That seat was just taken by another passenger. Please select another.");
            toast.warning("Seat no longer available");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSelectedSeat?.id, flight.id, setSelectedSeat, supabase]);

  async function handleConfirmBooking(passengerData: PassengerFormData) {
    console.log('1. Starting booking...')
  console.log('Selected seat:', selectedSeat)
    if (!activeSelectedSeat) {
      setStep("seats");
      setError("Please choose a seat before confirming your booking.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const totalPrice = toNumber(flight.base_price) + toNumber(activeSelectedSeat.extra_fee);

      const { data, error: rpcError } = await supabase.rpc("reserve_seat", {
        p_flight_id: flight.id,
        p_seat_id: activeSelectedSeat.id,
        p_user_id: userId,
        p_total_price: totalPrice,
      });
          console.log('RPC result:', { data, rpcError })

      if (rpcError) {
        setSelectedSeat(null);
        throw new Error(rpcError.message);
      }

      const reserveData = data as ReserveSeatRpcResult[] | ReserveSeatRpcResult | null;
      const booking = Array.isArray(reserveData) ? reserveData[0] : reserveData;

      if (!booking?.booking_id || !booking.pnr_code) {
        throw new Error("Seat was reserved, but booking details were not returned.");
      }

      const { error: passengerError } = await supabase.from("passengers").insert({
        booking_id: booking.booking_id,
        full_name: passengerData.full_name.trim(),
        passport_no: passengerData.passport_no.trim().toUpperCase(),
        nationality: passengerData.nationality.trim(),
        dob: passengerData.dob,
      });

      if (passengerError) throw new Error(passengerError.message);

      setConfirmedBooking(booking.booking_id, booking.pnr_code);
      toast.success("Booking confirmed");
      router.push(`/confirmation/${booking.booking_id}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Booking failed. Please try again.";
      setError(message);
      toast.error(message);
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Secure checkout"
        title={
          <>
            {flight.origin} <span className="text-muted-foreground">to</span> {flight.destination}
          </>
        }
        description={`${flight.flight_no} - ${flight.aircraft_type} - ${duration}`}
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link href={resultsHref}>
              <ArrowLeftIcon className="size-4" />
              Back to results
            </Link>
          </Button>
        }
      />

      <Card className="premium-card mt-6">
        <CardContent className="p-5">
          <RouteTimeline
            origin={flight.origin}
            destination={flight.destination}
            departsAt={flight.departs_at}
            arrivesAt={flight.arrives_at}
            duration={duration}
          />
        </CardContent>
      </Card>

      <Tabs
        value={step}
        onValueChange={(value) => {
          if (value === "seats" || activeSelectedSeat) setStep(value as Step);
        }}
        className="mt-6"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 p-1 sm:w-fit">
          <TabsTrigger value="seats" className="h-10 gap-2">
            {step === "passengers" ? <CheckCircle2Icon className="size-4" /> : <ArmchairIcon className="size-4" />}
            Choose seat
          </TabsTrigger>
          <TabsTrigger value="passengers" disabled={!activeSelectedSeat} className="h-10 gap-2">
            <PlaneIcon className="size-4" />
            Passenger details
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <Alert variant="destructive" className="mt-5">
          <ShieldAlertIcon className="size-4" />
          <AlertTitle>Booking issue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-6">
        {step === "seats" ? (
          <div className="space-y-5">
            <SeatMap
              seats={seats}
              selectedSeat={activeSelectedSeat}
              onSelect={(seat) => {
                setSelectedSeat(seat);
                setError(null);
              }}
            />

            {activeSelectedSeat && (
              <Card className="premium-card">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">
                      Seat {activeSelectedSeat.seat_number}
                      <Badge variant="secondary" className="ml-2 capitalize">
                        {activeSelectedSeat.class}
                      </Badge>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(toNumber(flight.base_price) + toNumber(activeSelectedSeat.extra_fee))} total
                      {toNumber(activeSelectedSeat.extra_fee) > 0
                        ? `, including ${formatPrice(activeSelectedSeat.extra_fee)} seat fee`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Separator orientation="vertical" className="hidden h-10 sm:block" />
                    <Button className="h-11 w-full sm:w-auto" onClick={() => setStep("passengers")}>
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <PassengerForm
            flight={flight}
            seat={activeSelectedSeat}
            onBack={() => setStep("seats")}
            onSubmit={handleConfirmBooking}
            submitting={submitting}
          />
        )}
      </div>
    </main>
  );
}
