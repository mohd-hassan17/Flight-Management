-- ============================================================
-- 004_cancellation_trigger.sql
-- DB-level enforcement of the 2-hour cancellation rule.
-- This fires even if someone bypasses the RPC and tries
-- a direct UPDATE on the bookings table.
-- ============================================================

create or replace function public.enforce_cancellation_window()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_departs timestamptz;
begin
  -- Only fire when status is changing TO 'cancelled'
  if NEW.status = 'cancelled' and OLD.status <> 'cancelled' then
    select departs_at
      into v_departs
      from public.flights
     where id = NEW.flight_id;

    if v_departs - now() < interval '2 hours' then
      raise exception
        'Cancellation blocked: flight departs in less than 2 hours.'
        using errcode = 'P0004';
    end if;
  end if;

  return NEW;
end;
$$;

create trigger trg_enforce_cancellation_window
  before update on public.bookings
  for each row
  execute function public.enforce_cancellation_window();
