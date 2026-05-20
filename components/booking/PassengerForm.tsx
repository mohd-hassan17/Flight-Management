"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  Loader2Icon,
  LockKeyholeIcon,
  PlaneIcon,
  UserIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, formatPrice, toNumber } from "@/lib/utils";
import type { Flight, PassengerFormData, Seat } from "@/types/database";

interface Props {
  flight: Flight;
  seat: Seat | null;
  onBack: () => void;
  onSubmit: (data: PassengerFormData) => void | Promise<void>;
  submitting: boolean;
}

export default function PassengerForm({ flight, seat, onBack, onSubmit, submitting }: Props) {
  const [form, setForm] = useState<PassengerFormData>({
    full_name: "",
    passport_no: "",
    nationality: "",
    dob: "",
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(form);
  }

  const basePrice = toNumber(flight.base_price);
  const seatFee = toNumber(seat?.extra_fee);
  const totalPrice = basePrice + seatFee;

  if (!seat) {
    return (
      <Card className="premium-card">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTitle>No seat selected</AlertTitle>
            <AlertDescription>
              Choose a seat before entering passenger details.
            </AlertDescription>
          </Alert>
          <Button className="mt-5 gap-2" variant="outline" onClick={onBack}>
            <ArrowLeftIcon className="size-4" />
            Back to seat map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserIcon className="size-5 text-primary" />
            Passenger details
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter details exactly as they appear on the passenger passport.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel>Full name</FieldLabel>
                <Input
                  type="text"
                  name="full_name"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="As on passport"
                  className="h-11"
                  autoComplete="name"
                />
              </Field>

              <Field>
                <FieldLabel>Passport number</FieldLabel>
                <Input
                  type="text"
                  name="passport_no"
                  required
                  value={form.passport_no}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="A1234567"
                  className="h-11 font-mono uppercase"
                  autoComplete="off"
                />
                <FieldDescription className="flex items-center gap-1.5">
                  <LockKeyholeIcon className="size-3.5" />
                  Passport number is sent to Supabase and never persisted in local storage.
                </FieldDescription>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Nationality</FieldLabel>
                  <Input
                    type="text"
                    name="nationality"
                    required
                    value={form.nationality}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="Indian"
                    className="h-11"
                    autoComplete="country-name"
                  />
                </Field>

                <Field>
                  <FieldLabel>Date of birth</FieldLabel>
                  <Input
                    type="date"
                    name="dob"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    value={form.dob}
                    onChange={handleChange}
                    disabled={submitting}
                    className="h-11"
                  />
                </Field>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 gap-2"
                  onClick={onBack}
                  disabled={submitting}
                >
                  <ArrowLeftIcon className="size-4" />
                  Back
                </Button>
                <Button type="submit" className="h-11 flex-1 gap-2" disabled={submitting}>
                  {submitting ? <Loader2Icon className="size-4 animate-spin" /> : <BadgeCheckIcon className="size-4" />}
                  {submitting ? "Confirming" : "Confirm booking"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-base">Booking summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg bg-primary/6 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold">{flight.origin}</p>
                  <p className="text-xs text-muted-foreground">Depart</p>
                </div>
                <PlaneIcon className="size-5 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-semibold">{flight.destination}</p>
                  <p className="text-xs text-muted-foreground">Arrive</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {formatDateTime(flight.departs_at)}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Flight</span>
                <span className="font-medium">{flight.flight_no}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Aircraft</span>
                <span className="font-medium">{flight.aircraft_type}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Seat</span>
                <span className="font-medium">
                  {seat.seat_number}
                  <Badge variant="secondary" className="ml-2 capitalize">
                    {seat.class}
                  </Badge>
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base fare</span>
                <span>{formatPrice(basePrice)}</span>
              </div>
              {seatFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seat fee</span>
                  <span>{formatPrice(seatFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
