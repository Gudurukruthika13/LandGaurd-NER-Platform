import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authorityNav } from '@/lib/authorityNav';
import { PageHeader, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { RiskBadge } from '@/components/Badges';
import { supabase, type Alert } from '@/lib/supabase';
import { Bell, Clock } from 'lucide-react';

export default function AuthorityActiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('alerts').select('*, risk_locations(*)').order('created_at', { ascending: false });
      setAlerts(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const active = alerts.filter((a) => a.status === 'active');

  return (
    <DashboardLayout navItems={authorityNav} title="Active Alerts" roleLabel="Disaster Management Authority">
      <PageHeader title="Active Alerts" description="All landslide alerts across NER" />

      <div className="mb-4 grid grid-cols-3 gap-4">
        <Card><div className="text-center"><p className="text-2xl font-bold text-red-600">{active.filter(a => a.risk_level === 'critical').length}</p><p className="text-xs text-slate-500">Critical Alerts</p></div></Card>
        <Card><div className="text-center"><p className="text-2xl font-bold text-amber-600">{active.filter(a => a.risk_level === 'moderate').length}</p><p className="text-xs text-slate-500">Moderate Alerts</p></div></Card>
        <Card><div className="text-center"><p className="text-2xl font-bold text-slate-600">{alerts.length}</p><p className="text-xs text-slate-500">Total Alerts</p></div></Card>
      </div>

      {alerts.length === 0 ? (
        <Card><EmptyState icon={<Bell className="h-8 w-8" />} title="No alerts" description="No alerts have been issued." /></Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const loc = alert.risk_locations;
            return (
              <Card key={alert.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <RiskBadge level={alert.risk_level} />
                      {loc && <span className="text-sm font-semibold text-slate-700">{loc.label}</span>}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${alert.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{alert.message}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {alert.estimated_risk_window}</span>
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
