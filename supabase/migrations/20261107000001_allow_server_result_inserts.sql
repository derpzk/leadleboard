-- The server's secret key uses service_role. Browser roles stay restricted.
grant insert on table public.results to service_role;
