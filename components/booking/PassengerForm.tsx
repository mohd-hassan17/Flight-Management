'use client'

import { useState } from 'react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import type { Flight, Seat, PassengerFormData } from '@/types/database'

interface Props {
  flight: Flight
  seat: Seat | null
  onBack: () => void
  onSubmit: (data: PassengerFormData) => void
  submitting: boolean
}

export default function PassengerForm({ flight, seat, onBack, onSubmit, submitting }: Props) {
  const [form, setForm] = useState<PassengerFormData>({
    full_name: '',
    passport_no: '',
    nationality: '',
    dob: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  const totalPrice = flight.base_price + (seat?.extra_fee || 0)

  return (
    <div className="grid md:grid-cols-3 gap-6">

      {/* Form */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Passenger details</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={form.full_name}
                onChange={handleChange}
                placeholder="As on passport"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent text-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Passport number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="passport_no"
                required
                value={form.passport_no}
                onChange={handleChange}
                placeholder="e.g. A1234567"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent text-slate-900 transition font-mono"
              />
              <p className="text-xs text-slate-400 mt-1">
                Stored securely — never saved to your browser.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nationality"
                  required
                  value={form.nationality}
                  onChange={handleChange}
                  placeholder="e.g. Indian"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent text-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Date of birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={form.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent text-slate-900 transition"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 border border-slate-200 text-slate-700 font-medium
                           py-2.5 rounded-xl hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                           text-white font-semibold py-2.5 rounded-xl transition"
              >
                {submitting ? 'Confirming…' : 'Confirm booking'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Summary sidebar */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Booking summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Flight</span>
              <span className="font-medium text-slate-900">{flight.flight_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Route</span>
              <span className="font-medium text-slate-900">
                {flight.origin} → {flight.destination}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Departure</span>
              <span className="font-medium text-slate-900">
                {formatDateTime(flight.departs_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Seat</span>
              <span className="font-medium text-slate-900">
                {seat?.seat_number}
                <span className="ml-1.5 text-xs bg-slate-100 text-slate-600
                                 px-1.5 py-0.5 rounded capitalize">
                  {seat?.class}
                </span>
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-4 pt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Base fare</span>
              <span>{formatPrice(flight.base_price)}</span>
            </div>
            {(seat?.extra_fee || 0) > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Seat fee</span>
                <span>{formatPrice(seat?.extra_fee || 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base mt-2 pt-2
                            border-t border-slate-100">
              <span>Total</span>
              <span className="text-blue-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
