'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Users, Search, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { Client } from '@/types/database';

interface ClientsListProps {
  clients: Client[];
}

export function ClientsList({ clients: initialClients }: ClientsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const router = useRouter();

  const filteredClients = initialClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const activeClients = filteredClients.filter((c) => c.status === 'active');
  const archivedClients = filteredClients.filter((c) => c.status === 'archived');

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('clients').insert({
      provider_id: user!.id,
      name,
      email,
      company: company || null,
    });

    if (!error) {
      setName('');
      setEmail('');
      setCompany('');
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted mt-1">
            {initialClients.length} client{initialClients.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add client
        </Button>
      </div>

      {/* Add Client Form */}
      {showForm && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">New Client</h2>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-foreground cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                id="name"
                label="Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="company"
                label="Company (optional)"
                placeholder="Acme Inc"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={loading}>
                Add client
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      {initialClients.length > 0 && (
        <div className="mb-6 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      )}

      {/* Client List */}
      {initialClients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No clients yet"
            description="Add your first client to get started. They'll get their own branded portal."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add your first client
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {activeClients.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted mb-3">
                Active ({activeClients.length})
              </h2>
              <div className="grid gap-2">
                {activeClients.map((client) => (
                  <ClientRow key={client.id} client={client} />
                ))}
              </div>
            </div>
          )}

          {archivedClients.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted mb-3">
                Archived ({archivedClients.length})
              </h2>
              <div className="grid gap-2 opacity-60">
                {archivedClients.map((client) => (
                  <ClientRow key={client.id} client={client} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClientRow({ client }: { client: Client }) {
  return (
    <Link href={`/dashboard/clients/${client.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-4">
          <Avatar name={client.name} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground">{client.name}</div>
            <div className="text-sm text-muted truncate">
              {client.company ? `${client.company} · ` : ''}
              {client.email}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Badge
              variant={
                client.project_status === 'Completed'
                  ? 'success'
                  : client.project_status === 'In Progress'
                  ? 'info'
                  : client.project_status === 'In Review'
                  ? 'warning'
                  : 'default'
              }
            >
              {client.project_status}
            </Badge>
            <span className="text-xs text-muted">{formatDate(client.created_at)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
