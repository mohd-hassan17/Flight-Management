"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarClockIcon,
  CircleDollarSignIcon,
  PlaneIcon,
  RotateCwIcon,
  TicketCheckIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cancelBookingAction, rescheduleBookingAction } from "@/app/my-bookings/actions";
import SeatMap from "@/components/seats/SeatMap";
import { FlightStatusBadge } from "@/components/travel/FlightStatusBadge";
import { PageHeader } from "@/components/travel/PageHeader";
import { RouteTimeline } from "@/components/travel/RouteTimeline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  departsWithinHours,
  flightDuration,
  formatDateTime,
  formatPrice,
  isPastDate,
  toNumber,
} from "@/lib/utils";
import type {
  BookingWithDetails,
  RescheduleFlightOption,
  RescheduleOptionsByBooking,
  Seat,
} from "@/types/database";

interface Props {
  initialBookings: BookingWithDetails[];
  rescheduleOptions: RescheduleOptionsByBooking;
  userEmail: string;
}

function bookingStatusClass(status: string) {
  if (status === "cancelled") return "border-red-200 bg-red-50 text-red-700";
  if (status === "rescheduled") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function canManageBooking(booking: BookingWithDetails) {
  return booking.status !== "cancelled" && !departsWithinHours(booking.flight.departs_at, 2);
}

function BookingActions({
  booking,
  hasRescheduleOptions,
  pending,
  onCancel,
  onReschedule,
}: {
  booking: BookingWithDetails;
  hasRescheduleOptions: boolean;
  pending: boolean;
  onCancel: () => void;
  onReschedule: () => void;
}) {
  const manageable = canManageBooking(booking);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={!manageable || !hasRescheduleOptions || pending}
        onClick={onReschedule}
      >
        <RotateCwIcon className="size-3.5" />
        Reschedule
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="gap-1.5"
        disabled={!manageable || pending}
        onClick={onCancel}
      >
        <XCircleIcon className="size-3.5" />
        Cancel
      </Button>
    </div>
  );
}

function BookingMobileCard({
  booking,
  pending,
  options,
  onCancel,
  onReschedule,
}: {
  booking: BookingWithDetails;
  pending: boolean;
  options: RescheduleFlightOption[];
  onCancel: () => void;
  onReschedule: () => void;
}) {
  return (
    <Card className="premium-card">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{booking.flight.flight_no}</p>
            <p className="text-sm text-muted-foreground">{booking.pnr_code}</p>
          </div>
          <Badge variant="outline" className={bookingStatusClass(booking.status)}>
            {booking.status}
          </Badge>
        </div>

        <RouteTimeline
          origin={booking.flight.origin}
          destination={booking.flight.destination}
          departsAt={booking.flight.departs_at}
          arrivesAt={booking.flight.arrives_at}
          duration={flightDuration(booking.flight.departs_at, booking.flight.arrives_at)}
        />

        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/35 p-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Seat</p>
            <p className="font-medium capitalize">{booking.seat.seat_number} - {booking.seat.class}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="font-medium">{formatPrice(booking.total_price)}</p>
          </div>
        </div>

        <BookingActions
          booking={booking}
          pending={pending}
          hasRescheduleOptions={options.length > 0}
          onCancel={onCancel}
          onReschedule={onReschedule}
        />
      </CardContent>
    </Card>
  );
}

function BookingsTable({
  bookings,
  pendingId,
  optionsByBooking,
  onCancel,
  onReschedule,
}: {
  bookings: BookingWithDetails[];
  pendingId: string | null;
  optionsByBooking: RescheduleOptionsByBooking;
  onCancel: (booking: BookingWithDetails) => void;
  onReschedule: (booking: BookingWithDetails) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Flight</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Departure</TableHead>
          <TableHead>Seat</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>
              <div className="font-medium">{booking.flight.flight_no}</div>
              <div className="text-xs text-muted-foreground">{booking.pnr_code}</div>
            </TableCell>
            <TableCell>
              <span className="font-medium">{booking.flight.origin}</span>
              <ArrowRightIcon className="mx-2 inline size-3 text-muted-foreground" />
              <span className="font-medium">{booking.flight.destination}</span>
            </TableCell>
            <TableCell>{formatDateTime(booking.flight.departs_at)}</TableCell>
            <TableCell className="capitalize">
              {booking.seat.seat_number} - {booking.seat.class}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={bookingStatusClass(booking.status)}>
                {booking.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">{formatPrice(booking.total_price)}</TableCell>
            <TableCell>
              <div className="flex justify-end">
                <BookingActions
                  booking={booking}
                  pending={pendingId === booking.id}
                  hasRescheduleOptions={(optionsByBooking[booking.id] ?? []).length > 0}
                  onCancel={() => onCancel(booking)}
                  onReschedule={() => onReschedule(booking)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyBookings({ title, description }: { title: string; description: string }) {
  return (
    <Empty className="border bg-card py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TicketCheckIcon className="size-4" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/search">Search flights</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export default function MyBookingsClient({ initialBookings, rescheduleOptions, userEmail }: Props) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingWithDetails | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<BookingWithDetails | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status !== "cancelled" && !isPastDate(booking.flight.departs_at)
      ),
    [bookings]
  );
  const historyBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => booking.status !== "cancelled" && isPastDate(booking.flight.departs_at)
      ),
    [bookings]
  );
  const cancelledBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "cancelled"),
    [bookings]
  );
  const totalSpend = bookings
    .filter((booking) => booking.status !== "cancelled")
    .reduce((total, booking) => total + toNumber(booking.total_price), 0);

  const targetOptions = rescheduleTarget ? rescheduleOptions[rescheduleTarget.id] ?? [] : [];
  const selectedFlightOption =
    targetOptions.find((option) => option.flight.id === selectedFlightId) ?? targetOptions[0];

  function openReschedule(booking: BookingWithDetails) {
    const options = rescheduleOptions[booking.id] ?? [];
    setRescheduleTarget(booking);
    setSelectedFlightId(options[0]?.flight.id ?? "");
    setSelectedSeat(null);
  }

  async function handleCancel() {
    if (!cancelTarget) return;

    const previousBookings = bookings;
    setPendingId(cancelTarget.id);
    setBookings((current) =>
      current.map((booking) =>
        booking.id === cancelTarget.id ? { ...booking, status: "cancelled" } : booking
      )
    );

    const result = await cancelBookingAction(cancelTarget.id);
    setPendingId(null);
    setCancelTarget(null);

    if (!result.ok) {
      setBookings(previousBookings);
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  async function handleReschedule() {
    if (!rescheduleTarget || !selectedFlightOption || !selectedSeat) {
      toast.error("Choose a flight and available seat.");
      return;
    }

    const previousBookings = bookings;
    const optimisticTotal =
      toNumber(selectedFlightOption.flight.base_price) + toNumber(selectedSeat.extra_fee);

    setPendingId(rescheduleTarget.id);
    setBookings((current) =>
      current.map((booking) =>
        booking.id === rescheduleTarget.id
          ? {
              ...booking,
              flight_id: selectedFlightOption.flight.id,
              flight: selectedFlightOption.flight,
              seat_id: selectedSeat.id,
              seat: selectedSeat,
              status: "rescheduled",
              total_price: optimisticTotal,
            }
          : booking
      )
    );

    const result = await rescheduleBookingAction(
      rescheduleTarget.id,
      selectedFlightOption.flight.id,
      selectedSeat.id
    );

    setPendingId(null);

    if (!result.ok) {
      setBookings(previousBookings);
      toast.error(result.message);
      return;
    }

    setBookings((current) =>
      current.map((booking) =>
        booking.id === rescheduleTarget.id
          ? { ...booking, total_price: result.newTotal ?? optimisticTotal }
          : booking
      )
    );
    setRescheduleTarget(null);
    setSelectedSeat(null);
    toast.success(result.feeCharged ? `Rescheduled. Fee charged: ${formatPrice(result.feeCharged)}` : result.message);
    router.refresh();
  }

  const metricCards = [
    { label: "Upcoming", value: activeBookings.length, icon: CalendarClockIcon },
    { label: "All bookings", value: bookings.length, icon: TicketCheckIcon },
    { label: "Cancelled", value: cancelledBookings.length, icon: XCircleIcon },
    { label: "Total paid", value: formatPrice(totalSpend), icon: CircleDollarSignIcon },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Travel dashboard"
        title="My bookings"
        description={`Manage flights, seats, and itinerary changes for ${userEmail}.`}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="premium-card">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{metric.value}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="premium-card mt-6">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Trips</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Cancellations are locked within 2 hours of departure.
              </p>
            </div>
            <FlightStatusBadge status="scheduled" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="mb-5 grid h-auto w-full grid-cols-3 sm:w-fit">
              <TabsTrigger value="active" className="h-9">
                Active
              </TabsTrigger>
              <TabsTrigger value="history" className="h-9">
                History
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="h-9">
                Cancelled
              </TabsTrigger>
            </TabsList>

            {[
              {
                value: "active",
                data: activeBookings,
                title: "No active bookings",
                description: "Your upcoming trips will appear here after checkout.",
              },
              {
                value: "history",
                data: historyBookings,
                title: "No completed trips",
                description: "Past flights will collect here over time.",
              },
              {
                value: "cancelled",
                data: cancelledBookings,
                title: "No cancelled bookings",
                description: "Cancelled trips will appear here for reference.",
              },
            ].map((section) => (
              <TabsContent key={section.value} value={section.value}>
                {section.data.length === 0 ? (
                  <EmptyBookings title={section.title} description={section.description} />
                ) : (
                  <>
                    <div className="hidden md:block">
                      <BookingsTable
                        bookings={section.data}
                        pendingId={pendingId}
                        optionsByBooking={rescheduleOptions}
                        onCancel={setCancelTarget}
                        onReschedule={openReschedule}
                      />
                    </div>
                    <div className="space-y-4 md:hidden">
                      {section.data.map((booking) => (
                        <BookingMobileCard
                          key={booking.id}
                          booking={booking}
                          pending={pendingId === booking.id}
                          options={rescheduleOptions[booking.id] ?? []}
                          onCancel={() => setCancelTarget(booking)}
                          onReschedule={() => openReschedule(booking)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="size-5 text-destructive" />
              Cancel this booking?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel booking {cancelTarget?.pnr_code} and release seat {cancelTarget?.seat.seat_number}.
              This action cannot be undone from the app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!pendingId}>Keep booking</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={!!pendingId} onClick={handleCancel}>
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet
        open={!!rescheduleTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRescheduleTarget(null);
            setSelectedSeat(null);
          }
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Reschedule booking</SheetTitle>
            <SheetDescription>
              Choose another flight on the same route and select an available seat.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4 pb-4">
            {targetOptions.length === 0 ? (
              <Empty className="border bg-card py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <RotateCwIcon className="size-4" />
                  </EmptyMedia>
                  <EmptyTitle>No alternate flights</EmptyTitle>
                  <EmptyDescription>
                    This route has no future alternatives available right now.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium">Alternate flight</p>
                  <Select
                    value={selectedFlightOption?.flight.id ?? ""}
                    onValueChange={(value) => {
                      setSelectedFlightId(value);
                      setSelectedSeat(null);
                    }}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {targetOptions.map((option) => (
                        <SelectItem key={option.flight.id} value={option.flight.id}>
                          {option.flight.flight_no} - {formatDateTime(option.flight.departs_at)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedFlightOption && (
                  <Card className="premium-card">
                    <CardContent className="p-4">
                      <RouteTimeline
                        origin={selectedFlightOption.flight.origin}
                        destination={selectedFlightOption.flight.destination}
                        departsAt={selectedFlightOption.flight.departs_at}
                        arrivesAt={selectedFlightOption.flight.arrives_at}
                        duration={flightDuration(
                          selectedFlightOption.flight.departs_at,
                          selectedFlightOption.flight.arrives_at
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {selectedFlightOption && (
                  <SeatMap
                    seats={selectedFlightOption.seats}
                    selectedSeat={selectedSeat}
                    onSelect={setSelectedSeat}
                  />
                )}
              </>
            )}
          </div>

          <SheetFooter>
            <div className="flex flex-col gap-2">
              {selectedSeat && selectedFlightOption && (
                <div className="rounded-lg border bg-muted/35 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New total</span>
                    <span className="font-semibold text-primary">
                      {formatPrice(
                        toNumber(selectedFlightOption.flight.base_price) + toNumber(selectedSeat.extra_fee)
                      )}
                    </span>
                  </div>
                </div>
              )}
              <Button
                className="h-11 gap-2"
                disabled={!selectedSeat || !selectedFlightOption || pendingId === rescheduleTarget?.id}
                onClick={handleReschedule}
              >
                <PlaneIcon className="size-4" />
                Confirm reschedule
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
}
