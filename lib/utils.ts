import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a Supabase timestamptz string for display
// e.g. "2026-05-22T06:00:00+00:00" → "22 May, 06:00"
// -----------------------------------------------------------
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// -----------------------------------------------------------
// Format date only
// e.g. "2026-05-22T06:00:00+00:00" → "22 May 2026"
// -----------------------------------------------------------
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// -----------------------------------------------------------
// Calculate flight duration as "Xh Ym"
// -----------------------------------------------------------
export function flightDuration(departsAt: string, arrivesAt: string): string {
  const diff = new Date(arrivesAt).getTime() - new Date(departsAt).getTime()
  const hours = Math.floor(diff / 3_600_000)
  const mins  = Math.floor((diff % 3_600_000) / 60_000)
  return `${hours}h ${mins}m`
}

// -----------------------------------------------------------
// Format currency in INR
// e.g. 4500 → "₹4,500"
// -----------------------------------------------------------
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// -----------------------------------------------------------
// Check if a flight departs within N hours from now
// Used to disable cancel/reschedule buttons in the UI
// -----------------------------------------------------------
export function departsWithinHours(departsAt: string, hours: number): boolean {
  const diff = new Date(departsAt).getTime() - Date.now()
  return diff < hours * 3_600_000
}

// -----------------------------------------------------------
// Parse seat number into row and column
// e.g. "10A" → { row: 10, col: "A" }
// -----------------------------------------------------------
export function parseSeatNumber(seatNumber: string): { row: number; col: string } {
  const match = seatNumber.match(/^(\d+)([A-F])$/)
  if (!match) return { row: 0, col: '' }
  return { row: parseInt(match[1]), col: match[2] }
}
