import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authorityNav } from '@/lib/authorityNav';
import { PageHeader, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { RiskBadge } from '@/components/Badges';
import {
  supabase,
  type Alert,
  type RiskLevel,
  type RiskLocation,
} from '@/lib/supabase';
import { Megaphone, Clock, X, Send, CheckCircle } from 'lucide-react';

const RISK_LEVELS: RiskLevel[] = ['safe', 'moderate', 'critical'];

export default function AuthorityAlertManagement() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [locations, setLocations] = useState<RiskLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchAlerts = async () => {
    const { data } = await supabase.from('alerts').select('*, risk_locations(*)').order('created_at', { ascending: false });
    setAlerts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchAlerts();
      const { data: locs } = await supabase.from('risk_locations').select('*').order('label');
      setLocations(locs || []);
    })();
  }, []);

  const updateAlertStatus = async (id: string, status: string) => {
    await supabase.from('alerts').update({ status }).eq('id', id);
    fetchAlerts();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout navItems={authorityNav} title="Alert Management" roleLabel="Disaster Management Authority">
      <PageHeader
        title="Alert Management"
        description="Create, manage, and dispatch landslide alerts"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Megaphone className="h-4 w-4" /> New Alert
          </button>
        }
      />

      {alerts.length === 0 ? (
        <Card><EmptyState icon={<Megaphone className="h-8 w-8" />} title="No alerts" description="No alerts have been issued yet." /></Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const loc = alert.risk_locations;
            return (
              <Card key={alert.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <RiskBadge level={alert.risk_level} size="sm" />
                      {loc && <span className="text-sm font-semibold text-slate-700">{loc.label}</span>}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        alert.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        alert.status === 'acknowledged' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{alert.message}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {alert.estimated_risk_window}</span>
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.status === 'active' && (
                      <button
                        onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status !== 'expired' && (
                      <button
                        onClick={() => updateAlertStatus(alert.id, 'expired')}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
                      >
                        Expire
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateAlertPanel
          locations={locations}
          onClose={() => setShowCreate(false)}
          onCreate={async (location_id, risk_level, message, window) => {
            await supabase.from('alerts').insert({
              location_id,
              risk_level,
              message,
              estimated_risk_window: window,
              status: 'active',
            });
            setShowCreate(false);
            fetchAlerts();
          }}
        />
      )}
    </DashboardLayout>
  );
}

function CreateAlertPanel({
  locations,
  onClose,
  onCreate,
}: {
  locations: RiskLocation[];
  onClose: () => void;
  onCreate: (location_id: string | null, risk_level: RiskLevel, message: string, window: string) => Promise<void>;
}) {
  const [locationId, setLocationId] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('moderate');
  const [message, setMessage] = useState('');
  const [riskWindow, setRiskWindow] = useState('Next 48 hours');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!message.trim()) return;
    setSaving(true);
    await onCreate(locationId || null, riskLevel, message, riskWindow);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 p-0 sm:p-4" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:rounded-2xl sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h3 className="text-base font-bold text-slate-800">Create New Alert</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select a location (optional)</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Risk Level</label>
            <div className="flex gap-2">
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Estimated Risk Window</label>
            <input
              type="text"
              value={riskWindow}
              onChange={(e) => setRiskWindow(e.target.value)}
              placeholder="e.g. Next 48 hours"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Alert Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe the alert..."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={saving || !message.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Send className="h-4 w-4" /> {saving ? 'Dispatching...' : 'Dispatch Alert'}
          </button>
        </div>
      </div>
    </div>
  );
}
