import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ClientDetail } from '@/components/dashboard/client-detail';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('provider_id', user!.id)
    .single();

  if (!client) {
    notFound();
  }

  // Fetch all client data in parallel
  const [filesRes, messagesRes, docRequestsRes, paymentLinksRes, activitiesRes] =
    await Promise.all([
      supabase
        .from('shared_files')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('messages')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('document_requests')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('payment_links')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('activities')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/${client.portal_token}`;

  return (
    <ClientDetail
      client={client}
      files={filesRes.data || []}
      messages={messagesRes.data || []}
      documentRequests={docRequestsRes.data || []}
      paymentLinks={paymentLinksRes.data || []}
      activities={activitiesRes.data || []}
      portalUrl={portalUrl}
    />
  );
}
