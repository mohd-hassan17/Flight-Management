"use client";

import { RouteError } from "@/components/travel/RouteError";

export default function Error({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <RouteError
      title="Flight results could not load"
      description="The search request did not complete. Try refreshing the results."
      unstable_retry={unstable_retry}
    />
  );
}
