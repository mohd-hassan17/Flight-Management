-- ============================================================
-- Migration 002: Row Level Security (RLS)
-- ============================================================

-- ============================================================
-- FLIGHTS — public read, no write from client
-- ============================================================
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read flights to search/browse
CREATE POLICY "flights_public_read"
  ON flights FOR SELECT
  USING (true);

-- Only service_role can insert/update/delete (done server-side or via seed)
-- No client-facing write policy needed


-- ============================================================
-- SEATS — public read, no direct client write
-- (writes happen only through the reserve_seat RPC)
-- ============================================================
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seats_public_read"
  ON seats FOR SELECT
  USING (true);

-- No direct insert/update from client — all seat changes go through RPCs


-- ============================================================
-- BOOKINGS — users can only see and manage their own
-- ============================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_own"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "bookings_insert_own"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No delete policy — we soft-delete via status='cancelled'


-- ============================================================
-- PASSENGERS — accessible only through own bookings
-- ============================================================
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "passengers_select_own"
  ON passengers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
        AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "passengers_insert_own"
  ON passengers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
        AND bookings.user_id = auth.uid()
    )
  );

-- No update/delete from client — passenger details are immutable after booking


-- ============================================================
-- RESCHEDULES — users can only see their own reschedule history
-- ============================================================
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reschedules_select_own"
  ON reschedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reschedules.booking_id
        AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "reschedules_insert_own"
  ON reschedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reschedules.booking_id
        AND bookings.user_id = auth.uid()
    )
  );
