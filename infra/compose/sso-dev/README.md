# aygjm-sso-dev

## Prerequisites

- Docker Desktop running

## Local DNS (hosts)

Add this entry to your `C:\Windows\System32\drivers\etc\hosts`:

- `127.0.0.1 sso.corp.aygjm.lan`

## Start

From this folder:

- Copy root `.env.example` to root `.env` (if not exists)
- Ensure the root `docker-compose.yml` Postgres (`33705`) is running
- Run `docker compose --env-file ../../.env up -d`

## Realm (auto import)

- Realm: `factory-platform`
- Client (SPA): `portal-ui`
- Client (CLI): `dev-cli` (password grant for local testing)
- Demo user: `demo / demo`

## Access

- Keycloak: `http://sso.corp.aygjm.lan:18080/`
- Admin Console: `http://sso.corp.aygjm.lan:18080/admin`
- Default admin: `admin / admin` (change in `.env`)

## Stop

- Run `docker compose --env-file ../../.env down`
