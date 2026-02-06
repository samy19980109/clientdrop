# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server at localhost:3000
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npx tsc --noEmit` — Type-check without emitting

No test framework is configured yet.

## Architecture

ClientDrop is a Next.js 16 App Router application with two distinct user-facing surfaces:

1. **Provider dashboard** (`/dashboard/*`) — Authenticated area for service providers to manage clients, files, messages, document requests, and payments.
2. **Client portal** (`/portal/[token]`) — Public-facing branded portal accessed via a unique token URL (no auth required for clients).

### Authentication Model

- Providers authenticate via Supabase magic links (passwordless email).
- Proxy in `src/proxy.ts` (Next.js 16 convention, replaces deprecated `middleware.ts`) protects `/dashboard/*` routes and redirects authenticated users away from `/auth/login`. Session refresh logic is in `src/lib/supabase/proxy.ts` and uses `getClaims()` (not `getUser()`) to prevent random session termination.
- Client portals use a `portal_token` column on the `clients` table — no client login required.

### Supabase Client Pattern

Two Supabase clients exist for different contexts:
- `src/lib/supabase/server.ts` — `createServerSupabase()` for Server Components and Route Handlers (uses `cookies()`)
- `src/lib/supabase/client.ts` — `createClient()` for Client Components (browser-side)

Server Components fetch data and pass it as props to Client Components that handle interactivity.

### Data Model

All database tables use Row Level Security (RLS). The schema is in `supabase-schema.sql`. Key relationships:

- `profiles` — extends `auth.users`, stores branding (auto-created via trigger)
- `clients` — belong to a provider via `provider_id`, each has a unique `portal_token`
- `shared_files`, `messages`, `document_requests`, `payment_links`, `activities` — all reference `client_id`
- `document_requests.items` and `intake_forms.fields` are stored as JSONB arrays

### Styling

Tailwind CSS v4 with custom CSS variables defined in `src/app/globals.css`. Use the semantic color names (`accent`, `muted`, `border`, `success`, `warning`, `danger`) rather than raw Tailwind colors. The `cn()` utility from `src/lib/utils.ts` combines `clsx` for conditional class merging.

### Component Organization

- `src/components/ui/` — Generic reusable components (Button, Input, Card, Badge, Avatar, EmptyState)
- `src/components/dashboard/` — Provider-side components (shell layout, client list, client detail, settings)
- `src/components/portal/` — Client-facing portal components

The main client detail view (`src/components/dashboard/client-detail.tsx`) is a large tabbed component containing Files, Messages, Documents, Payments, and Activity sub-components. The portal view (`src/components/portal/portal-view.tsx`) mirrors this structure from the client's perspective.

### Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` — used to generate portal URLs

### File Storage

Files are uploaded to a Supabase Storage bucket called `client-files`, namespaced by `{client_id}/{timestamp}-{filename}`. Both providers and clients can upload. Public URLs are stored in the `shared_files` table.
