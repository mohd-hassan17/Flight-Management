-- ============================================================
-- Migration 003: RPC Functions
-- ============================================================


-- ============================================================
-- RPC: reserve_seat
-- Atomically locks a seat and creates a booking.
-- Uses SELECT FOR UPDATE to prevent double-booking race conditions.
-- Returns the new booking id and generated PNR on success.
-- Raises an exception if the seat is already taken.
-- ============================================================
CREATE OR REPLACE FUNCTION reserve_seat(
  p_flight_id   UUID,
  p_seat_id     UUID,
  p_user_id     UUID,
  p_total_price NUMERIC
)
RETURNS TABLE (booking_id UUID, pnr_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER  -- runs as DB owner, bypasses RLS for the lock step
AS $$
DECLARE
  v_booking_id  UUID;
  v_pnr         TEXT;
  v_seat_locked BOOLEAN;
BEGIN
  -- Step 1: Lock the seat row exclusively to prevent concurrent reservations.
  -- FOR UPDATE NOWAIT will raise an error immediately if another transaction
  -- already holds the lock (another user is booking the same seat right now).
  SELECT is_available INTO v_seat_locked
  FROM seats
  WHERE id = p_seat_id
    AND flight_id = p_flight_id
  FOR UPDATE NOWAIT;

  -- Step 2: Check the seat actually exists and belongs to this flight
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seat not found for this flight'
      USING ERRCODE = 'P0001';
  END IF;

  -- Step 3: Check it's still available
  IF NOT v_seat_locked THEN
    RAISE EXCEPTION 'Seat is already booked'
      USING ERRCODE = 'P0002';
  END IF;

  -- Step 4: Generate PNR — 6 character alphanumeric, prefixed with "PNR-"
  v_pnr := 'PNR-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

  -- Step 5: Mark seat as unavailable
  UPDATE seats
  SET is_available = false
  WHERE id = p_seat_id;

  -- Step 6: Insert the booking
  INSERT INTO bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  VALUES (p_user_id, p_flight_id, p_seat_id, p_total_price, v_pnr)
  RETURNING id INTO v_booking_id;

  -- Step 7: Return the result
  RETURN QUERY SELECT v_booking_id, v_pnr;
END;
$$;


-- ============================================================
-- RPC: cancel_booking
-- Atomically cancels a booking and frees the seat.
-- Enforces the 2-hour rule (also enforced by trigger, belt-and-suspenders).
-- Only the booking owner can call this (user_id check inside).
-- ============================================================
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID,
  p_user_id    UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seat_id     UUID;
  v_flight_id   UUID;
  v_departs_at  TIMESTAMPTZ;
  v_status      TEXT;
BEGIN
  -- Step 1: Fetch booking + flight info, lock the booking row
  SELECT b.seat_id, b.flight_id, b.status, f.departs_at
  INTO v_seat_id, v_flight_id, v_status, v_departs_at
  FROM bookings b
  JOIN flights f ON f.id = b.flight_id
  WHERE b.id = p_booking_id
    AND b.user_id = p_user_id   -- ownership check
  FOR UPDATE NOWAIT;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or access denied'
      USING ERRCODE = 'P0003';
  END IF;

  -- Step 2: Check not already cancelled
  IF v_status = 'cancelled' THEN
    RAISE EXCEPTION 'Booking is already cancelled'
      USING ERRCODE = 'P0004';
  END IF;

  -- Step 3: Enforce 2-hour cancellation rule
  IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
    RAISE EXCEPTION 'Cancellations are not allowed within 2 hours of departure'
      USING ERRCODE = 'P0005';
  END IF;

  -- Step 4: Update booking status
  UPDATE bookings
  SET status = 'cancelled'
  WHERE id = p_booking_id;

  -- Step 5: Free the seat
  UPDATE seats
  SET is_available = true
  WHERE id = v_seat_id;
END;
$$;


-- ============================================================
-- RPC: reschedule_booking
-- Moves a booking to a new flight on the same route.
-- Frees old seat, reserves new seat, charges fee if applicable.
-- ============================================================
CREATE OR REPLACE FUNCTION reschedule_booking(
  p_booking_id     UUID,
  p_user_id        UUID,
  p_new_flight_id  UUID,
  p_new_seat_id    UUID
)
RETURNS TABLE (new_total_price NUMERIC, fee_charged NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_seat_id      UUID;
  v_old_flight_id    UUID;
  v_old_price        NUMERIC;
  v_status           TEXT;
  v_new_flight_price NUMERIC;
  v_new_seat_fee     NUMERIC;
  v_new_total        NUMERIC;
  v_fee              NUMERIC;
  v_new_seat_avail   BOOLEAN;
BEGIN
  -- Lock current booking
  SELECT b.seat_id, b.flight_id, b.total_price, b.status
  INTO v_old_seat_id, v_old_flight_id, v_old_price, v_status
  FROM bookings b
  WHERE b.id = p_booking_id
    AND b.user_id = p_user_id
  FOR UPDATE NOWAIT;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or access denied'
      USING ERRCODE = 'P0003';
  END IF;

  IF v_status = 'cancelled' THEN
    RAISE EXCEPTION 'Cannot reschedule a cancelled booking'
      USING ERRCODE = 'P0006';
  END IF;

  -- Lock new seat
  SELECT is_available INTO v_new_seat_avail
  FROM seats
  WHERE id = p_new_seat_id
    AND flight_id = p_new_flight_id
  FOR UPDATE NOWAIT;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'New seat not found for this flight'
      USING ERRCODE = 'P0001';
  END IF;

  IF NOT v_new_seat_avail THEN
    RAISE EXCEPTION 'New seat is already booked'
      USING ERRCODE = 'P0002';
  END IF;

  -- Calculate new total and fee
  SELECT base_price INTO v_new_flight_price FROM flights WHERE id = p_new_flight_id;
  SELECT extra_fee  INTO v_new_seat_fee     FROM seats   WHERE id = p_new_seat_id;
  v_new_total := v_new_flight_price + v_new_seat_fee;
  v_fee := GREATEST(0, v_new_total - v_old_price);  -- fee only if more expensive

  -- Free old seat
  UPDATE seats SET is_available = true  WHERE id = v_old_seat_id;
  -- Reserve new seat
  UPDATE seats SET is_available = false WHERE id = p_new_seat_id;

  -- Record reschedule
  INSERT INTO reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  VALUES (p_booking_id, v_old_flight_id, p_new_flight_id, v_fee);

  -- Update booking
  UPDATE bookings
  SET flight_id    = p_new_flight_id,
      seat_id      = p_new_seat_id,
      status       = 'rescheduled',
      total_price  = v_new_total
  WHERE id = p_booking_id;

  RETURN QUERY SELECT v_new_total, v_fee;
END;
$$;
