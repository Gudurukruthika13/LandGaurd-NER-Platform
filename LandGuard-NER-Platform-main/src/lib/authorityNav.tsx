import { LayoutDashboard, Map, AlertOctagon, Bell, FileWarning, Route, TrendingUp, Megaphone, BarChart3, User } from 'lucide-react';
import type { NavItem } from '@/components/DashboardLayout';

export const authorityNav: NavItem[] = [
  { label: 'Overview', path: '/authority/overview', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Regional Risk Map', path: '/authority/regional-map', icon: <Map className="h-5 w-5" /> },
  { label: 'Critical Zones', path: '/authority/critical-zones', icon: <AlertOctagon className="h-5 w-5" /> },
  { label: 'Active Alerts', path: '/authority/active-alerts', icon: <Bell className="h-5 w-5" /> },
  { label: 'Citizen Reports', path: '/authority/citizen-reports', icon: <FileWarning className="h-5 w-5" /> },
  { label: 'Road Blockages', path: '/authority/road-blockages', icon: <Route className="h-5 w-5" /> },
  { label: 'Risk Forecast', path: '/authority/risk-forecast', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Alert Management', path: '/authority/alert-management', icon: <Megaphone className="h-5 w-5" /> },
  { label: 'Analytics', path: '/authority/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Profile', path: '/authority/profile', icon: <User className="h-5 w-5" /> },
];
