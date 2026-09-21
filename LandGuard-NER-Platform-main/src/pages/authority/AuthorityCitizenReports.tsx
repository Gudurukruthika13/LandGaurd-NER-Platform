import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authorityNav } from '@/lib/authorityNav';
import { PageHeader, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import {
  supabase,
  type HazardReport,
  type ReportStatus,
  type Priority,
  type HazardType,
  HAZARD_TYPE_LABELS,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/lib/supabase';
import { FileWarning, MapPin, Calendar, X, Save, CheckCircle } from 'lucide-react';

const STATUSES: ReportStatus[] = ['pending', 'under_verification', 'verified', 'rejected', 'resolved'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

export default function AuthorityCitizenReports() {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HazardReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');

  const fetchReports = async () => {
    const { data } = await supabase.from('hazard_reports').select('*').order('created_at', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = filterStatus === 'all' ? reports : reports.filter((r) => r.status === filterStatus);

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout navItems={authorityNav} title="Citizen Reports" roleLabel="Disaster Management Authority">
      <PageHeader title="Citizen Reports" description="Review and manage hazard reports submitted by the community" />

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filterStatus === 'all' ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          All ({reports.length})
        </button>
        {STATUSES.map((s) => {
          const count = reports.filter((r) => r.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filterStatus === s ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={<FileWarning className="h-8 w-8" />} title="No reports found" description="No citizen reports match the current filter." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((report) => (
            <Card key={report.id}>
              <div className="flex items-start gap-3">
                {report.photo_url ? (
                  <img src={report.photo_url} alt="Report" className="h-20 w-20 flex-shrink-0 rounded-lg border border-slate-200 object-cover" />
                ) : (
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                    <FileWarning className="h-8 w-8 text-slate-300" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600">
                      {report.report_id || 'Pending'}
                    </span>
                    <StatusBadge status={report.status} />
                    <PriorityBadge priority={report.priority} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{HAZARD_TYPE_LABELS[report.hazard_type]}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{report.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(report.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(selected?.id === report.id ? null : report)}
                className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                {selected?.id === report.id ? 'Hide details' : 'Review & Update'}
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Detail / update panel */}
      {selected && (
        <ReportDetailPanel
          report={selected}
          onClose={() => setSelected(null)}
          onUpdate={async (status, priority) => {
            await supabase.from('hazard_reports').update({ status, priority }).eq('id', selected.id);
            setSelected({ ...selected, status, priority });
            fetchReports();
          }}
        />
      )}
    </DashboardLayout>
  );
}

function ReportDetailPanel({
  report,
  onClose,
  onUpdate,
}: {
  report: HazardReport;
  onClose: () => void;
  onUpdate: (status: ReportStatus, priority: Priority) => Promise<void>;
}) {
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [priority, setPriority] = useState<Priority>(report.priority);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(status, priority);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 p-0 sm:p-4" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:rounded-2xl sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h3 className="text-base font-bold text-slate-800">Report Review</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {report.photo_url && (
            <img src={report.photo_url} alt="Report" className="mb-4 w-full rounded-lg border border-slate-200" />
          )}

          <div className="mb-4 space-y-2 text-sm">
            <DetailRow label="Report ID" value={report.report_id || 'Pending'} />
            <DetailRow label="Hazard Type" value={HAZARD_TYPE_LABELS[report.hazard_type]} />
            <DetailRow label="Location" value={`${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`} />
            <DetailRow label="Date/Time" value={new Date(report.timestamp).toLocaleString()} />
            <DetailRow label="Submitted" value={new Date(report.created_at).toLocaleString()} />
          </div>

          <div className="mb-4 rounded-lg bg-slate-50 p-3">
            <p className="mb-1 text-xs font-medium text-slate-500">Description</p>
            <p className="text-sm text-slate-700">{report.description}</p>
          </div>

          {/* Update controls */}
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Update Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      status === s ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Update Priority</label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      priority === p ? 'bg-slate-700 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            {saved && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <CheckCircle className="h-4 w-4" /> Report updated successfully!
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
    </div>
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
