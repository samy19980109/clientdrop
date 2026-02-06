import { createServerSupabase } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Users, FileText, MessageSquare, CreditCard, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all data in parallel
  const [clientsRes, filesRes, messagesRes, paymentsRes, activitiesRes] =
    await Promise.all([
      supabase
        .from('clients')
        .select('*')
        .eq('provider_id', user!.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase
        .from('shared_files')
        .select('*, clients!inner(provider_id)')
        .eq('clients.provider_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('messages')
        .select('*, clients!inner(provider_id, name)')
        .eq('clients.provider_id', user!.id)
        .eq('sender', 'client')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('payment_links')
        .select('*, clients!inner(provider_id)')
        .eq('clients.provider_id', user!.id)
        .eq('status', 'pending'),
      supabase
        .from('activities')
        .select('*, clients!inner(provider_id, name)')
        .eq('clients.provider_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

  const clients = clientsRes.data || [];
  const recentFiles = filesRes.data || [];
  const recentMessages = messagesRes.data || [];
  const pendingPayments = paymentsRes.data || [];
  const activities = activitiesRes.data || [];

  const totalPending = pendingPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  if (clients.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted mb-8">Welcome to ClientDrop! Let&apos;s get you set up.</p>

        <Card className="max-w-lg">
          <EmptyState
            icon={Users}
            title="Add your first client"
            description="Start by adding a client. They'll get their own branded portal where you can share files, messages, and more."
            action={
              <Link href="/dashboard/clients">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add a client
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted mt-1">Here&apos;s what&apos;s happening with your clients.</p>
        </div>
        <Link href="/dashboard/clients">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add client
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Active Clients"
          value={clients.length.toString()}
        />
        <StatCard
          icon={FileText}
          label="Files Shared"
          value={recentFiles.length.toString()}
        />
        <StatCard
          icon={MessageSquare}
          label="Unread Messages"
          value={recentMessages.length.toString()}
        />
        <StatCard
          icon={CreditCard}
          label="Pending Payments"
          value={`$${(totalPending / 100).toFixed(0)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Clients</h2>
            <Link href="/dashboard/clients" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {clients.slice(0, 5).map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-3"
              >
                <Avatar name={client.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">
                    {client.name}
                  </div>
                  <div className="text-xs text-muted truncate">
                    {client.company || client.email}
                  </div>
                </div>
                <Badge
                  variant={
                    client.project_status === 'Completed'
                      ? 'success'
                      : client.project_status === 'In Progress'
                      ? 'info'
                      : 'default'
                  }
                >
                  {client.project_status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h2 className="font-semibold text-foreground mb-4">Recent Activity</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 8).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-accent rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-foreground">{activity.action}</span>
                    {activity.details && (
                      <span className="text-muted"> — {activity.details}</span>
                    )}
                    <div className="text-xs text-muted mt-0.5">
                      {formatDate(activity.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted">{label}</div>
        </div>
      </div>
    </Card>
  );
}
