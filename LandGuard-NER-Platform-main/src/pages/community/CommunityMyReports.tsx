import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { communityNav } from '@/lib/communityNav';
import { PageHeader, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { supabase, type HazardReport, HAZARD_TYPE_LABELS } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { FileText, MapPin, Calendar } from 'lucide-react';

export default function CommunityMyReports() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HazardReport | null>(null);

  useEffect(() => {
    (async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('hazard_reports')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      setReports(data || []);
      setLoading(false);
    })();
  }, [profile?.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout navItems={communityNav} title="My Reports" roleLabel="Community / Traveler">
      <PageHeader title="My Reports" description="Track the status of your submitted hazard reports" />

      {reports.length === 0 ? (
        <Card><EmptyState icon={<FileText className="h-8 w-8" />} title="No reports yet" description="Submit your first hazard report to see it here." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {reports.map((report) => (
              <Card key={report.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600">
                        {report.report_id || 'Pending'}
                      </span>
                      <StatusBadge status={report.status} />
                      <PriorityBadge priority={report.priority} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{HAZARD_TYPE_LABELS[report.hazard_type]}</p>
                    <p className="mt-1 text-sm text-slate-500">{report.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(report.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {report.photo_url && (
                    <img src={report.photo_url} alt="Report" className="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
                  )}
                </div>
                <button
                  onClick={() => setSelected(selected?.id === report.id ? null : report)}
                  className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  {selected?.id === report.id ? 'Hide details' : 'View details'}
                </button>
              </Card>
            ))}
          </div>

          <div>
            {selected ? (
              <Card>
                <h3 className="mb-3 text-base font-bold text-slate-800">Report Details</h3>
                {selected.photo_url && <img src={selected.photo_url} alt="Report" className="mb-3 w-full rounded-lg" />}
                <div className="space-y-2 text-sm">
                  <DetailRow label="Report ID" value={selected.report_id || 'Pending'} />
                  <DetailRow label="Hazard Type" value={HAZARD_TYPE_LABELS[selected.hazard_type]} />
                  <DetailRow label="Status" value={selected.status.replace(/_/g, ' ')} />
                  <DetailRow label="Priority" value={selected.priority} />
                  <DetailRow label="Latitude" value={selected.latitude.toString()} />
                  <DetailRow label="Longitude" value={selected.longitude.toString()} />
                  <DetailRow label="Submitted" value={new Date(selected.created_at).toLocaleString()} />
                </div>
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">Description</p>
                  <p className="mt-1 text-sm text-slate-700">{selected.description}</p>
                </div>
              </Card>
            ) : (
              <Card><EmptyState icon={<FileText className="h-8 w-8" />} title="Select a report" description="Click View details on any report to see full information" /></Card>
            )}
          </div>
        </div>
      )}
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
