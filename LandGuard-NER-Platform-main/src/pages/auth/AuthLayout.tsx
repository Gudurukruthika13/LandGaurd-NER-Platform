import { useState, type ReactNode } from 'react';
import { Mountain, ShieldCheck, AlertTriangle, MapPin } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Mountain className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">LandGuard NER</p>
              <p className="text-xs text-emerald-400">Landslide Risk Monitoring & Early Warning</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Protecting lives through<br />early landslide warnings
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              AI-powered risk monitoring for the North Eastern Region of India.
              Real-time alerts, citizen reporting, and safer route guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FeatureRow icon={<AlertTriangle className="h-5 w-5" />} title="Real-time Risk Alerts" desc="Critical, moderate, and safe zone monitoring" />
            <FeatureRow icon={<MapPin className="h-5 w-5" />} title="Citizen Hazard Reporting" desc="Geo-tagged community reports with photo evidence" />
            <FeatureRow icon={<ShieldCheck className="h-5 w-5" />} title="Safer Route Guidance" desc="Road blockage tracking and alternative routes" />
          </div>
        </div>

        <p className="text-xs text-slate-500">SIH Prototype — North Eastern Region, India</p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <p className="text-lg font-bold text-slate-800">LandGuard NER</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

export function useAuthForm<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  return { values, error, setError, loading, setLoading, update };
}
