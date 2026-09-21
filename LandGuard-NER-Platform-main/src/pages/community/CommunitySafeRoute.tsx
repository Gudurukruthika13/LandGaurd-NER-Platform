import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { communityNav } from '@/lib/communityNav';
import { PageHeader, Card, LoadingSpinner } from '@/components/ui';
import { RoadStatusBadge, RiskBadge } from '@/components/Badges';
import { supabase, type Road } from '@/lib/supabase';
import { Route as RouteIcon, ArrowRight } from 'lucide-react';

export default function CommunitySafeRoute() {
  const [roads, setRoads] = useState<Road[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('roads').select('*').order('risk_level', { ascending: false });
      setRoads(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  const safeRoads = roads.filter((r) => r.road_status === 'open' && r.risk_level === 'safe');
  const blockedRoads = roads.filter((r) => r.road_status === 'blocked');

  return (
    <DashboardLayout navItems={communityNav} title="Safe Route" roleLabel="Community / Traveler">
      <PageHeader title="Safe Route Finder" description="Road conditions and safer alternatives across NER" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><div className="text-center"><p className="text-3xl font-bold text-emerald-600">{safeRoads.length}</p><p className="text-sm text-slate-500">Safe Routes</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-amber-600">{roads.filter(r => r.road_status === 'restricted').length}</p><p className="text-sm text-slate-500">Restricted</p></div></Card>
        <Card><div className="text-center"><p className="text-3xl font-bold text-red-600">{blockedRoads.length}</p><p className="text-sm text-slate-500">Blocked</p></div></Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
            <RouteIcon className="h-5 w-5 text-emerald-600" /> Recommended Safe Routes
          </h3>
          {safeRoads.length === 0 ? (
            <p className="text-sm text-slate-400">No fully safe routes identified. Proceed with caution.</p>
          ) : (
            <div className="space-y-3">
              {safeRoads.map((road) => (
                <div key={road.id} className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{road.name}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      {road.start_location} <ArrowRight className="h-3 w-3" /> {road.end_location}
                    </p>
                  </div>
                  <RiskBadge level={road.risk_level} size="sm" />
                  <RoadStatusBadge status={road.road_status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
            <RouteIcon className="h-5 w-5 text-red-600" /> Blocked & Restricted Roads
          </h3>
          {blockedRoads.length === 0 && roads.filter(r => r.road_status === 'restricted').length === 0 ? (
            <p className="text-sm text-slate-400">No blocked roads reported.</p>
          ) : (
            <div className="space-y-3">
              {roads.filter(r => r.road_status !== 'open').map((road) => (
                <div key={road.id} className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{road.name}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      {road.start_location} <ArrowRight className="h-3 w-3" /> {road.end_location}
                    </p>
                  </div>
                  <RiskBadge level={road.risk_level} size="sm" />
                  <RoadStatusBadge status={road.road_status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
