# Lumen Frontend

Next.js 14 (App Router) UI for **Lumen** — a self-hosted IT ticketing system for 600+ employees. Integrates with Keycloak for SSO, communicates with the NestJS backend via a JWT-authenticated REST API.

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Data Fetching | TanStack React Query v5 |
| Auth | Keycloak (OIDC via `keycloak-js`) |
| HTTP Client | Axios (with JWT interceptor) |
| UI Primitives | Radix UI |

## Getting Started

### Prerequisites

- Node.js 20+
- The full stack running via Docker (`docker compose up -d` from the monorepo root)

### Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to Keycloak to log in.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://localhost:3001` |
| `NEXT_PUBLIC_KEYCLOAK_URL` | Keycloak server URL | `http://localhost:8080` |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Keycloak realm name | `lumen` |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Keycloak client ID | `lumen-frontend` |

## Commands

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # ESLint
```

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (metadata, providers)
│   ├── page.tsx                # / → redirects to /dashboard
│   ├── providers.tsx           # QueryClientProvider + AuthProvider
│   ├── globals.css             # Tailwind imports, CSS variables
│   ├── dashboard/page.tsx      # Ticket stats + recent tickets table
│   ├── tickets/
│   │   ├── page.tsx            # Ticket list with search/filter
│   │   ├── new/page.tsx        # Create ticket form
│   │   └── [id]/page.tsx       # Ticket detail, comments, status
│   └── admin/page.tsx          # User management (ADMIN only)
├── components/
│   ├── Navbar.tsx              # Top navigation bar
│   └── TicketStatusBadge.tsx   # Colored status pill
├── contexts/
│   └── AuthContext.tsx         # Auth state, user object, role extraction
└── lib/
    ├── keycloak.ts             # Keycloak singleton
    └── api/
        ├── client.ts           # Axios instance with JWT interceptor
        ├── tickets.ts          # Ticket API functions & types
        └── comments.ts         # Comment API functions & types
```

## Authentication Flow

1. App initializes Keycloak with `onLoad: 'login-required'`
2. Unauthenticated users are redirected to Keycloak login
3. On login, Keycloak issues a JWT; the app parses `realm_access.roles` to determine role (`ADMIN`, `AGENT`, or `USER`)
4. Every API request runs `keycloak.updateToken(30)` (refresh if expiring within 30s) then attaches `Authorization: Bearer <jwt>`
5. The backend validates the JWT against Keycloak's JWKS endpoint

## Roles

| Role | Access |
|---|---|
| `USER` | Submit tickets, add comments, view own tickets |
| `AGENT` | All USER access + change ticket status |
| `ADMIN` | All AGENT access + access `/admin` (user management) |

Role checks are enforced on the backend. The frontend uses the role for conditional UI (hiding/showing the status dropdown, admin nav link, etc.).

## Data Fetching

All data fetching uses **React Query**. No direct `fetch` or `axios` calls inside components — use the hooks and API functions in `src/lib/api/`.

```ts
// Example
const { data: tickets } = useQuery({
  queryKey: ['tickets', status, priority],
  queryFn: () => ticketsApi.getAll({ status, priority }),
});
```

- `staleTime`: 30 seconds
- Mutations invalidate relevant query keys on success

## Docker

The app uses a multi-stage Dockerfile with `output: 'standalone'` (set in `next.config.js`). The final image runs `node server.js` on port 3000 with no dev dependencies.

```bash
docker build -t lumen-frontend .
docker run -p 3000:3000 --env-file .env.local lumen-frontend
```
