import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authorityNav } from '@/lib/authorityNav';
import { PageHeader, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { RiskBadge } from '@/components/Badges';
import { supabase, type RiskLocation } from '@/lib/supabase';
import { AlertOctagon } from 'lucide-react';

export default function AuthorityCriticalZones() {
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

  const critical = locations.filter((l) => l.risk_level === 'critical');
  const moderate = locations.filter((l) => l.risk_level === 'moderate');

  return (
    <DashboardLayout navItems={authorityNav} title="Critical Zones" roleLabel="Disaster Management Authority">
      <PageHeader title="Critical Zones" description="High-risk landslide zones requiring immediate attention" />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card><div className="text-center"><p className="text-3xl font-bold text-red-600">{critical.length}</p><p className="text-sm text-slate-500">Critical</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-amber-600">{moderate.length}</p><p className="text-sm text-slate-500">Moderate</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-emerald-600">{locations.filter(l => l.risk_level === 'safe').length}</p><p className="text-sm text-slate-500">Safe</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-slate-700">{locations.length}</p><p className="text-sm text-slate-500">Total Zones</p></div></Card>
      </div>

      {critical.length === 0 ? (
        <Card><EmptyState icon={<AlertOctagon className="h-8 w-8" />} title="No critical zones" description="No zones currently classified as critical." /></Card>
      ) : (
        <div className="space-y-3">
          {critical.map((loc) => (
            <Card key={loc.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <RiskBadge level={loc.risk_level} />
                    <span className="text-base font-bold text-slate-800">{loc.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <Stat label="Risk Score" value={`${loc.risk_score}/100`} />
                    <Stat label="Rainfall" value={`${loc.rainfall} mm`} />
                    <Stat label="Slope" value={`${loc.slope}°`} />
                    <Stat label="Elevation" value={`${loc.elevation} m`} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${loc.historical_landslide ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {loc.historical_landslide ? 'Historical Landslide' : 'No History'}
                  </span>
                  <span className="text-xs text-slate-500">Susceptibility: <span className="font-semibold">{loc.susceptibility}</span></span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-1.5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}
