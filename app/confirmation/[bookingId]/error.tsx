"use client";

import { RouteError } from "@/components/travel/RouteError";

export default function Error({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <RouteError
      title="Confirmation could not load"
      description="We could not retrieve this ticket. Try again or open My bookings."
      unstable_retry={unstable_retry}
    />
  );
}
