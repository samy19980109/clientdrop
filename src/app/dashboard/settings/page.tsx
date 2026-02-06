import { createServerSupabase } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/dashboard/settings-form';

export default async function SettingsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  return (
    <SettingsForm
      profile={{
        business_name: profile?.business_name || '',
        primary_color: profile?.primary_color || '#2563eb',
        logo_url: profile?.logo_url || null,
      }}
    />
  );
}
