"use client";

import { RouteError } from "@/components/travel/RouteError";

export default function Error({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <RouteError
      title="Booking flow could not load"
      description="We could not load seats for this flight. Try again in a moment."
      unstable_retry={unstable_retry}
    />
  );
}
