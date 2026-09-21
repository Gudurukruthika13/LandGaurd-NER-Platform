import { Shield, Activity, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { communityNav } from '@/lib/communityNav';
import { StatCard, Card, PageHeader } from '@/components/ui';
import { RiskBadge } from '@/components/Badges';
import { useAuth } from '@/lib/auth';
import { supabase, type Alert, type RiskLocation } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui';

export default function CommunityHome() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [riskLocations, setRiskLocations] = useState<RiskLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [alertsRes, locRes] = await Promise.all([
        supabase.from('alerts').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(5),
        supabase.from('risk_locations').select('*').order('risk_score', { ascending: false }).limit(10),
      ]);
      setAlerts(alertsRes.data || []);
      setRiskLocations(locRes.data || []);
      setLoading(false);
    })();
  }, []);

  const criticalCount = riskLocations.filter((l) => l.risk_level === 'critical').length;
  const moderateCount = riskLocations.filter((l) => l.risk_level === 'moderate').length;
  const safeCount = riskLocations.filter((l) => l.risk_level === 'safe').length;
  const latestAlert = alerts[0];

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout navItems={communityNav} title="Home" roleLabel="Community / Traveler">
      <PageHeader
        title={`Welcome, ${profile?.name || 'Traveler'}`}
        description="Current landslide risk overview for your area"
      />

      {/* Risk cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Risk"
          value={criticalCount > 0 ? 'Critical' : moderateCount > 0 ? 'Moderate' : 'Safe'}
          icon={<Shield className="h-6 w-6" />}
          color={criticalCount > 0 ? 'red' : moderateCount > 0 ? 'amber' : 'emerald'}
          subtitle={`${criticalCount + moderateCount} active zones nearby`}
        />
        <StatCard
          title="Nearby Risk Zones"
          value={riskLocations.length}
          icon={<MapPin className="h-6 w-6" />}
          color="blue"
          subtitle={`${criticalCount} critical, ${moderateCount} moderate`}
        />
        <StatCard
          title="Latest Warning"
          value={latestAlert ? latestAlert.risk_level.toUpperCase() : 'None'}
          icon={<Activity className="h-6 w-6" />}
          color={latestAlert?.risk_level === 'critical' ? 'red' : latestAlert ? 'amber' : 'emerald'}
          subtitle={latestAlert ? latestAlert.estimated_risk_window : 'No active warnings'}
        />
        <StatCard
          title="Estimated Risk Window"
          value={latestAlert ? latestAlert.estimated_risk_window : 'Clear'}
          icon={<Clock className="h-6 w-6" />}
          color="teal"
          subtitle={latestAlert ? 'Monitor conditions' : 'No risk window'}
        />
      </div>

      {/* Latest alerts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-base font-bold text-slate-800">Active Alerts Near You</h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-400">No active alerts in your area.</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <RiskBadge level={alert.risk_level} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{alert.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{alert.estimated_risk_window}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/community/nearby-alerts')}
            className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View all alerts →
          </button>
        </Card>

        <Card>
          <h3 className="mb-4 text-base font-bold text-slate-800">Risk Zone Summary</h3>
          <div className="space-y-3">
            <RiskBar label="Critical Zones" count={criticalCount} total={riskLocations.length} color="bg-red-500" />
            <RiskBar label="Moderate Zones" count={moderateCount} total={riskLocations.length} color="bg-amber-500" />
            <RiskBar label="Safe Zones" count={safeCount} total={riskLocations.length} color="bg-emerald-500" />
          </div>
          <button
            onClick={() => navigate('/community/risk-map')}
            className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View risk map →
          </button>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <QuickAction label="Report Hazard" onClick={() => navigate('/community/report-hazard')} icon={<Activity className="h-5 w-5" />} />
        <QuickAction label="Safe Route" onClick={() => navigate('/community/safe-route')} icon={<MapPin className="h-5 w-5" />} />
        <QuickAction label="My Reports" onClick={() => navigate('/community/my-reports')} icon={<Shield className="h-5 w-5" />} />
        <QuickAction label="Emergency" onClick={() => navigate('/community/emergency')} icon={<Clock className="h-5 w-5" />} />
      </div>
    </DashboardLayout>
  );
}

function RiskBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className="text-sm font-bold text-slate-800">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ label, onClick, icon }: { label: string; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">{icon}</div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </button>
  );
}
