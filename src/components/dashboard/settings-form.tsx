'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';

interface SettingsFormProps {
  profile: {
    business_name: string;
    primary_color: string;
    logo_url: string | null;
  };
}

const COLOR_PRESETS = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Slate', value: '#475569' },
];

export function SettingsForm({ profile }: SettingsFormProps) {
  const [businessName, setBusinessName] = useState(profile.business_name);
  const [primaryColor, setPrimaryColor] = useState(profile.primary_color);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from('profiles')
      .update({
        business_name: businessName,
        primary_color: primaryColor,
      })
      .eq('id', user!.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
      <p className="text-muted mb-8">Customize how your portal looks to clients.</p>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <Card>
          <CardTitle>Branding</CardTitle>
          <CardDescription>This is what your clients will see on their portal.</CardDescription>

          <div className="mt-6 space-y-6">
            <Input
              id="business-name"
              label="Business Name"
              placeholder="Acme Consulting"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Brand Color
              </label>
              <div className="flex flex-wrap gap-3">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setPrimaryColor(color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
                      primaryColor === color.value
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
                <label className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground transition-colors">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-xs text-muted">+</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Portal Preview
              </label>
              <div className="rounded-xl border border-border overflow-hidden">
                <div
                  className="px-6 py-4 flex items-center gap-3"
                  style={{ backgroundColor: primaryColor + '10' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="font-semibold text-foreground">
                    {businessName || 'Your Business'}
                  </span>
                </div>
                <div className="px-6 py-4 text-sm text-muted">
                  This is how the header of your client portal will look.
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>
            {saved ? 'Saved!' : 'Save changes'}
          </Button>
          {saved && <span className="text-sm text-success">Changes saved successfully.</span>}
        </div>
      </form>
    </div>
  );
}
