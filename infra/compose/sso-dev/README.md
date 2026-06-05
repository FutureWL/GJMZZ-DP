# aygjm-sso-dev

## Prerequisites

- Docker Desktop running

## Local DNS (hosts)

Add this entry to your `C:\Windows\System32\drivers\etc\hosts`:

- `127.0.0.1 sso.corp.aygjm.lan`

## Start

From this folder:

- Copy `.env.example` to `.env`
- Run `docker compose --env-file .env up -d`

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

- Run `docker compose --env-file .env down`
