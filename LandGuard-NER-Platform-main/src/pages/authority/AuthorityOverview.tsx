import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authorityNav } from '@/lib/authorityNav';
import { StatCard, Card, PageHeader, LoadingSpinner } from '@/components/ui';
import { RiskBadge, StatusBadge, PriorityBadge } from '@/components/Badges';
import { supabase, type RiskLocation, type Alert, type HazardReport } from '@/lib/supabase';
import { ShieldCheck, AlertTriangle, Bell, FileWarning, MapPin, Activity, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function AuthorityOverview() {
  const { profile } = useAuth();
  const [locations, setLocations] = useState<RiskLocation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [locRes, alertRes, reportRes] = await Promise.all([
        supabase.from('risk_locations').select('*'),
        supabase.from('alerts').select('*').eq('status', 'active').order('created_at', { ascending: false }),
        supabase.from('hazard_reports').select('*').order('created_at', { ascending: false }),
      ]);
      setLocations(locRes.data || []);
      setAlerts(alertRes.data || []);
      setReports(reportRes.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const safeCount = locations.filter((l) => l.risk_level === 'safe').length;
  const moderateCount = locations.filter((l) => l.risk_level === 'moderate').length;
  const criticalCount = locations.filter((l) => l.risk_level === 'critical').length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;

  return (
    <DashboardLayout navItems={authorityNav} title="Overview" roleLabel="Disaster Management Authority">
      <PageHeader
        title={`NER Risk Overview — Welcome, ${profile?.name || 'Authority'}`}
        description="Real-time landslide risk monitoring across the North Eastern Region"
      />

      {/* Top stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Safe Zones" value={safeCount} icon={<ShieldCheck className="h-6 w-6" />} color="emerald" />
        <StatCard title="Moderate Zones" value={moderateCount} icon={<AlertTriangle className="h-6 w-6" />} color="amber" />
        <StatCard title="Critical Zones" value={criticalCount} icon={<AlertTriangle className="h-6 w-6" />} color="red" />
        <StatCard title="Active Alerts" value={alerts.length} icon={<Bell className="h-6 w-6" />} color="blue" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Pending Citizen Reports" value={pendingReports} icon={<FileWarning className="h-6 w-6" />} color="amber" />
        <StatCard title="Total Reports" value={reports.length} icon={<FileWarning className="h-6 w-6" />} color="slate" />
        <StatCard title="Total Risk Zones" value={locations.length} icon={<MapPin className="h-6 w-6" />} color="teal" />
        <StatCard title="Avg Risk Score" value={locations.length > 0 ? Math.round(locations.reduce((a, l) => a + l.risk_score, 0) / locations.length) : 0} icon={<TrendingUp className="h-6 w-6" />} color="indigo" />
      </div>

      {/* Recent alerts + reports */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
            <Activity className="h-5 w-5 text-red-600" /> Recent Alerts
          </h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-400">No active alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <RiskBadge level={alert.risk_level} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{alert.message}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" /> {alert.estimated_risk_window} · {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
            <FileWarning className="h-5 w-5 text-amber-600" /> Recent Citizen Reports
          </h3>
          {reports.length === 0 ? (
            <p className="text-sm text-slate-400">No citizen reports</p>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600">
                        {report.report_id || 'Pending'}
                      </span>
                      <StatusBadge status={report.status} />
                      <PriorityBadge priority={report.priority} />
                    </div>
                    <p className="text-sm text-slate-700">{report.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(report.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Risk distribution chart */}
      <Card className="mt-6">
        <h3 className="mb-4 text-base font-bold text-slate-800">Risk Level Distribution</h3>
        <div className="flex h-8 overflow-hidden rounded-lg">
          {safeCount > 0 && <div className="flex items-center justify-center bg-emerald-500 text-xs font-semibold text-white" style={{ width: `${(safeCount / locations.length) * 100}%` }}>{safeCount}</div>}
          {moderateCount > 0 && <div className="flex items-center justify-center bg-amber-500 text-xs font-semibold text-white" style={{ width: `${(moderateCount / locations.length) * 100}%` }}>{moderateCount}</div>}
          {criticalCount > 0 && <div className="flex items-center justify-center bg-red-500 text-xs font-semibold text-white" style={{ width: `${(criticalCount / locations.length) * 100}%` }}>{criticalCount}</div>}
        </div>
        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Safe</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Moderate</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical</span>
        </div>
      </Card>
    </DashboardLayout>
  );
}
