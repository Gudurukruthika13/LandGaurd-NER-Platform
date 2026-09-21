import DashboardLayout from '@/components/DashboardLayout';
import { communityNav } from '@/lib/communityNav';
import { PageHeader, Card } from '@/components/ui';
import { Phone, Ambulance, ShieldAlert, MapPin, AlertTriangle, Heart } from 'lucide-react';

const EMERGENCY_CONTACTS = [
  { label: 'NDRF (National Disaster Response Force)', number: '1070', icon: <ShieldAlert className="h-5 w-5" /> },
  { label: 'SDMA Helpline', number: '1077', icon: <Phone className="h-5 w-5" /> },
  { label: 'Emergency Ambulance', number: '108', icon: <Ambulance className="h-5 w-5" /> },
  { label: 'Disaster Management (Toll Free)', number: '1800-180-1551', icon: <Phone className="h-5 w-5" /> },
];

const SAFETY_TIPS = [
  'Stay away from steep slopes and landslide-prone areas during heavy rainfall.',
  'If you notice ground cracks or tilting trees, evacuate immediately and inform authorities.',
  'Keep an emergency kit with water, food, first aid, and a flashlight.',
  'Monitor weather forecasts and avoid travel during landslide warnings.',
  'If caught in a landslide, move sideways and uphill — never downhill.',
  'Do not cross roads with flowing water or debris, even if it looks shallow.',
];

export default function CommunityEmergency() {
  return (
    <DashboardLayout navItems={communityNav} title="Emergency Information" roleLabel="Community / Traveler">
      <PageHeader title="Emergency Information" description="Critical contacts and safety guidelines" />

      {/* Emergency contacts */}
      <div className="mb-6">
        <h3 className="mb-3 text-base font-bold text-slate-800">Emergency Contacts</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EMERGENCY_CONTACTS.map((contact) => (
            <Card key={contact.label}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  {contact.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{contact.label}</p>
                  <a href={`tel:${contact.number}`} className="text-lg font-bold text-red-600 hover:underline">
                    {contact.number}
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Safety tips */}
      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> Landslide Safety Tips
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SAFETY_TIPS.map((tip, i) => (
            <Card key={i}>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <span className="text-sm font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-700">{tip}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Evacuation info */}
      <Card>
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
          <Heart className="h-5 w-5 text-red-500" /> During a Landslide
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3">
            <MapPin className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Evacuate immediately</p>
              <p className="text-sm text-slate-600">Move to higher ground and away from the slope. Follow designated evacuation routes.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Report to authorities</p>
              <p className="text-sm text-slate-600">Use the Report Hazard feature to notify disaster management authorities of the situation.</p>
            </div>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
