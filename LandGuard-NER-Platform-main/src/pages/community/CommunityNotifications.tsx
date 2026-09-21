import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { communityNav } from '@/lib/communityNav';
import { PageHeader, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { RiskBadge } from '@/components/Badges';
import { supabase, type Alert } from '@/lib/supabase';
import { Bell, Clock } from 'lucide-react';

export default function CommunityNotifications() {
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

  return (
    <DashboardLayout navItems={communityNav} title="Notifications" roleLabel="Community / Traveler">
      <PageHeader title="Notifications" description="All landslide alerts and system notifications" />
      {alerts.length === 0 ? (
        <Card><EmptyState icon={<Bell className="h-8 w-8" />} title="No notifications" description="You have no notifications at this time." /></Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const loc = alert.risk_locations;
            const isRead = alert.status !== 'active';
            return (
              <Card key={alert.id} className={isRead ? 'opacity-60' : ''}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${alert.risk_level === 'critical' ? 'bg-red-100' : alert.risk_level === 'moderate' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                    <Bell className={`h-5 w-5 ${alert.risk_level === 'critical' ? 'text-red-600' : alert.risk_level === 'moderate' ? 'text-amber-600' : 'text-emerald-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <RiskBadge level={alert.risk_level} size="sm" />
                      {loc && <span className="text-sm font-medium text-slate-600">{loc.label}</span>}
                      {!isRead && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                    </div>
                    <p className="text-sm text-slate-700">{alert.message}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" /> {alert.estimated_risk_window} · {new Date(alert.created_at).toLocaleString()}
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
