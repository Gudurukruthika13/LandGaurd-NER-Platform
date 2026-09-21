import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authorityNav } from '@/lib/authorityNav';
import { PageHeader, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { RiskBadge, RoadStatusBadge } from '@/components/Badges';
import {
  supabase,
  type Road,
  type RoadStatus,
  type RiskLevel,
} from '@/lib/supabase';
import { Route as RoadIcon, ArrowRight, X, Save, CheckCircle } from 'lucide-react';

const ROAD_STATUSES: RoadStatus[] = ['open', 'restricted', 'blocked'];
const RISK_LEVELS: RiskLevel[] = ['safe', 'moderate', 'critical'];

export default function AuthorityRoadBlockages() {
  const [roads, setRoads] = useState<Road[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Road | null>(null);

  const fetchRoads = async () => {
    const { data } = await supabase.from('roads').select('*').order('road_status', { ascending: false });
    setRoads(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoads();
  }, []);

  if (loading) return <LoadingSpinner />;

  const blocked = roads.filter((r) => r.road_status === 'blocked');
  const restricted = roads.filter((r) => r.road_status === 'restricted');
  const open = roads.filter((r) => r.road_status === 'open');

  return (
    <DashboardLayout navItems={authorityNav} title="Road Blockages" roleLabel="Disaster Management Authority">
      <PageHeader title="Road Blockages" description="Monitor and manage road conditions across NER" />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card><div className="text-center"><p className="text-3xl font-bold text-red-600">{blocked.length}</p><p className="text-sm text-slate-500">Blocked</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-amber-600">{restricted.length}</p><p className="text-sm text-slate-500">Restricted</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-emerald-600">{open.length}</p><p className="text-sm text-slate-500">Open</p></div></Card>
      </div>

      {roads.length === 0 ? (
        <Card><EmptyState icon={<RoadIcon className="h-8 w-8" />} title="No roads" description="No road data available." /></Card>
      ) : (
        <div className="space-y-3">
          {roads.map((road) => (
            <Card key={road.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="text-base font-bold text-slate-800">{road.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    {road.start_location} <ArrowRight className="h-3.5 w-3.5" /> {road.end_location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge level={road.risk_level} size="sm" />
                  <RoadStatusBadge status={road.road_status} />
                  <button
                    onClick={() => setEditing(road)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Update
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <RoadUpdatePanel
          road={editing}
          onClose={() => setEditing(null)}
          onUpdate={async (risk_level, road_status) => {
            await supabase.from('roads').update({ risk_level, road_status }).eq('id', editing.id);
            setEditing({ ...editing, risk_level, road_status });
            fetchRoads();
          }}
        />
      )}
    </DashboardLayout>
  );
}

function RoadUpdatePanel({
  road,
  onClose,
  onUpdate,
}: {
  road: Road;
  onClose: () => void;
  onUpdate: (risk_level: RiskLevel, road_status: RoadStatus) => Promise<void>;
}) {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(road.risk_level);
  const [roadStatus, setRoadStatus] = useState<RoadStatus>(road.road_status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(riskLevel, roadStatus);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 p-0 sm:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-800">Update Road Status</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-800">{road.name}</p>
            <p className="flex items-center gap-1 text-sm text-slate-500">
              {road.start_location} <ArrowRight className="h-3.5 w-3.5" /> {road.end_location}
            </p>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Risk Level</label>
            <div className="flex flex-wrap gap-2">
              {RISK_LEVELS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskLevel(r)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                    riskLevel === r ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Road Status</label>
            <div className="flex flex-wrap gap-2">
              {ROAD_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setRoadStatus(s)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                    roadStatus === s ? 'bg-slate-700 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {saved && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle className="h-4 w-4" /> Road status updated!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
