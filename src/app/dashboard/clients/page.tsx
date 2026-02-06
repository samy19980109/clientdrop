import { createServerSupabase } from '@/lib/supabase/server';
import { ClientsList } from '@/components/dashboard/clients-list';

export default async function ClientsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('provider_id', user!.id)
    .order('created_at', { ascending: false });

  return <ClientsList clients={clients || []} />;
}
