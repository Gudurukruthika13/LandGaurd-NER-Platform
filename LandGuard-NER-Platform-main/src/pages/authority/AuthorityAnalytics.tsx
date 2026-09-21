import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authorityNav } from '@/lib/authorityNav';
import { PageHeader, Card, LoadingSpinner } from '@/components/ui';
import {
  supabase,
  type RiskLocation,
  type HazardReport,
  type Alert,
  type Road,
  type HazardType,
  HAZARD_TYPE_LABELS,
} from '@/lib/supabase';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

export default function AuthorityAnalytics() {
  const [locations, setLocations] = useState<RiskLocation[]>([]);
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [locRes, reportRes, alertRes, roadRes] = await Promise.all([
        supabase.from('risk_locations').select('*'),
        supabase.from('hazard_reports').select('*'),
        supabase.from('alerts').select('*'),
        supabase.from('roads').select('*'),
      ]);
      setLocations(locRes.data || []);
      setReports(reportRes.data || []);
      setAlerts(alertRes.data || []);
      setRoads(roadRes.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Compute analytics
  const riskDistribution = {
    safe: locations.filter((l) => l.risk_level === 'safe').length,
    moderate: locations.filter((l) => l.risk_level === 'moderate').length,
    critical: locations.filter((l) => l.risk_level === 'critical').length,
  };

  const statusDistribution = {
    pending: reports.filter((r) => r.status === 'pending').length,
    under_verification: reports.filter((r) => r.status === 'under_verification').length,
    verified: reports.filter((r) => r.status === 'verified').length,
    rejected: reports.filter((r) => r.status === 'rejected').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  };

  const hazardTypeCount: Record<string, number> = {};
  reports.forEach((r) => {
    hazardTypeCount[r.hazard_type] = (hazardTypeCount[r.hazard_type] || 0) + 1;
  });

  const roadStatusDist = {
    open: roads.filter((r) => r.road_status === 'open').length,
    restricted: roads.filter((r) => r.road_status === 'restricted').length,
    blocked: roads.filter((r) => r.road_status === 'blocked').length,
  };

  const avgRiskScore = locations.length > 0
    ? Math.round(locations.reduce((a, l) => a + l.risk_score, 0) / locations.length)
    : 0;

  const maxBarHeight = 160;

  return (
    <DashboardLayout navItems={authorityNav} title="Analytics" roleLabel="Disaster Management Authority">
      <PageHeader title="Analytics" description="Comprehensive analytics across risk zones, reports, alerts, and roads" />

      {/* Top stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{locations.length}</p><p className="text-xs text-slate-500">Risk Zones</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Activity className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{reports.length}</p><p className="text-xs text-slate-500">Citizen Reports</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{alerts.length}</p><p className="text-xs text-slate-500">Total Alerts</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><PieChart className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{avgRiskScore}</p><p className="text-xs text-slate-500">Avg Risk Score</p></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Risk Level Distribution */}
        <Card>
          <h3 className="mb-4 text-base font-bold text-slate-800">Risk Level Distribution</h3>
          <div className="flex items-end justify-around gap-4" style={{ height: maxBarHeight + 60 }}>
            <Bar label="Safe" value={riskDistribution.safe} total={locations.length} color="bg-emerald-500" max={locations.length} height={maxBarHeight} />
            <Bar label="Moderate" value={riskDistribution.moderate} total={locations.length} color="bg-amber-500" max={locations.length} height={maxBarHeight} />
            <Bar label="Critical" value={riskDistribution.critical} total={locations.length} color="bg-red-500" max={locations.length} height={maxBarHeight} />
          </div>
        </Card>

        {/* Report Status Distribution */}
        <Card>
          <h3 className="mb-4 text-base font-bold text-slate-800">Report Status Distribution</h3>
          {reports.length === 0 ? (
            <p className="text-sm text-slate-400">No reports to analyze</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600 capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-slate-800">{count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-500 transition-all" style={{ width: `${reports.length > 0 ? (count / reports.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Hazard Type Breakdown */}
        <Card>
          <h3 className="mb-4 text-base font-bold text-slate-800">Hazard Types Reported</h3>
          {Object.keys(hazardTypeCount).length === 0 ? (
            <p className="text-sm text-slate-400">No hazard reports yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(hazardTypeCount)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-600">{HAZARD_TYPE_LABELS[type as HazardType] || type}</span>
                      <span className="font-bold text-slate-800">{count}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(count / reports.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* Road Status */}
        <Card>
          <h3 className="mb-4 text-base font-bold text-slate-800">Road Status Overview</h3>
          <div className="flex items-end justify-around gap-4" style={{ height: maxBarHeight + 60 }}>
            <Bar label="Open" value={roadStatusDist.open} total={roads.length} color="bg-emerald-500" max={roads.length} height={maxBarHeight} />
            <Bar label="Restricted" value={roadStatusDist.restricted} total={roads.length} color="bg-amber-500" max={roads.length} height={maxBarHeight} />
            <Bar label="Blocked" value={roadStatusDist.blocked} total={roads.length} color="bg-red-500" max={roads.length} height={maxBarHeight} />
          </div>
        </Card>
      </div>

      {/* Risk score table */}
      <Card className="mt-4">
        <h3 className="mb-4 text-base font-bold text-slate-800">Top Risk Zones by Score</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
                <th className="pb-2 pr-4">Location</th>
                <th className="pb-2 pr-4">Risk Score</th>
                <th className="pb-2 pr-4">Rainfall (mm)</th>
                <th className="pb-2 pr-4">Slope (°)</th>
                <th className="pb-2 pr-4">Elevation (m)</th>
                <th className="pb-2 pr-4">Level</th>
              </tr>
            </thead>
            <tbody>
              {locations.slice(0, 10).map((loc) => (
                <tr key={loc.id} className="border-b border-slate-50">
                  <td className="py-2.5 pr-4 font-medium text-slate-800">{loc.label}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${loc.risk_score > 70 ? 'bg-red-500' : loc.risk_score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${loc.risk_score}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{loc.risk_score}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-slate-600">{loc.rainfall}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{loc.slope}</td>
                  <td className="py-2.5 pr-4 text-slate-600">{loc.elevation}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      loc.risk_level === 'critical' ? 'bg-red-100 text-red-700' :
                      loc.risk_level === 'moderate' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {loc.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

function Bar({ label, value, total, color, max, height }: { label: string; value: number; total: number; color: string; max: number; height: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-lg font-bold text-slate-800">{value}</span>
      <div className="flex w-16 items-end rounded-t-lg bg-slate-100" style={{ height }}>
        <div className={`w-full rounded-t-lg ${color} transition-all`} style={{ height: `${pct}%`, minHeight: value > 0 ? '4px' : '0' }} />
      </div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}
