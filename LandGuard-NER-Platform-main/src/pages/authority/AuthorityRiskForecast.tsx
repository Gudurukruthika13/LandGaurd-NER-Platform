import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authorityNav } from '@/lib/authorityNav';
import { PageHeader, Card, LoadingSpinner } from '@/components/ui';
import { RiskBadge } from '@/components/Badges';
import { supabase, type RiskLocation } from '@/lib/supabase';
import { TrendingUp, Cloud, Mountain, AlertTriangle } from 'lucide-react';

interface ForecastEntry {
  label: string;
  currentLevel: string;
  forecastLevel: string;
  trend: 'up' | 'stable' | 'down';
  rainfallTrend: string;
  confidence: number;
  reasoning: string;
}

export default function AuthorityRiskForecast() {
  const [locations, setLocations] = useState<RiskLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('risk_locations').select('*').order('risk_score', { ascending: false });
      setLocations(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Generate mock forecast data based on current conditions
  const forecasts: ForecastEntry[] = locations.slice(0, 10).map((loc) => {
    const willEscalate = loc.rainfall > 200 && loc.slope > 25;
    const willImprove = loc.rainfall < 150 && loc.historical_landslide === false;

    const forecastLevel = willEscalate
      ? loc.risk_level === 'moderate' ? 'critical' : 'critical'
      : willImprove && loc.risk_level === 'moderate' ? 'safe' : loc.risk_level;

    const trend: 'up' | 'stable' | 'down' = willEscalate ? 'up' : willImprove ? 'down' : 'stable';

    const reasoning: string[] = [];
    if (loc.rainfall > 200) reasoning.push(`High rainfall (${loc.rainfall}mm) expected to continue`);
    if (loc.slope > 30) reasoning.push(`Steep slope angle (${loc.slope}°) increases instability`);
    if (loc.historical_landslide) reasoning.push('Historical landslide activity in this zone');
    if (loc.vegetation === 'sparse') reasoning.push('Sparse vegetation reduces slope stability');
    if (loc.susceptibility === 'very_high') reasoning.push('Very high susceptibility rating');
    if (reasoning.length === 0) reasoning.push('Conditions stable, no significant escalation factors');

    return {
      label: loc.label,
      currentLevel: loc.risk_level,
      forecastLevel,
      trend,
      rainfallTrend: loc.rainfall > 200 ? 'Increasing' : loc.rainfall > 150 ? 'Steady' : 'Decreasing',
      confidence: Math.round(60 + Math.random() * 30),
      reasoning: reasoning.join('. '),
    };
  });

  return (
    <DashboardLayout navItems={authorityNav} title="Risk Forecast" roleLabel="Disaster Management Authority">
      <PageHeader
        title="Risk Forecast"
        description="Predictive risk assessment based on current terrain and rainfall conditions (mock data)"
      />

      {/* Disclaimer */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Prototype Forecast</p>
          <p className="text-xs text-amber-700">
            These forecasts use sample/mock risk values. A real Python ML model will replace this placeholder calculation in the production version.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600"><TrendingUp className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{forecasts.filter(f => f.trend === 'up').length}</p><p className="text-xs text-slate-500">Escalating</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600"><Mountain className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{forecasts.filter(f => f.trend === 'stable').length}</p><p className="text-xs text-slate-500">Stable</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><TrendingUp className="h-5 w-5 rotate-180" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{forecasts.filter(f => f.trend === 'down').length}</p><p className="text-xs text-slate-500">Improving</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Cloud className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{forecasts.filter(f => f.rainfallTrend === 'Increasing').length}</p><p className="text-xs text-slate-500">Rain ↑</p></div>
          </div>
        </Card>
      </div>

      {/* Forecast table */}
      <Card>
        <h3 className="mb-4 text-base font-bold text-slate-800">72-Hour Forecast by Location</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
                <th className="pb-2 pr-4">Location</th>
                <th className="pb-2 pr-4">Current</th>
                <th className="pb-2 pr-4">Forecast</th>
                <th className="pb-2 pr-4">Trend</th>
                <th className="pb-2 pr-4">Rainfall</th>
                <th className="pb-2 pr-4">Confidence</th>
                <th className="pb-2">Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((f, i) => (
                <tr key={i} className="border-b border-slate-50 align-top">
                  <td className="py-3 pr-4 font-medium text-slate-800">{f.label}</td>
                  <td className="py-3 pr-4"><RiskBadge level={f.currentLevel as any} size="sm" /></td>
                  <td className="py-3 pr-4"><RiskBadge level={f.forecastLevel as any} size="sm" /></td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      f.trend === 'up' ? 'text-red-600' : f.trend === 'down' ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {f.trend === 'up' ? '↑ Escalating' : f.trend === 'down' ? '↓ Improving' : '→ Stable'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600">{f.rainfallTrend}</td>
                  <td className="py-3 pr-4 text-xs text-slate-600">{f.confidence}%</td>
                  <td className="py-3 text-xs text-slate-500">{f.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
