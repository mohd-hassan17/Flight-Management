-- ============================================================
-- Migration 001: Create all tables
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: flights
-- ============================================================
CREATE TABLE flights (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_no     TEXT NOT NULL UNIQUE,                        -- e.g. "AI-202"
  origin        TEXT NOT NULL,                               -- IATA code e.g. "BOM"
  destination   TEXT NOT NULL,                               -- IATA code e.g. "DEL"
  departs_at    TIMESTAMPTZ NOT NULL,
  arrives_at    TIMESTAMPTZ NOT NULL,
  aircraft_type TEXT NOT NULL DEFAULT 'Boeing 737',
  status        TEXT NOT NULL DEFAULT 'scheduled'
                CHECK (status IN ('scheduled', 'delayed', 'cancelled', 'completed')),
  base_price    NUMERIC(10, 2) NOT NULL CHECK (base_price > 0),

  CONSTRAINT departs_before_arrives CHECK (departs_at < arrives_at)
);

-- ============================================================
-- TABLE: seats
-- ============================================================
CREATE TABLE seats (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id     UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_number   TEXT NOT NULL,                               
  class         TEXT NOT NULL
                CHECK (class IN ('economy', 'business', 'first')),
  is_available  BOOLEAN NOT NULL DEFAULT true,
  extra_fee     NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (extra_fee >= 0),

  UNIQUE (flight_id, seat_number)                            -- no duplicate seats on same flight
);

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id     UUID NOT NULL REFERENCES flights(id),
  seat_id       UUID NOT NULL REFERENCES seats(id),
  status        TEXT NOT NULL DEFAULT 'confirmed'
                CHECK (status IN ('confirmed', 'rescheduled', 'cancelled')),
  booked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_price   NUMERIC(10, 2) NOT NULL CHECK (total_price > 0),
  pnr_code      TEXT NOT NULL UNIQUE                         -- e.g. "PNR-A1B2C3"
);

-- ============================================================
-- TABLE: passengers
-- ============================================================
CREATE TABLE passengers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  passport_no   TEXT NOT NULL,
  nationality   TEXT NOT NULL,
  dob           DATE NOT NULL
);

-- ============================================================
-- TABLE: reschedules
-- ============================================================
CREATE TABLE reschedules (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id     UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_flight_id  UUID NOT NULL REFERENCES flights(id),
  new_flight_id  UUID NOT NULL REFERENCES flights(id),
  requested_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fee_charged    NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (fee_charged >= 0),

  CONSTRAINT different_flights CHECK (old_flight_id <> new_flight_id)
);

-- ============================================================
-- INDEXES for query performance
-- ============================================================
CREATE INDEX idx_flights_origin_dest_departs ON flights(origin, destination, departs_at);
CREATE INDEX idx_seats_flight_id             ON seats(flight_id);
CREATE INDEX idx_seats_flight_available      ON seats(flight_id, is_available);
CREATE INDEX idx_bookings_user_id            ON bookings(user_id);
CREATE INDEX idx_bookings_flight_id          ON bookings(flight_id);
CREATE INDEX idx_passengers_booking_id       ON passengers(booking_id);
CREATE INDEX idx_reschedules_booking_id      ON reschedules(booking_id);
