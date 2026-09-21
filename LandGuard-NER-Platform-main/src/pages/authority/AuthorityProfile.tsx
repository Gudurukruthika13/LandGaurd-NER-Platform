import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authorityNav } from '@/lib/authorityNav';
import { PageHeader, Card } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, Calendar, Save, CheckCircle, Shield } from 'lucide-react';

export default function AuthorityProfile() {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await supabase.from('profiles').update({ name, phone }).eq('id', profile?.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout navItems={authorityNav} title="Profile" roleLabel="Disaster Management Authority">
      <PageHeader title="Authority Profile" description="Manage your authority account" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-2xl font-bold text-white">
              {profile?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <p className="mt-3 text-lg font-bold text-slate-800">{profile?.name || 'Authority'}</p>
            <p className="text-sm text-slate-500">{profile?.email}</p>
            <span className="mt-2 flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <Shield className="h-3 w-3" /> Disaster Management Authority
            </span>
            <div className="mt-4 w-full space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="h-4 w-4" /> {profile?.email || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="h-4 w-4" /> {profile?.phone || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" /> Joined {new Date(profile?.created_at || '').toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-base font-bold text-slate-800">Edit Profile</h3>
          {saved && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle className="h-4 w-4" /> Profile updated successfully!
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-400"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
