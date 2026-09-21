import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { communityNav } from '@/lib/communityNav';
import { PageHeader, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import MapView, { type MapMarker } from '@/components/MapView';
import { RiskBadge } from '@/components/Badges';
import { supabase, type RiskLocation, type Alert } from '@/lib/supabase';
import { Map as MapIcon } from 'lucide-react';

export default function CommunityRiskMap() {
  const [locations, setLocations] = useState<RiskLocation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RiskLocation | null>(null);

  useEffect(() => {
    (async () => {
      const [locRes, alertRes] = await Promise.all([
        supabase.from('risk_locations').select('*'),
        supabase.from('alerts').select('*, risk_locations(*)').eq('status', 'active'),
      ]);
      setLocations(locRes.data || []);
      setAlerts(alertRes.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const markers: MapMarker[] = locations.map((l) => ({
    id: l.id,
    lat: l.latitude,
    lng: l.longitude,
    label: l.label,
    riskLevel: l.risk_level,
    type: 'risk',
  }));

  return (
    <DashboardLayout navItems={communityNav} title="Risk Map" roleLabel="Community / Traveler">
      <PageHeader title="Risk Map" description="Landslide risk zones across the North Eastern Region" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MapView markers={markers} onMarkerClick={(m) => setSelected(locations.find((l) => l.id === m.id) || null)} selectedId={selected?.id} height="500px" />
        </div>
        <div className="space-y-4">
          {selected ? (
            <Card>
              <h3 className="mb-3 text-base font-bold text-slate-800">{selected.label}</h3>
              <div className="mb-3"><RiskBadge level={selected.risk_level} /></div>
              <div className="space-y-2 text-sm">
                <DetailRow label="Risk Score" value={`${selected.risk_score}/100`} />
                <DetailRow label="Rainfall" value={`${selected.rainfall} mm`} />
                <DetailRow label="Slope" value={`${selected.slope}°`} />
                <DetailRow label="Elevation" value={`${selected.elevation} m`} />
                <DetailRow label="Susceptibility" value={selected.susceptibility} />
                <DetailRow label="Vegetation" value={selected.vegetation} />
                <DetailRow label="Historical Landslide" value={selected.historical_landslide ? 'Yes' : 'No'} />
              </div>
            </Card>
          ) : (
            <Card>
              <EmptyState icon={<MapIcon className="h-8 w-8" />} title="Select a marker" description="Click on any marker on the map to view detailed risk information" />
            </Card>
          )}
          <Card>
            <h3 className="mb-3 text-sm font-bold text-slate-800">Active Alerts</h3>
            {alerts.length === 0 ? (
              <p className="text-sm text-slate-400">No active alerts</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-start gap-2 rounded-lg border border-slate-100 p-2">
                    <RiskBadge level={a.risk_level} size="sm" />
                    <p className="flex-1 text-xs text-slate-600">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-1.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
