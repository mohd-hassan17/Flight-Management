"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult = {
  ok: boolean;
  message: string;
  newTotal?: number;
  feeCharged?: number;
};

export async function cancelBookingAction(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Please sign in again to manage this booking." };
  }

  const { error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
    p_user_id: user.id,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/my-bookings");
  return { ok: true, message: "Booking cancelled." };
}

export async function rescheduleBookingAction(
  bookingId: string,
  newFlightId: string,
  newSeatId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Please sign in again to manage this booking." };
  }

  const { data, error } = await supabase.rpc("reschedule_booking", {
    p_booking_id: bookingId,
    p_user_id: user.id,
    p_new_flight_id: newFlightId,
    p_new_seat_id: newSeatId,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  const result = (Array.isArray(data) ? data[0] : data) as
    | { new_total_price?: number | string; fee_charged?: number | string }
    | undefined;

  revalidatePath("/my-bookings");
  return {
    ok: true,
    message: "Booking rescheduled.",
    newTotal: Number(result?.new_total_price ?? 0),
    feeCharged: Number(result?.fee_charged ?? 0),
  };
}
