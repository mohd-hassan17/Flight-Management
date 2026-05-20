import { ArrowRightIcon, PlaneTakeoffIcon } from "lucide-react";

import { cn, formatShortDate, formatTime } from "@/lib/utils";

export function RouteTimeline({
  origin,
  destination,
  departsAt,
  arrivesAt,
  duration,
  className,
}: {
  origin: string;
  destination: string;
  departsAt: string;
  arrivesAt: string;
  duration: string;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3", className)}>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
          {formatTime(departsAt)}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">{origin}</p>
        <p className="text-xs text-muted-foreground">{formatShortDate(departsAt)}</p>
      </div>

      <div className="flex min-w-24 flex-col items-center gap-1 text-muted-foreground sm:min-w-36">
        <span className="text-xs font-medium">{duration}</span>
        <div className="flex w-full items-center gap-1">
          <span className="size-2 rounded-full border-2 border-primary/55" />
          <span className="h-px flex-1 bg-border" />
          <PlaneTakeoffIcon className="size-4 text-primary" />
          <span className="h-px flex-1 bg-border" />
          <ArrowRightIcon className="size-3 text-muted-foreground" />
        </div>
        <span className="text-xs">Direct</span>
      </div>

      <div className="min-w-0 text-right">
        <p className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
          {formatTime(arrivesAt)}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">{destination}</p>
        <p className="text-xs text-muted-foreground">{formatShortDate(arrivesAt)}</p>
      </div>
    </div>
  );
}
