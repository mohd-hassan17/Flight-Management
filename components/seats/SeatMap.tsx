"use client";

import { ArmchairIcon, CircleIcon, PlaneIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { cn, formatPrice, toNumber } from "@/lib/utils";
import type { Seat } from "@/types/database";

interface Props {
  seats: Seat[];
  selectedSeat: Seat | null;
  onSelect: (seat: Seat | null) => void;
  myBookedSeatId?: string;
}

const COLS = ["A", "B", "C", "D", "E", "F"] as const;
const FIRST_ROWS = [1, 2];
const BUSINESS_ROWS = [3, 4, 5, 6];

function getSeatByNumber(seats: Seat[], seatNumber: string): Seat | undefined {
  return seats.find((seat) => seat.seat_number === seatNumber);
}

function getSeatTone(seat: Seat, selectedSeat: Seat | null, myBookedSeatId?: string) {
  if (!seat.is_available && seat.id === myBookedSeatId) {
    return "border-violet-500 bg-violet-500 text-white shadow-sm";
  }
  if (!seat.is_available) {
    return "border-slate-200 bg-slate-100 text-slate-400";
  }
  if (selectedSeat?.id === seat.id) {
    return "border-primary bg-primary text-primary-foreground shadow-md ring-4 ring-primary/15";
  }

  switch (seat.class) {
    case "first":
      return "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100";
    case "business":
      return "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100";
    default:
      return "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100";
  }
}

function ZoneLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 pt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function SeatMap({ seats, selectedSeat, onSelect, myBookedSeatId }: Props) {
  const rows = Array.from(new Set(seats.map((seat) => parseInt(seat.seat_number, 10)))).sort(
    (a, b) => a - b
  );

  return (
    <Card className="premium-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PlaneIcon className="size-5 text-primary" />
              Choose your seat
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Premium seats include extra fees. Occupied seats update live.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit gap-1">
            <ArmchairIcon className="size-3" />
            {seats.filter((seat) => seat.is_available).length} available
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { label: "First", className: "border-amber-300 bg-amber-50 text-amber-800" },
            { label: "Business", className: "border-sky-300 bg-sky-50 text-sky-800" },
            { label: "Economy", className: "border-emerald-300 bg-emerald-50 text-emerald-800" },
            { label: "Selected", className: "border-primary bg-primary text-primary-foreground" },
            { label: "Occupied", className: "border-slate-200 bg-slate-100 text-slate-400" },
          ].map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-1">
              <span className={cn("size-3 rounded border", item.className)} />
              {item.label}
            </span>
          ))}
          {myBookedSeatId && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-1">
              <span className="size-3 rounded border border-violet-500 bg-violet-500" />
              Your seat
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border bg-muted/35 p-4">
          <div className="mx-auto mb-5 flex max-w-sm items-center justify-center gap-2 rounded-b-[2rem] border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <PlaneIcon className="size-3.5 text-primary" />
            Front cabin
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="mx-auto min-w-[380px] max-w-xl">
              <div className="mb-2 grid grid-cols-[38px_repeat(3,38px)_28px_repeat(3,38px)] items-center gap-1">
                <span />
                {COLS.map((col, index) => (
                  <span
                    key={col}
                    className={cn(
                      "flex h-7 items-center justify-center text-xs font-semibold text-muted-foreground",
                      index === 3 && "col-start-6"
                    )}
                  >
                    {col}
                  </span>
                ))}
              </div>

              {rows.map((rowNum) => {
                const isFirstClass = FIRST_ROWS.includes(rowNum);
                const isBusinessClass = BUSINESS_ROWS.includes(rowNum);

                return (
                  <div key={rowNum}>
                    {rowNum === 1 && <ZoneLabel label="First class" />}
                    {rowNum === 3 && <ZoneLabel label="Business" />}
                    {rowNum === 7 && <ZoneLabel label="Economy" />}

                    <div className="mb-1 grid grid-cols-[38px_repeat(3,38px)_28px_repeat(3,38px)] items-center gap-1">
                      <span className="pr-2 text-right text-xs font-medium text-muted-foreground">
                        {rowNum}
                      </span>

                      {COLS.map((col, index) => {
                        const hiddenForCabin =
                          (isFirstClass && index > 1) || (isBusinessClass && index > 2);
                        const seatNumber = `${rowNum}${col}`;
                        const seat = hiddenForCabin ? undefined : getSeatByNumber(seats, seatNumber);
                        const columnClass = index === 3 ? "col-start-6" : undefined;

                        if (!seat) {
                          return <span key={col} className={cn("size-9", columnClass)} />;
                        }

                        const available = seat.is_available;
                        const selected = selectedSeat?.id === seat.id;

                        return (
                          <HoverCard key={col} openDelay={120} closeDelay={80}>
                            <HoverCardTrigger asChild>
                              <button
                                type="button"
                                aria-label={`Seat ${seat.seat_number}, ${seat.class}${available ? "" : ", occupied"}`}
                                aria-pressed={selected}
                                aria-disabled={!available}
                                tabIndex={available ? 0 : -1}
                                onClick={() => {
                                  if (available) onSelect(selected ? null : seat);
                                }}
                                className={cn(
                                  "flex size-9 items-center justify-center rounded-t-lg border text-[11px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                                  available ? "cursor-pointer hover:-translate-y-0.5" : "cursor-not-allowed",
                                  getSeatTone(seat, selectedSeat, myBookedSeatId),
                                  columnClass
                                )}
                              >
                                {seat.seat_number.replace(/\d+/g, "")}
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-56">
                              <div className="space-y-3 text-sm">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold">Seat {seat.seat_number}</p>
                                    <p className="capitalize text-muted-foreground">{seat.class}</p>
                                  </div>
                                  <CircleIcon
                                    className={cn(
                                      "mt-1 size-3 fill-current",
                                      available ? "text-emerald-500" : "text-slate-300"
                                    )}
                                  />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Availability</span>
                                  <span>{available ? "Available" : "Occupied"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Seat fee</span>
                                  <span>{toNumber(seat.extra_fee) > 0 ? formatPrice(seat.extra_fee) : "Included"}</span>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
