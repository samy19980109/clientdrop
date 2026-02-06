# ClientDrop

The simplest way to give your clients a branded portal. File sharing, messaging, document requests, and payments — all in one place.

## What is ClientDrop?

ClientDrop replaces the email chaos between you and your clients. Instead of scattered attachments, lost threads, and "where are we on this?" emails, every client gets their own branded portal where they can:

- View and download files you share
- Upload documents you request
- Send and receive messages
- See their project status
- Pay invoices

Built for accountants, consultants, designers, coaches, agencies, and any service professional who works with clients.

## Features

- **Branded Client Portal** — Your logo, your colors, your business name. Clients see your brand, not ours.
- **Magic Link Auth** — No passwords. Clients click a link in their email and they're in.
- **File Sharing** — Upload files for clients, let clients upload back. No more email attachments.
- **Messaging** — Simple chat thread per client. Everything in one place.
- **Document Request Checklists** — "Please upload these 5 documents." Clients see what's done and what's missing.
- **Payment Links** — Send a "Pay Now" button. Clients pay via Stripe.
- **Project Status Board** — Clients always know where things stand (Not Started, In Progress, In Review, Completed, On Hold).
- **Activity Timeline** — Full log of every action: uploads, messages, status changes.
- **Dashboard** — See all clients, stats, and recent activity at a glance.
- **Mobile Responsive** — Works on phones, tablets, and desktops.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Auth | Supabase Auth (magic links) |
| File Storage | Supabase Storage |
| Icons | [Lucide React](https://lucide.dev) |
| Hosting | [Vercel](https://vercel.com) (recommended) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd clientdrop
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Paste the contents of `supabase-schema.sql` and click **Run**
4. Go to **Settings > API** and copy your project URL and anon key

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/
│   │   ├── login/page.tsx          # Magic link login
│   │   └── callback/route.ts      # Auth callback handler
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard shell with sidebar
│   │   ├── page.tsx                # Main dashboard (stats, activity)
│   │   ├── clients/
│   │   │   ├── page.tsx            # Client list
│   │   │   └── [id]/page.tsx       # Client detail view
│   │   └── settings/page.tsx       # Branding settings
│   └── portal/
│       └── [token]/page.tsx        # Client-facing portal
├── components/
│   ├── ui/                         # Reusable UI components
│   ├── dashboard/                  # Provider-side components
│   └── portal/                     # Client-facing components
├── lib/
│   ├── utils.ts                    # Formatting helpers
│   └── supabase/                   # Supabase client setup
├── types/
│   └── database.ts                 # TypeScript types
└── proxy.ts                        # Route protection (Next.js 16 proxy)
```

## Database Schema

The full schema is in `supabase-schema.sql`. Key tables:

| Table | Purpose |
|---|---|
| `profiles` | Provider branding (business name, colors, logo) |
| `clients` | Client records with unique portal tokens |
| `shared_files` | Files shared between provider and client |
| `messages` | Chat messages per client |
| `document_requests` | Document checklists with upload tracking |
| `payment_links` | Payment requests with pending/paid status |
| `activities` | Activity log for full audit trail |

Row Level Security (RLS) is enabled on all tables. Providers can only access their own data. Portal access is handled via unique tokens.

## How It Works

### For You (the service provider)

1. Sign up and set your business name + brand color
2. Add clients — each one gets a unique portal link
3. Share files, send messages, request documents, send payment links
4. Track everything from your dashboard

### For Your Clients

1. Click the portal link you send them (no account needed)
2. See their project status, files, messages, and document requests
3. Upload requested documents, send messages, and pay invoices
4. Everything branded with your business identity

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository at [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain, e.g. `https://clientdrop.vercel.app`)
4. Deploy

### Post-deployment

Update the **Site URL** in your Supabase dashboard (Authentication > URL Configuration) to match your Vercel domain so magic link emails redirect correctly.

## Roadmap

- [ ] Email notifications via Resend
- [ ] Stripe Checkout integration for payment links
- [ ] Full invoicing with line items
- [ ] Intake form builder with custom fields
- [ ] Contracts and e-signatures
- [ ] Calendar and appointment booking
- [ ] Workflow automation
- [ ] Team members with role-based permissions
- [ ] Custom domains (portal.yourbusiness.com)
- [ ] API and Zapier integration

## License

MIT
