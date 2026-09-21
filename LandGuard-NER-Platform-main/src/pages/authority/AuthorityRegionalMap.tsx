import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authorityNav } from '@/lib/authorityNav';
import { PageHeader, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import MapView, { type MapMarker } from '@/components/MapView';
import { RiskBadge } from '@/components/Badges';
import { supabase, type RiskLocation, type Alert, type HazardReport, type Road } from '@/lib/supabase';
import { Map as MapIcon } from 'lucide-react';

export default function AuthorityRegionalMap() {
  const [locations, setLocations] = useState<RiskLocation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RiskLocation | null>(null);
  const [filter, setFilter] = useState<'all' | 'risk' | 'reports' | 'roads'>('all');

  useEffect(() => {
    (async () => {
      const [locRes, alertRes, reportRes, roadRes] = await Promise.all([
        supabase.from('risk_locations').select('*'),
        supabase.from('alerts').select('*').eq('status', 'active'),
        supabase.from('hazard_reports').select('*'),
        supabase.from('roads').select('*'),
      ]);
      setLocations(locRes.data || []);
      setAlerts(alertRes.data || []);
      setReports(reportRes.data || []);
      setRoads(roadRes.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const markers: MapMarker[] = [];
  if (filter === 'all' || filter === 'risk') {
    locations.forEach((l) => markers.push({ id: l.id, lat: l.latitude, lng: l.longitude, label: l.label, riskLevel: l.risk_level, type: 'risk' }));
  }
  if (filter === 'all' || filter === 'reports') {
    reports.forEach((r) => markers.push({ id: `report-${r.id}`, lat: r.latitude, lng: r.longitude, label: `Report: ${r.report_id || ''}`, riskLevel: 'moderate', type: 'report' }));
  }

  return (
    <DashboardLayout navItems={authorityNav} title="Regional Risk Map" roleLabel="Disaster Management Authority">
      <PageHeader title="Regional Risk Map" description="Comprehensive view of risk zones, citizen reports, and road conditions" />

      {/* Filter buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'risk', 'reports', 'roads'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All Layers' : f === 'risk' ? 'Risk Zones' : f === 'reports' ? 'Citizen Reports' : 'Roads'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MapView markers={markers} onMarkerClick={(m) => setSelected(locations.find((l) => l.id === m.id) || null)} selectedId={selected?.id} height="550px" />
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
                <DetailRow label="Historical" value={selected.historical_landslide ? 'Yes' : 'No'} />
              </div>
            </Card>
          ) : (
            <Card><EmptyState icon={<MapIcon className="h-8 w-8" />} title="Select a marker" description="Click any marker to view details" /></Card>
          )}
          <Card>
            <h3 className="mb-3 text-sm font-bold text-slate-800">Map Layers Summary</h3>
            <div className="space-y-2 text-sm">
              <SummaryRow label="Risk Zones" count={locations.length} color="text-slate-700" />
              <SummaryRow label="Active Alerts" count={alerts.length} color="text-red-600" />
              <SummaryRow label="Citizen Reports" count={reports.length} color="text-blue-600" />
              <SummaryRow label="Blocked Roads" count={roads.filter((r) => r.road_status === 'blocked').length} color="text-red-600" />
            </div>
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

function SummaryRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className={`font-bold ${color}`}>{count}</span>
    </div>
  );
}
