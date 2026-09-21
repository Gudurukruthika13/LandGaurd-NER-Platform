import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { communityNav } from '@/lib/communityNav';
import { PageHeader, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { RiskBadge } from '@/components/Badges';
import { supabase, type Alert } from '@/lib/supabase';
import { Bell, Clock } from 'lucide-react';

export default function CommunityNearbyAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*, risk_locations(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      setAlerts(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout navItems={communityNav} title="Nearby Alerts" roleLabel="Community / Traveler">
      <PageHeader title="Nearby Alerts" description="Active landslide warnings in your region" />
      {alerts.length === 0 ? (
        <Card><EmptyState icon={<Bell className="h-8 w-8" />} title="No active alerts" description="There are no active landslide alerts in your area right now." /></Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const loc = alert.risk_locations;
            return (
              <Card key={alert.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <RiskBadge level={alert.risk_level} />
                      {loc && <span className="text-sm font-medium text-slate-600">{loc.label}</span>}
                    </div>
                    <p className="text-sm text-slate-700">{alert.message}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {alert.estimated_risk_window}</span>
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
