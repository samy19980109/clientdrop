import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PortalView } from '@/components/portal/portal-view';

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createServerSupabase();

  // Look up client by portal token
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('portal_token', token)
    .single();

  if (!client) {
    notFound();
  }

  // Get provider branding
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', client.provider_id)
    .single();

  // Fetch all portal data in parallel
  const [filesRes, messagesRes, docRequestsRes, paymentLinksRes] = await Promise.all([
    supabase
      .from('shared_files')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('messages')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('document_requests')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('payment_links')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }),
  ]);

  return (
    <PortalView
      client={client}
      profile={profile}
      files={filesRes.data || []}
      messages={messagesRes.data || []}
      documentRequests={docRequestsRes.data || []}
      paymentLinks={paymentLinksRes.data || []}
      token={token}
    />
  );
}
