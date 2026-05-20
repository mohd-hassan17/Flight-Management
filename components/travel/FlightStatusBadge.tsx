import { AlertTriangleIcon, CheckCircle2Icon, ClockIcon, PlaneIcon, XCircleIcon } from "lucide-react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FlightStatus } from "@/types/database";

const statusConfig: Record<string, { label: string; className: string; icon: ComponentType<{ className?: string }> }> = {
  scheduled: {
    label: "Scheduled",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2Icon,
  },
  boarding: {
    label: "Boarding",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: PlaneIcon,
  },
  delayed: {
    label: "Delayed",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: ClockIcon,
  },
  departed: {
    label: "Departed",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: PlaneIcon,
  },
  completed: {
    label: "Completed",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: CheckCircle2Icon,
  },
  arrived: {
    label: "Arrived",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: CheckCircle2Icon,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: XCircleIcon,
  },
};

export function FlightStatusBadge({
  status,
  className,
}: {
  status: FlightStatus | string;
  className?: string;
}) {
  const config = statusConfig[status] ?? {
    label: status ? status.replaceAll("_", " ") : "Unknown",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: AlertTriangleIcon,
  };
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("capitalize", config.className, className)}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
