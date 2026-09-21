import { Home, Map, Bell, Route, FileWarning, FileText, Info, User } from 'lucide-react';
import type { NavItem } from '@/components/DashboardLayout';

export const communityNav: NavItem[] = [
  { label: 'Home', path: '/community/home', icon: <Home className="h-5 w-5" /> },
  { label: 'Risk Map', path: '/community/risk-map', icon: <Map className="h-5 w-5" /> },
  { label: 'Nearby Alerts', path: '/community/nearby-alerts', icon: <Bell className="h-5 w-5" /> },
  { label: 'Safe Route', path: '/community/safe-route', icon: <Route className="h-5 w-5" /> },
  { label: 'Report Hazard', path: '/community/report-hazard', icon: <FileWarning className="h-5 w-5" /> },
  { label: 'My Reports', path: '/community/my-reports', icon: <FileText className="h-5 w-5" /> },
  { label: 'Notifications', path: '/community/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Emergency Info', path: '/community/emergency', icon: <Info className="h-5 w-5" /> },
  { label: 'Profile', path: '/community/profile', icon: <User className="h-5 w-5" /> },
];
