import type { RiskLevel, ReportStatus, Priority, RoadStatus } from '@/lib/supabase';

export function RiskBadge({ level, size = 'md' }: { level: RiskLevel; size?: 'sm' | 'md' }) {
  const styles: Record<RiskLevel, string> = {
    safe: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    moderate: 'bg-amber-100 text-amber-800 border-amber-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  };
  const sizeCls = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${styles[level]} ${sizeCls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        level === 'safe' ? 'bg-emerald-500' : level === 'moderate' ? 'bg-amber-500' : 'bg-red-500'
      }`} />
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const styles: Record<ReportStatus, string> = {
    pending: 'bg-gray-100 text-gray-700 border-gray-300',
    under_verification: 'bg-blue-100 text-blue-800 border-blue-300',
    verified: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    resolved: 'bg-teal-100 text-teal-800 border-teal-300',
  };
  const labels: Record<ReportStatus, string> = {
    pending: 'Pending',
    under_verification: 'Under Verification',
    verified: 'Verified',
    rejected: 'Rejected',
    resolved: 'Resolved',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    low: 'bg-gray-100 text-gray-700 border-gray-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

export function RoadStatusBadge({ status }: { status: RoadStatus }) {
  const styles: Record<RoadStatus, string> = {
    open: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    restricted: 'bg-amber-100 text-amber-800 border-amber-300',
    blocked: 'bg-red-100 text-red-800 border-red-300',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
