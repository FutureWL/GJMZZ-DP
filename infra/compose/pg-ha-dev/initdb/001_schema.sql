CREATE TABLE IF NOT EXISTS public.factory (
  id bigserial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workshop (
  id bigserial PRIMARY KEY,
  factory_id bigint NOT NULL REFERENCES public.factory(id) ON DELETE RESTRICT,
  code text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (factory_id, code)
);

CREATE TABLE IF NOT EXISTS public.production_line (
  id bigserial PRIMARY KEY,
  workshop_id bigint NOT NULL REFERENCES public.workshop(id) ON DELETE RESTRICT,
  code text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workshop_id, code)
);

CREATE TABLE IF NOT EXISTS public.equipment (
  id bigserial PRIMARY KEY,
  production_line_id bigint NOT NULL REFERENCES public.production_line(id) ON DELETE RESTRICT,
  code text NOT NULL,
  name text NOT NULL,
  model text,
  vendor text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (production_line_id, code)
);

CREATE TABLE IF NOT EXISTS public.app_user (
  id bigserial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

