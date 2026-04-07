# Lumen Frontend

Next.js 14 (App Router) UI for **Lumen** — a self-hosted IT ticketing system. Features a dark-themed dashboard, real-time ticket management, and full admin controls. Integrates with Keycloak for SSO and communicates with the NestJS backend via JWT-authenticated REST API.

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router, `(app)` layout groups) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS (custom dark theme via CSS variables) |
| Data Fetching | TanStack React Query v5 |
| Auth | Keycloak OIDC via `keycloak-js` 24 |
| HTTP Client | Axios (JWT interceptor with auto-refresh) |
| Charts | Recharts (lazy-loaded via `next/dynamic`) |
| Icons | Lucide React |
| Drag & Drop | dnd-kit (column reordering) |
| UI Primitives | Radix UI (Dialog, Label, Select) |

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
| `AUTH_SECRET` | Secret used by Auth.js to sign/encrypt session data | Generated value |
| `AUTH_URL` | Public frontend URL used by Auth.js callbacks and session endpoints | `http://localhost:3000` |
| `AUTH_TRUST_HOST` | Explicitly trusts the incoming host header; needed for local production runs and Docker | `true` |
| `AUTH_KEYCLOAK_ID` | Keycloak confidential client ID used by Auth.js | `lumen-frontend` |
| `AUTH_KEYCLOAK_SECRET` | Keycloak confidential client secret used by Auth.js | Keycloak client secret |
| `AUTH_KEYCLOAK_ISSUER` | Keycloak realm issuer URL used by Auth.js | `http://localhost:8080/realms/lumen` |

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
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (metadata, fonts, providers)
│   ├── page.tsx                      # / → redirects to /dashboard
│   ├── providers.tsx                 # QueryClientProvider + AuthProvider
│   ├── globals.css                   # Tailwind config, CSS variables, dark theme
│   └── (app)/                        # Authenticated layout group (requires login)
│       ├── layout.tsx                # App shell — Sidebar + Topbar wrapper
│       ├── dashboard/page.tsx        # Analytics dashboard (KPIs, charts, agent perf)
│       ├── billets/
│       │   ├── page.tsx              # Ticket list — status toggle filters, CSV export,
│       │   │                         #   search, sortable columns, column visibility
│       │   ├── nouveau/page.tsx      # Ticket creation form (all fields required)
│       │   └── [id]/page.tsx         # Ticket detail — comments, attachments, history,
│       │                             #   status changes, reopen, file upload
│       ├── categories/page.tsx       # "Champs personnalisés" — tabbed Categories +
│       │                             #   Departments management (ADMIN/AGENT)
│       └── admin/page.tsx            # User management — role assignment (ADMIN only)
├── components/
│   ├── AppShell.tsx                  # Layout wrapper (Sidebar + Topbar + content area)
│   ├── Sidebar.tsx                   # Fixed left nav — role-based menu items
│   ├── Topbar.tsx                    # Top bar — "Groupe Meloche Inc." branding
│   ├── CustomSelect.tsx              # Styled dropdown — animated, click-outside-close,
│   │                                 #   replaces all native <select> elements
│   ├── TicketStatusBadge.tsx         # Colored pill for ticket status
│   ├── TicketHistoryPanel.tsx        # Audit log side panel (lazy-loaded)
│   ├── DashboardCharts/
│   │   ├── KpiCard.tsx              # Status count cards
│   │   ├── VolumeChart.tsx          # Weekly ticket volume (Recharts, lazy-loaded)
│   │   ├── CategoryDonut.tsx        # Category distribution (Recharts, lazy-loaded)
│   │   ├── AgentPerformanceTable.tsx # Agent stats table
│   │   └── AttentionList.tsx        # High-priority/overdue ticket list
│   └── TicketTable/
│       ├── TicketTable.tsx          # Sortable, drag-reorderable columns, DnD via dnd-kit
│       ├── ColumnVisibilityPopover.tsx # Show/hide columns (persisted in localStorage)
│       └── FilterBar.tsx            # Legacy — replaced by inline status toggle buttons
├── contexts/
│   └── AuthContext.tsx              # Keycloak init, user state, role extraction
└── lib/
    ├── keycloak.ts                  # Keycloak singleton instance
    ├── translations.ts              # French labels — STATUS_LABELS, PRIORITY_LABELS,
    │                                #   STATUS_STYLES, PRIORITY_COLORS
    └── api/
        ├── client.ts                # Axios instance — JWT interceptor, token refresh
        ├── tickets.ts               # Ticket CRUD, events, types (Ticket, CreateTicketData)
        ├── comments.ts              # Comment CRUD
        ├── attachments.ts           # File upload, download URL fetching
        ├── categories.ts            # Category CRUD
        ├── departments.ts           # Department CRUD
        └── analytics.ts             # Dashboard data fetching
```

## Pages & Features

### Dashboard (`/dashboard`)
- **Admin/Agent view**: KPI cards (open, in progress, resolved, closed counts), weekly volume chart, category donut chart, agent performance table, attention-needed list
- **User view**: personal ticket stats and recent tickets
- Heavy chart components (`VolumeChart`, `CategoryDonut`) are lazy-loaded via `next/dynamic` to reduce dev compilation time

### Ticket List (`/billets`)
- **Status toggle buttons**: Tous, Ouvert, En cours, En attente, Résolu, Fermé — colored buttons replace traditional filter dropdowns
- **Sortable columns**: click column headers to sort (all fields including relations)
- **Column visibility**: configurable via popover, settings persisted in `localStorage`, auto-merges new columns
- **Column reordering**: drag-and-drop via dnd-kit
- **Search**: real-time title search
- **CSV export**: exports currently displayed tickets (respects active filters) with French headers, `;` delimiter, UTF-8 BOM
- **Pagination**: 20 tickets per page with navigation

### Ticket Creation (`/billets/nouveau`)
- All fields are **required**: title, description, priority, category, department, site
- **Site selector**: Valleyfield, Beauharnois, Montréal, Brossard, Bromont, Hemmingford
- **File attachments**: drag-and-drop zone, 10 MB limit per file, multi-file upload with progress
- Client-side validation + backend Zod schema enforcement

### Ticket Detail (`/billets/[id]`)
- Full ticket view with description, metadata (priority, status, category, department, site, submitter, assignee)
- **Comments**: add/delete comments
- **Attachments**: upload, download (presigned URLs), delete
- **Status changes**: agents/admins can change status via custom dropdown (with confirmation modal)
- **Inline field editors**: agents/admins can change **priority**, **catégorie**, and **département** directly from dropdowns in the sidebar — every change goes through a confirmation modal and emits the matching audit event (`PRIORITY_CHANGED`, `CATEGORY_CHANGED`, `DEPARTMENT_CHANGED`)
- **Assignee dropdown**: searchable list of ADMIN/AGENT users between *Soumis par* and *Créé le*. First assignment submits immediately; reassignment requires confirmation. Regular users see a read-only "Assigné à" label (or *Non assigné*).
- **Reopen**: submitters can reopen their own CLOSED/RESOLVED tickets with a mandatory reason message (posted as comment: "Billet réouvert par le demandeur : ___")
- **Close**: submitters can close with a "solution found" message
- **History panel**: lazy-loaded audit log showing all events (status changes, assignments, title edits, etc.)

### Custom Fields (`/categories`)
- **Tabbed interface**: Categories tab + Departments tab in one page
- **Inline CRUD**: create, rename (inline edit), delete for both categories and departments
- Shows ticket count per item
- Accessible to ADMIN and AGENT roles only

### Admin (`/admin`)
- User list with name, email, current role
- Role assignment via custom dropdown (ADMIN, Agent, Utilisateur)
- Self-role change is blocked (shows badge instead of dropdown)
- ADMIN-only access

## Authentication Flow

1. App loads → `AuthContext` initializes Keycloak with `onLoad: 'login-required'`
2. Unauthenticated users are redirected to Keycloak login page
3. On successful login, Keycloak issues a JWT; the app parses `realm_access.roles` to determine role (`ADMIN`, `AGENT`, or `USER`)
4. Every API call: Axios interceptor runs `keycloak.updateToken(30)` (refresh if expiring within 30s) then attaches `Authorization: Bearer <jwt>`
5. Backend validates JWT against Keycloak's JWKS endpoint

## Roles

| Role | Sidebar Access | Capabilities |
|---|---|---|
| `USER` | Dashboard, Billets | Submit tickets, comment, upload files, reopen own closed tickets |
| `AGENT` | Dashboard, Billets, Champs personnalisés | All USER + change status, manage categories/departments |
| `ADMIN` | Dashboard, Billets, Champs personnalisés, Paramètres | All AGENT + user management, role assignment, analytics |

Role checks are enforced on the backend. The frontend uses the role for conditional UI rendering (sidebar items, action buttons, admin pages).

## Data Fetching

All data fetching uses **React Query v5**. No direct `fetch` or `axios` calls inside components — use the API functions in `src/lib/api/`.

```ts
const { data: tickets } = useQuery({
  queryKey: ['tickets', params],
  queryFn: () => ticketsApi.getAll(params),
  placeholderData: keepPreviousData, // smooth pagination
});
```

- Mutations invalidate relevant query keys on success (e.g., adding a comment invalidates both `ticket` and `ticket-events`)
- Categories and departments use `staleTime: 5 * 60_000` (5 min cache)

## Performance Optimizations

- **Lazy loading**: `VolumeChart`, `CategoryDonut`, and `TicketHistoryPanel` loaded via `next/dynamic` with `ssr: false` — saves ~1500 module compilations on initial dev load
- **SQL aggregations**: analytics dashboard uses optimized `GROUP BY` and `date_trunc` queries (single SQL instead of 6+ individual counts)
- **Connection pool**: backend Prisma pool sized at 10 to handle parallel analytics queries
- **Selective fetching**: ticket list uses `select` (not `include`) to avoid loading full relations

## Docker

The app uses a multi-stage Dockerfile with `output: 'standalone'` (set in `next.config.js`). The final image runs `node server.js` on port 3000 with no dev dependencies.

```bash
docker build -t lumen-frontend .
docker run -p 3000:3000 --env-file .env.local lumen-frontend
```

For `npm run start` or Docker, make sure `AUTH_URL` matches the frontend URL you open in the browser and keep `AUTH_TRUST_HOST=true` for local/self-hosted runs.
