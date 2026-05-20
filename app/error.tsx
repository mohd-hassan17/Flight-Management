"use client";

import { RouteError } from "@/components/travel/RouteError";

export default function Error({ unstable_retry }: { unstable_retry: () => void }) {
  return <RouteError unstable_retry={unstable_retry} />;
}
