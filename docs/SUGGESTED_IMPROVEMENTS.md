# Suggested Improvements

Prioritized list of improvements for ClientDrop, organized by impact and effort.

---

## High Impact, Low Effort

### 1. Email Notifications
- Notify providers when a client uploads a file, sends a message, or completes a document request
- Notify clients when the provider shares a new file, sends a message, or creates a payment request
- Use Supabase Edge Functions + Resend/Postmark for transactional email
- Add a `notification_preferences` JSONB column to `profiles` so providers can toggle what they receive

### 2. Real-Time Updates
- Currently the app requires manual page refresh to see new messages/files
- Add Supabase Realtime subscriptions on `messages`, `shared_files`, and `activities` tables
- Messages tab should feel like a live chat, not a form submission

### 3. ~~File Delete from Storage~~ DONE
> Implemented: added `storage_path` column to `shared_files`, saved on upload (provider + client), fetch + remove from storage bucket on delete, added RLS delete policy on `storage.objects`.

### 4. Bulk File Upload
- Allow dragging multiple files at once instead of one-at-a-time uploads
- Add drag-and-drop zone with `onDragOver`/`onDrop` handlers
- Show upload progress for each file

### 5. Portal Link Sharing via Email
- Add a "Send portal link" button next to the copy button on the client detail page
- Sends the client an email with their portal URL and a welcome message
- Reduces friction for first-time portal access

---

## High Impact, Medium Effort

### 6. Stripe Integration for Payments
- Currently payment links are just records with no actual payment flow
- Integrate Stripe Checkout: when client clicks "Pay now", create a Checkout Session via API route
- On success webhook, update `payment_links.status` to `paid` and record `paid_at`
- Add a `/api/webhooks/stripe` route handler for `checkout.session.completed`

### 7. Intake Forms
- The database schema already has `intake_forms` and `intake_responses` tables but no UI
- Build a form builder in settings: drag/drop fields (text, select, file upload, date)
- Auto-send intake form to new clients via their portal
- Store responses as JSONB, display them in the client detail view

### 8. Client Authentication (Optional Layer)
- Current portal access is token-only (anyone with the URL can view)
- Add optional PIN or email verification for sensitive portals
- Provider can toggle "Require verification" per client in settings
- Client enters email, receives a code, then accesses their portal

### 9. Custom Domain Support
- Allow Pro/Team plan users to use `portal.theirbusiness.com` instead of `clientdrop.com/portal/...`
- Use Vercel's Domains API or Cloudflare for custom domain provisioning
- Store `custom_domain` on the `profiles` table
- Update proxy to resolve the domain and serve the correct portal

### 10. Activity Digest Email
- Weekly summary email to providers: new messages, files uploaded, payments received, documents completed
- Reduces need to log in daily to check for updates
- Can be a Supabase cron job (pg_cron) or a scheduled Edge Function

---

## Medium Impact, Low Effort

### 11. Archive/Delete Clients
- Add archive and delete functionality to the client detail page
- Archived clients should be hidden from the main list but recoverable
- Deleted clients should cascade-remove all related files, messages, docs, and payments

### 12. Search and Filter on Dashboard
- Dashboard "Recent Clients" section has no filtering
- Add status filter (In Progress, In Review, Completed, On Hold) to the clients list
- Add date range filter for activity timeline

### 13. File Preview
- Show image thumbnails inline instead of just file names
- Preview PDFs in a modal using the browser's built-in PDF viewer
- Detect file type from extension and show appropriate icon (image, PDF, spreadsheet, etc.)

### 14. Message Read Receipts
- Track when provider/client has seen a message
- Add `read_at` timestamp column to `messages` table
- Show a subtle "Seen" indicator under the last read message

### 15. Mobile App Prompt
- Add "Add to Home Screen" (PWA) support with a `manifest.json`
- Clients can install the portal as an app icon on their phone
- Minimal effort: just needs a web manifest and appropriate meta tags

---

## Medium Impact, Medium Effort

### 16. Multi-User Teams
- The database schema supports teams conceptually but the UI is single-user
- Add team member invites: email-based, with roles (admin, member, viewer)
- Team members can be assigned to specific clients
- Activity log should show which team member performed each action

### 17. Client Notes (Internal)
- Add a private notes section on the client detail page (not visible to clients)
- Simple rich-text or markdown editor
- Useful for tracking call notes, internal status, follow-ups

### 18. Branding Enhancements
- Logo upload (not just a color + initial)
- Custom portal welcome message per client
- Custom email templates with provider branding
- Favicon customization for the portal

### 19. Export/Reports
- Export client list as CSV
- Export all files for a client as a ZIP
- Generate a summary PDF of all activity, messages, and documents for a client
- Useful for end-of-engagement handoff

### 20. Audit Log
- The `activities` table currently tracks user-facing actions
- Add a more detailed admin-level audit log: login events, setting changes, team member actions
- Useful for Team plan compliance requirements

---

## Lower Priority / Future Vision

### 21. API Access
- REST API for Team plan users to integrate ClientDrop with their existing tools
- API keys managed in settings
- Endpoints for creating clients, uploading files, sending messages programmatically

### 22. Zapier/Make Integration
- Trigger: new client added, file uploaded, message received, payment completed
- Action: create client, send message, create payment link
- Massively expands the tool's utility without building native integrations

### 23. White-Label / Reseller Mode
- Allow agencies to resell ClientDrop under their own brand
- Remove all ClientDrop branding including the footer
- Custom billing through the reseller

### 24. Client Self-Service Portal Customization
- Let providers choose which tabs are visible per client (e.g., hide Payments for some clients)
- Custom tab ordering
- Add a "Resources" tab for static links/docs the provider wants to share

### 25. AI-Powered Features
- Smart document request templates based on industry (accountant, lawyer, consultant)
- Auto-categorize uploaded files
- Summarize message threads
- Suggested responses for common client questions

---

## Technical Debt

### 26. Replace `Record<string, ...>` Types
- `client-detail.tsx` and `portal-view.tsx` use loose `Record<string, string>` types
- Replace with proper typed interfaces from `src/types/database.ts`
- Prevents runtime errors and improves autocomplete

### 27. Error Handling
- Most Supabase operations silently fail (no error toasts or feedback)
- Add a toast notification system (e.g., `sonner` or `react-hot-toast`)
- Show success/error feedback for all mutations (upload, send, delete, etc.)

### 28. Loading States
- Page-level loading states are missing (server components just hang until data loads)
- Add `loading.tsx` files for `/dashboard`, `/dashboard/clients`, etc.
- Add skeleton loaders for cards and lists

### 29. Pagination
- All queries currently fetch everything (`select('*')`)
- Add cursor-based pagination for files, messages, activities
- Important once a client has 100+ messages or files

### 30. Testing
- No test framework is configured
- Add Vitest for unit tests on utility functions
- Add Playwright for E2E tests on critical flows: login, add client, upload file, send message
