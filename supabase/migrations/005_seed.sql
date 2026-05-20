-- ============================================================
-- 005_seed.sql
-- 8 flights across 4 routes, full seat maps per flight,
-- and one test user booking.
--
-- Supabase Auth dashboard (email: test@flightapp.com,
-- password: Test1234!). Then paste the user's UUID below.
--
-- Routes:
--   BOM → DEL  (Mumbai → Delhi)
--   DEL → BOM  (Delhi → Mumbai)
--   BOM → BLR  (Mumbai → Bangalore)
--   BLR → BOM  (Bangalore → Mumbai)
-- ============================================================

-- -----------------------------------------------------------
-- Flights
-- -----------------------------------------------------------
insert into public.flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) values

-- BOM → DEL
('11111111-0000-0000-0000-000000000001', 'FA101', 'BOM', 'DEL',
  now() + interval '2 days 6 hours',
  now() + interval '2 days 8 hours',
  'Boeing 737', 'scheduled', 4500.00),

('11111111-0000-0000-0000-000000000002', 'FA103', 'BOM', 'DEL',
  now() + interval '3 days 14 hours',
  now() + interval '3 days 16 hours',
  'Airbus A320', 'scheduled', 3800.00),

-- DEL → BOM
('22222222-0000-0000-0000-000000000001', 'FA202', 'DEL', 'BOM',
  now() + interval '2 days 10 hours',
  now() + interval '2 days 12 hours',
  'Boeing 737', 'scheduled', 4200.00),

('22222222-0000-0000-0000-000000000002', 'FA204', 'DEL', 'BOM',
  now() + interval '4 days 8 hours',
  now() + interval '4 days 10 hours',
  'Airbus A321', 'scheduled', 3600.00),

-- BOM → BLR
('33333333-0000-0000-0000-000000000001', 'FA301', 'BOM', 'BLR',
  now() + interval '1 day 9 hours',
  now() + interval '1 day 10 hours 30 minutes',
  'Airbus A320', 'scheduled', 3200.00),

('33333333-0000-0000-0000-000000000002', 'FA303', 'BOM', 'BLR',
  now() + interval '5 days 7 hours',
  now() + interval '5 days 8 hours 30 minutes',
  'Boeing 737', 'scheduled', 2900.00),

-- BLR → BOM
('44444444-0000-0000-0000-000000000001', 'FA402', 'BLR', 'BOM',
  now() + interval '1 day 12 hours',
  now() + interval '1 day 13 hours 30 minutes',
  'Airbus A320', 'scheduled', 3000.00),

('44444444-0000-0000-0000-000000000002', 'FA404', 'BLR', 'BOM',
  now() + interval '6 days 16 hours',
  now() + interval '6 days 17 hours 30 minutes',
  'Airbus A321', 'scheduled', 2800.00);

-- -----------------------------------------------------------
-- Seat maps — generate for each flight
-- Aircraft layout:
--   First class:   rows 1–2,  seats A B (2 abreast),   extra_fee = 5000
--   Business:      rows 3–6,  seats A B C (3 abreast),  extra_fee = 2500
--   Economy:       rows 7–30, seats A B C D E F (6 abreast), extra_fee = 0
-- -----------------------------------------------------------
do $$
declare
  v_flight_id uuid;
  v_flight_ids uuid[] := array[
    '11111111-0000-0000-0000-000000000001'::uuid,
    '11111111-0000-0000-0000-000000000002'::uuid,
    '22222222-0000-0000-0000-000000000001'::uuid,
    '22222222-0000-0000-0000-000000000002'::uuid,
    '33333333-0000-0000-0000-000000000001'::uuid,
    '33333333-0000-0000-0000-000000000002'::uuid,
    '44444444-0000-0000-0000-000000000001'::uuid,
    '44444444-0000-0000-0000-000000000002'::uuid
  ];
  v_row int;
  v_col text;
  v_class text;
  v_fee numeric;
  v_cols text[];
begin
  foreach v_flight_id in array v_flight_ids loop

    -- First class: rows 1–2, cols A B
    for v_row in 1..2 loop
      foreach v_col in array array['A','B'] loop
        insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
        values (v_flight_id, v_row::text || v_col, 'first', true, 5000.00);
      end loop;
    end loop;

    -- Business: rows 3–6, cols A B C
    for v_row in 3..6 loop
      foreach v_col in array array['A','B','C'] loop
        insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
        values (v_flight_id, v_row::text || v_col, 'business', true, 2500.00);
      end loop;
    end loop;

    -- Economy: rows 7–30, cols A B C D E F
    for v_row in 7..30 loop
      foreach v_col in array array['A','B','C','D','E','F'] loop
        insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
        values (v_flight_id, v_row::text || v_col, 'economy', true, 0.00);
      end loop;
    end loop;

  end loop;
end $$;

