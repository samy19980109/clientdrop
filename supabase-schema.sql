-- ClientDrop Database Schema
-- Run this in your Supabase SQL editor

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  business_name text not null default '',
  logo_url text,
  primary_color text not null default '#2563eb',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Clients
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text not null,
  company text,
  status text not null default 'active' check (status in ('active', 'archived')),
  project_status text not null default 'Not Started',
  portal_token text unique default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Providers can manage their own clients"
  on public.clients for all
  using (auth.uid() = provider_id);

-- Allow portal access via token (for client-facing portal)
create policy "Clients can view their own record via token"
  on public.clients for select
  using (true);

-- Shared Files
create table public.shared_files (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  uploaded_by text not null check (uploaded_by in ('provider', 'client')),
  file_name text not null,
  file_url text not null,
  file_size bigint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.shared_files enable row level security;

create policy "Providers can manage files for their clients"
  on public.shared_files for all
  using (
    exists (
      select 1 from public.clients
      where clients.id = shared_files.client_id
      and clients.provider_id = auth.uid()
    )
  );

create policy "Anyone can view files (portal access)"
  on public.shared_files for select
  using (true);

create policy "Anyone can insert files (portal upload)"
  on public.shared_files for insert
  with check (true);

-- Messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  sender text not null check (sender in ('provider', 'client')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Providers can manage messages for their clients"
  on public.messages for all
  using (
    exists (
      select 1 from public.clients
      where clients.id = messages.client_id
      and clients.provider_id = auth.uid()
    )
  );

create policy "Anyone can view messages (portal access)"
  on public.messages for select
  using (true);

create policy "Anyone can insert messages (portal access)"
  on public.messages for insert
  with check (true);

-- Document Requests
create table public.document_requests (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  title text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.document_requests enable row level security;

create policy "Providers can manage doc requests for their clients"
  on public.document_requests for all
  using (
    exists (
      select 1 from public.clients
      where clients.id = document_requests.client_id
      and clients.provider_id = auth.uid()
    )
  );

create policy "Anyone can view doc requests (portal access)"
  on public.document_requests for select
  using (true);

create policy "Anyone can update doc requests (portal upload)"
  on public.document_requests for update
  using (true);

-- Intake Forms (templates created by providers)
create table public.intake_forms (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.intake_forms enable row level security;

create policy "Providers can manage their own forms"
  on public.intake_forms for all
  using (auth.uid() = provider_id);

create policy "Anyone can view forms (portal access)"
  on public.intake_forms for select
  using (true);

-- Intake Responses
create table public.intake_responses (
  id uuid default gen_random_uuid() primary key,
  form_id uuid references public.intake_forms(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  responses jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.intake_responses enable row level security;

create policy "Providers can view responses for their forms"
  on public.intake_responses for select
  using (
    exists (
      select 1 from public.intake_forms
      where intake_forms.id = intake_responses.form_id
      and intake_forms.provider_id = auth.uid()
    )
  );

create policy "Anyone can insert responses (portal access)"
  on public.intake_responses for insert
  with check (true);

-- Payment Links
create table public.payment_links (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  amount integer not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  stripe_url text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.payment_links enable row level security;

create policy "Providers can manage payment links for their clients"
  on public.payment_links for all
  using (
    exists (
      select 1 from public.clients
      where clients.id = payment_links.client_id
      and clients.provider_id = auth.uid()
    )
  );

create policy "Anyone can view payment links (portal access)"
  on public.payment_links for select
  using (true);

-- Activity Log
create table public.activities (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  actor text not null check (actor in ('provider', 'client', 'system')),
  action text not null,
  details text,
  created_at timestamptz not null default now()
);

alter table public.activities enable row level security;

create policy "Providers can view activities for their clients"
  on public.activities for select
  using (
    exists (
      select 1 from public.clients
      where clients.id = activities.client_id
      and clients.provider_id = auth.uid()
    )
  );

create policy "Anyone can view activities (portal access)"
  on public.activities for select
  using (true);

create policy "Anyone can insert activities"
  on public.activities for insert
  with check (true);

-- Create storage bucket for file uploads
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', true);

create policy "Anyone can upload files"
  on storage.objects for insert
  with check (bucket_id = 'client-files');

create policy "Anyone can view files"
  on storage.objects for select
  using (bucket_id = 'client-files');

-- Indexes for performance
create index idx_clients_provider on public.clients(provider_id);
create index idx_shared_files_client on public.shared_files(client_id);
create index idx_messages_client on public.messages(client_id);
create index idx_document_requests_client on public.document_requests(client_id);
create index idx_activities_client on public.activities(client_id);
create index idx_payment_links_client on public.payment_links(client_id);
create index idx_clients_portal_token on public.clients(portal_token);
