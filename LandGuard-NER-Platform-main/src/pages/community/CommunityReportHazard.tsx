import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { communityNav } from '@/lib/communityNav';
import { PageHeader, Card } from '@/components/ui';
import { supabase, type HazardType, HAZARD_TYPE_LABELS } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Camera, MapPin, FileWarning, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const HAZARD_TYPES = Object.keys(HAZARD_TYPE_LABELS) as HazardType[];

export default function CommunityReportHazard() {
  const { profile } = useAuth();
  const [hazardType, setHazardType] = useState<HazardType>('road_blockage');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      () => setError('Could not get your location. Please enter manually.'),
    );
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: insertError } = await supabase
        .from('hazard_reports')
        .insert({
          user_id: profile?.id,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          hazard_type: hazardType,
          description,
          photo_url: photoUrl,
          timestamp: new Date(timestamp).toISOString(),
          status: 'pending',
          priority: 'medium',
        })
        .select('report_id')
        .single();

      if (insertError) throw insertError;

      setSuccess(`Report submitted successfully! Your Report ID is ${data.report_id || 'pending'}.`);
      // Reset
      setDescription('');
      setLatitude('');
      setLongitude('');
      setPhotoUrl('');
      setTimestamp(new Date().toISOString().slice(0, 16));
      setHazardType('road_blockage');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout navItems={communityNav} title="Report Hazard" roleLabel="Community / Traveler">
      <PageHeader title="Report a Hazard" description="Submit a geo-tagged hazard report with photo evidence" />

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left — form fields */}
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <h3 className="mb-4 text-base font-bold text-slate-800">Hazard Details</h3>

              {/* Hazard type */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">Hazard Type</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {HAZARD_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setHazardType(type)}
                      className={`rounded-lg border p-2.5 text-left text-sm transition-all ${
                        hazardType === type
                          ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {HAZARD_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe what you observed..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Date/time */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Date & Time of Observation</label>
                <input
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </Card>

            {/* Location */}
            <Card>
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
                <MapPin className="h-5 w-5 text-emerald-600" /> Location
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    required
                    placeholder="e.g. 25.5788"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    required
                    placeholder="e.g. 91.8933"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={useMyLocation}
                className="mt-3 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                <MapPin className="h-4 w-4" /> Use my current location
              </button>
            </Card>
          </div>

          {/* Right — photo + submit */}
          <div className="space-y-4">
            <Card>
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
                <Camera className="h-5 w-5 text-emerald-600" /> Photo Evidence
              </h3>
              {photoUrl ? (
                <div className="relative">
                  <img src={photoUrl} alt="Hazard" className="w-full rounded-lg border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-8 transition-colors hover:border-emerald-400 hover:bg-emerald-50/30">
                  <Camera className="h-10 w-10 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Click to upload photo</span>
                  <span className="text-xs text-slate-400">JPG, PNG up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </label>
              )}
            </Card>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><FileWarning className="h-4 w-4" /> Submit Report</>}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
