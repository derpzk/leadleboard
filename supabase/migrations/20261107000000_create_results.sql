begin;

create table public.results (
  id uuid primary key,
  -- Temporary local:name values; account ownership will be added with auth.
  player_id text not null,
  player_name text,
  game_name text not null,
  date_played date not null,
  submit_time timestamptz not null,
  score numeric,
  result jsonb not null,

  constraint results_player_game_puzzle_unique
    unique (player_id, game_name, date_played)
);

alter table public.results enable row level security;

-- App access will be configured when the server is connected to Supabase.
revoke all on table public.results from anon, authenticated;

commit;
