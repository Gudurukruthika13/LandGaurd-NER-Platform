import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type UserRole = 'community' | 'authority';

export type HazardType =
  | 'road_blockage'
  | 'ground_crack'
  | 'slope_failure'
  | 'fallen_rocks'
  | 'water_overflow'
  | 'possible_landslide'
  | 'other';

export type ReportStatus =
  | 'pending'
  | 'under_verification'
  | 'verified'
  | 'rejected'
  | 'resolved';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type RiskLevel = 'safe' | 'moderate' | 'critical';

export type RoadStatus = 'open' | 'restricted' | 'blocked';

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface HazardReport {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  hazard_type: HazardType;
  description: string;
  photo_url: string;
  timestamp: string;
  status: ReportStatus;
  priority: Priority;
  report_id: string | null;
  created_at: string;
}

export interface RiskLocation {
  id: string;
  latitude: number;
  longitude: number;
  rainfall: number;
  slope: number;
  elevation: number;
  historical_landslide: boolean;
  susceptibility: string;
  vegetation: string;
  risk_score: number;
  risk_level: RiskLevel;
  label: string;
  timestamp: string;
}

export interface Alert {
  id: string;
  location_id: string | null;
  risk_level: RiskLevel;
  message: string;
  estimated_risk_window: string;
  created_at: string;
  status: 'active' | 'expired' | 'acknowledged';
  risk_locations?: RiskLocation | null;
}

export interface Road {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  risk_level: RiskLevel;
  road_status: RoadStatus;
}

export const HAZARD_TYPE_LABELS: Record<HazardType, string> = {
  road_blockage: 'Road Blockage',
  ground_crack: 'Ground Crack',
  slope_failure: 'Slope Failure',
  fallen_rocks: 'Fallen Rocks',
  water_overflow: 'Water Overflow',
  possible_landslide: 'Possible Landslide',
  other: 'Other',
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  under_verification: 'Under Verification',
  verified: 'Verified',
  rejected: 'Rejected',
  resolved: 'Resolved',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};
