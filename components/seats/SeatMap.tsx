'use client'

import { useState } from 'react'
import { cn, formatPrice } from '@/lib/utils'
import type { Seat } from '@/types/database'

interface Props {
  seats: Seat[]
  selectedSeat: Seat | null
  onSelect: (seat: Seat) => void
  /** Optional: highlight seats that belong to the current user's booking */
  myBookedSeatId?: string
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F'] as const
const FIRST_ROWS    = [1, 2]
const BUSINESS_ROWS = [3, 4, 5, 6]

// Map seat to position in grid
function getSeatByNumber(seats: Seat[], seatNumber: string): Seat | undefined {
  return seats.find(s => s.seat_number === seatNumber)
}

export default function SeatMap({ seats, selectedSeat, onSelect, myBookedSeatId }: Props) {
  const [tooltip, setTooltip] = useState<{ seat: Seat; x: number; y: number } | null>(null)

  // Build set of all row numbers
  const rows = Array.from(
    new Set(seats.map(s => parseInt(s.seat_number)))
  ).sort((a, b) => a - b)

  function getSeatStyle(seat: Seat): string {
    if (!seat.is_available && seat.id === myBookedSeatId) {
      return 'bg-purple-500 border-purple-600 text-white cursor-default'
    }
    if (!seat.is_available) {
      return 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
    }
    if (selectedSeat?.id === seat.id) {
      return 'bg-blue-600 border-blue-700 text-white ring-2 ring-blue-300'
    }
    // Available — color by class
    switch (seat.class) {
      case 'first':    return 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 cursor-pointer'
      case 'business': return 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100 cursor-pointer'
      default:         return 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100 cursor-pointer'
    }
  }

  function handleSeatClick(seat: Seat) {
    if (!seat.is_available) return
    onSelect(seat)
  }

  function handleMouseEnter(e: React.MouseEvent, seat: Seat) {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setTooltip({ seat, x: rect.left, y: rect.top })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5 text-xs">
        {[
          { label: 'First class',   color: 'bg-amber-50 border-amber-300 text-amber-800' },
          { label: 'Business',      color: 'bg-blue-50 border-blue-300 text-blue-800' },
          { label: 'Economy',       color: 'bg-green-50 border-green-300 text-green-800' },
          { label: 'Selected',      color: 'bg-blue-600 border-blue-700 text-white' },
          { label: 'Occupied',      color: 'bg-slate-200 border-slate-300 text-slate-400' },
          ...(myBookedSeatId ? [{ label: 'Your seat', color: 'bg-purple-500 border-purple-600 text-white' }] : []),
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn('w-5 h-5 rounded border flex items-center justify-center text-[10px]', item.color)}>
              A
            </div>
            <span className="text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Seat grid — scrollable on mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[320px]">

          {/* Column headers */}
          <div className="flex items-center mb-2 pl-10">
            {COLS.map((col, i) => (
              <div key={col} className="flex items-center justify-center">
                <div className="w-9 h-6 flex items-center justify-center text-xs font-semibold text-slate-400">
                  {col}
                </div>
                {/* Aisle gap between C and D */}
                {i === 2 && <div className="w-6" />}
              </div>
            ))}
          </div>

          {rows.map(rowNum => {
            const isFirstClass    = FIRST_ROWS.includes(rowNum)
            const isBusinessClass = BUSINESS_ROWS.includes(rowNum)

            // Zone separator labels
            const showFirstLabel    = rowNum === 1
            const showBusinessLabel = rowNum === 3
            const showEconomyLabel  = rowNum === 7

            return (
              <div key={rowNum}>
                {/* Zone label */}
                {(showFirstLabel || showBusinessLabel || showEconomyLabel) && (
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide
                                  py-2 pt-4 pl-1">
                    {showFirstLabel && '✦ First class'}
                    {showBusinessLabel && '◆ Business'}
                    {showEconomyLabel && '● Economy'}
                  </div>
                )}

                <div className="flex items-center mb-1">
                  {/* Row number */}
                  <div className="w-9 text-xs text-slate-400 text-right pr-2 flex-shrink-0">
                    {rowNum}
                  </div>

                  {/* Seats */}
                  {COLS.map((col, i) => {
                    // First/business only have A B C cols
                    if ((isFirstClass && i > 1) || (isBusinessClass && i > 2)) {
                      return (
                        <div key={col} className="flex items-center">
                          <div className="w-9 h-8" />
                          {i === 2 && <div className="w-6" />}
                        </div>
                      )
                    }

                    const seatNumber = `${rowNum}${col}`
                    const seat = getSeatByNumber(seats, seatNumber)

                    if (!seat) return (
                      <div key={col} className="flex items-center">
                        <div className="w-9 h-8" />
                        {i === 2 && <div className="w-6" />}
                      </div>
                    )

                    return (
                      <div key={col} className="flex items-center">
                        <button
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={e => handleMouseEnter(e, seat)}
                          onMouseLeave={() => setTooltip(null)}
                          disabled={!seat.is_available}
                          aria-label={`Seat ${seatNumber} — ${seat.class}${!seat.is_available ? ', occupied' : ''}`}
                          className={cn(
                            'w-9 h-8 rounded-t-lg border text-[11px] font-medium transition',
                            getSeatStyle(seat)
                          )}
                        >
                          {seatNumber.slice(-1)}
                        </button>
                        {/* Aisle gap */}
                        {i === 2 && <div className="w-6" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed z-50 bg-slate-900 text-white text-xs rounded-lg px-3 py-2
                        pointer-events-none shadow-xl"
          style={{ left: tooltip.x, top: tooltip.y - 68 }}
        >
          <p className="font-semibold">Seat {tooltip.seat.seat_number}</p>
          <p className="capitalize text-slate-300">{tooltip.seat.class}</p>
          {tooltip.seat.extra_fee > 0 && (
            <p className="text-amber-300">+{formatPrice(tooltip.seat.extra_fee)} fee</p>
          )}
          {!tooltip.seat.is_available && (
            <p className="text-red-300">Occupied</p>
          )}
        </div>
      )}
    </div>
  )
}
