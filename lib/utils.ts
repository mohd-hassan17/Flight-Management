import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toValidDate(iso: string | Date | null | undefined): Date | null {
  if (!iso) return null;
  const date = iso instanceof Date ? iso : new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(iso: string | null | undefined): string {
  const date = toValidDate(iso);
  if (!date) return "TBD";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate(iso: string | null | undefined): string {
  const date = toValidDate(iso);
  if (!date) return "TBD";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(iso: string | null | undefined): string {
  const date = toValidDate(iso);
  if (!date) return "TBD";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export function formatTime(iso: string | null | undefined): string {
  const date = toValidDate(iso);
  if (!date) return "--:--";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function flightDuration(
  departsAt: string | null | undefined,
  arrivesAt: string | null | undefined
): string {
  const depart = toValidDate(departsAt);
  const arrive = toValidDate(arrivesAt);
  if (!depart || !arrive) return "TBD";

  const diff = arrive.getTime() - depart.getTime();
  if (diff <= 0) return "TBD";

  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  return `${hours}h ${mins}m`;
}

export function formatPrice(amount: number | string | null | undefined): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toNumber(amount));
}

export function departsWithinHours(
  departsAt: string | null | undefined,
  hours: number
): boolean {
  const depart = toValidDate(departsAt);
  if (!depart) return true;

  const diff = depart.getTime() - Date.now();
  return diff < hours * 3_600_000;
}

export function isPastDate(iso: string | null | undefined): boolean {
  const date = toValidDate(iso);
  if (!date) return false;

  return date.getTime() < Date.now();
}

export function parseSeatNumber(seatNumber: string): { row: number; col: string } {
  const match = seatNumber.match(/^(\d+)([A-F])$/);
  if (!match) return { row: 0, col: "" };

  return { row: parseInt(match[1], 10), col: match[2] };
}
