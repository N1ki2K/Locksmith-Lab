# Secured

Secured is a hardened copy of the Locksmith Lab notes application. It keeps the same React screens, session based login, notes workflow, endpoint names, and layered Express architecture as Unsecured so the two versions can be compared directly.

## Architecture

- `frontend/`: React, Vite and TypeScript client.
- `api/src/routes/`: maps the existing HTTP endpoints.
- `api/src/controllers/`: validates requests and returns HTTP responses.
- `api/src/services/`: password and note business logic.
- `api/src/repositories/`: PostgreSQL queries, all parameterized.
- `api/src/middleware/`: authentication and CSRF checks.
- `database/init.sql`: PostgreSQL 17 schema, with foreign keys, constraints and timestamp defaults.
- `docker-compose.yml`: isolated PostgreSQL container and volume for Secured.

## Run locally

Requirements: Node.js, npm and Docker Compose.

1. From `secured/`, copy `.env.example` to `.env`. Set `DB_PASSWORD` to a local database password and `SESSION_SECRET` to a unique random value of at least 32 characters. For example, generate a secret with `openssl rand -hex 32`. The example file contains placeholders only. For a quick local database-only start, Compose also has a localhost-only fallback password; replace it before using a shared environment.
2. Start the isolated Secured database:

   ```sh
   cd secured
   docker compose up -d database
   ```

   It binds PostgreSQL to host port `5433` and stores data in `secured_postgres_data`; Unsecured uses its own port, container and volume.
3. In another terminal, start the API:

   ```sh
   cd secured/api
   npm install
   npm run dev
   ```

   The API reads `secured/.env`, binds port `3001`, and expects the database on port `5433`.
4. In another terminal, start the frontend:

   ```sh
   cd secured/frontend
   npm install
   npm run dev
   ```

   Open <http://localhost:5174>. `VITE_API_URL` can override the default `http://localhost:3001/api` in `secured/frontend/.env.local`.
5. Stop PostgreSQL with `cd secured && docker compose down`. Add `-v` only when you intend to delete the Secured database volume.

To run the two applications at once, use Unsecured's existing ports and settings alongside these Secured defaults. The frontend origin is explicitly configured as `http://localhost:5174`.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_BIND_ADDRESS`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Secured PostgreSQL connection | `127.0.0.1`, `5433`, localhost-only bind, `locksmith_secured`, `local-development-only` for Compose, `locksmith_secured` |
| `SESSION_SECRET` | Express session signing secret; unique and 32+ characters | Required |
| `PORT` | API listen port | `3001` |
| `FRONTEND_ORIGIN` | Exact credentialed CORS origin | `http://localhost:5174` |
| `NODE_ENV` | Production enables Secure cookies | `development` |
| `TRUST_PROXY` | Trust one proxy when production uses HTTPS termination | `false` |
| `VITE_API_URL` | Frontend API base URL, including `/api` | `http://localhost:3001/api` |
| `TEST_DATABASE_URL` | Dedicated integration-test PostgreSQL database | No default; must name a database containing `test` |

For production, use HTTPS, a generated secret, a private database, and set `TRUST_PROXY=true` only behind one trusted reverse proxy. Cookies are `httpOnly`, `sameSite=lax`, eight hours in duration, and `secure` in production. PostgreSQL stores sessions in `secured_sessions`.

## Protections

- PostgreSQL values are passed separately from SQL statements using `$1`, `$2`, and so on.
- Passwords use Argon2id with 19 MiB memory (`memoryCost=19456` KiB), two iterations, and one lane. Argon2 generates a random salt and stores an encoded hash. Login uses a generic invalid-credentials response.
- Login is rate limited to 10 attempts per 15 minutes per client IP. Duplicate names are caught by the unique constraint and return HTTP 409.
- Note IDs must be positive integers. Note reads, updates and deletes include both `id` and the authenticated `user_id` in the SQL condition. A missing or foreign note returns the same 404 response.
- The server validates types, formats, lengths, and allowed fields. Usernames are 3-100 ASCII letters, digits, dots, underscores or hyphens. Passwords are 12-128 characters. Titles are 1-255 and note content 1-4000 characters. Note create/update bodies accept only `title` and `content`.
- Successful login regenerates the session identifier. Logout destroys the PostgreSQL session and clears the cookie. Session signing secret is required at startup.
- A synchronizer CSRF token is available at `GET /api/csrf-token`. The frontend sends it in `X-CSRF-Token` on every state changing request, including register, login and logout.
- Helmet sets standard HTTP security headers. CORS permits one configured frontend origin with credentials; wildcard origins are not used. JSON request bodies are limited to 16 KiB.
- React renders note strings as ordinary text; note content is never injected as HTML.

## Tests and checks

Backend tests are integration tests against a dedicated PostgreSQL database; the test runner refuses a URL whose database name lacks `test`. Create it and apply the schema once:

```sh
cd secured
docker compose exec -T database createdb -U locksmith_secured locksmith_secured_test
docker compose exec -T database psql -U locksmith_secured -d locksmith_secured_test < database/init.sql
```

Set `TEST_DATABASE_URL` to that database URL (with your local password), then run:

```sh
cd secured/api
npm test
npm run typecheck
```

Run the frontend checks with `cd secured/frontend && npm run build && npm run lint`. The tests cover registration and hash storage, correct and incorrect login, SQL injection strings, CSRF, login session rotation, logout invalidation, note CRUD, ownership enforcement and invalid input.

## Comparing Secured with Unsecured

Start the same workflow in each version: register two accounts, log in, create notes, then try to access another account's note by ID. Unsecured is intentionally vulnerable and must only be run in a controlled local environment. Secured keeps its code, database volume, port, session cookie name and frontend origin separate for side by side demonstration. See [SECURITY_CHANGES.md](SECURITY_CHANGES.md) for source locations and reproduction steps.
