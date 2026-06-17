create table if not exists public.profile (
  user_id     text primary key,
  name        text,
  employee_id text,
  department  text,
  position    text,
  phone       text,
  email       text,
  avatar_text text,
  updated_at  timestamptz default now()
);

create index if not exists profile_position_idx on public.profile (position);
