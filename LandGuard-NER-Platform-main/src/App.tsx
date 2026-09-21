import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

import CommunityHome from '@/pages/community/CommunityHome';
import CommunityRiskMap from '@/pages/community/CommunityRiskMap';
import CommunityNearbyAlerts from '@/pages/community/CommunityNearbyAlerts';
import CommunitySafeRoute from '@/pages/community/CommunitySafeRoute';
import CommunityReportHazard from '@/pages/community/CommunityReportHazard';
import CommunityMyReports from '@/pages/community/CommunityMyReports';
import CommunityNotifications from '@/pages/community/CommunityNotifications';
import CommunityEmergency from '@/pages/community/CommunityEmergency';
import CommunityProfile from '@/pages/community/CommunityProfile';

import AuthorityOverview from '@/pages/authority/AuthorityOverview';
import AuthorityRegionalMap from '@/pages/authority/AuthorityRegionalMap';
import AuthorityCriticalZones from '@/pages/authority/AuthorityCriticalZones';
import AuthorityActiveAlerts from '@/pages/authority/AuthorityActiveAlerts';
import AuthorityCitizenReports from '@/pages/authority/AuthorityCitizenReports';
import AuthorityRoadBlockages from '@/pages/authority/AuthorityRoadBlockages';
import AuthorityRiskForecast from '@/pages/authority/AuthorityRiskForecast';
import AuthorityAlertManagement from '@/pages/authority/AuthorityAlertManagement';
import AuthorityAnalytics from '@/pages/authority/AuthorityAnalytics';
import AuthorityProfile from '@/pages/authority/AuthorityProfile';

function ProtectedRoute({ children, requireRole }: { children: React.ReactNode; requireRole?: 'community' | 'authority' }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Authenticating..." />;
  if (!session) return <Navigate to="/login" replace />;
  if (requireRole && profile?.role !== requireRole) {
    return <Navigate to={profile?.role === 'authority' ? '/authority/overview' : '/community/home'} replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <LoadingSpinner label="Loading..." />;
  if (session && profile) {
    return <Navigate to={profile.role === 'authority' ? '/authority/overview' : '/community/home'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* Community routes */}
          <Route path="/community/home" element={<ProtectedRoute requireRole="community"><CommunityHome /></ProtectedRoute>} />
          <Route path="/community/risk-map" element={<ProtectedRoute requireRole="community"><CommunityRiskMap /></ProtectedRoute>} />
          <Route path="/community/nearby-alerts" element={<ProtectedRoute requireRole="community"><CommunityNearbyAlerts /></ProtectedRoute>} />
          <Route path="/community/safe-route" element={<ProtectedRoute requireRole="community"><CommunitySafeRoute /></ProtectedRoute>} />
          <Route path="/community/report-hazard" element={<ProtectedRoute requireRole="community"><CommunityReportHazard /></ProtectedRoute>} />
          <Route path="/community/my-reports" element={<ProtectedRoute requireRole="community"><CommunityMyReports /></ProtectedRoute>} />
          <Route path="/community/notifications" element={<ProtectedRoute requireRole="community"><CommunityNotifications /></ProtectedRoute>} />
          <Route path="/community/emergency" element={<ProtectedRoute requireRole="community"><CommunityEmergency /></ProtectedRoute>} />
          <Route path="/community/profile" element={<ProtectedRoute requireRole="community"><CommunityProfile /></ProtectedRoute>} />

          {/* Authority routes */}
          <Route path="/authority/overview" element={<ProtectedRoute requireRole="authority"><AuthorityOverview /></ProtectedRoute>} />
          <Route path="/authority/regional-map" element={<ProtectedRoute requireRole="authority"><AuthorityRegionalMap /></ProtectedRoute>} />
          <Route path="/authority/critical-zones" element={<ProtectedRoute requireRole="authority"><AuthorityCriticalZones /></ProtectedRoute>} />
          <Route path="/authority/active-alerts" element={<ProtectedRoute requireRole="authority"><AuthorityActiveAlerts /></ProtectedRoute>} />
          <Route path="/authority/citizen-reports" element={<ProtectedRoute requireRole="authority"><AuthorityCitizenReports /></ProtectedRoute>} />
          <Route path="/authority/road-blockages" element={<ProtectedRoute requireRole="authority"><AuthorityRoadBlockages /></ProtectedRoute>} />
          <Route path="/authority/risk-forecast" element={<ProtectedRoute requireRole="authority"><AuthorityRiskForecast /></ProtectedRoute>} />
          <Route path="/authority/alert-management" element={<ProtectedRoute requireRole="authority"><AuthorityAlertManagement /></ProtectedRoute>} />
          <Route path="/authority/analytics" element={<ProtectedRoute requireRole="authority"><AuthorityAnalytics /></ProtectedRoute>} />
          <Route path="/authority/profile" element={<ProtectedRoute requireRole="authority"><AuthorityProfile /></ProtectedRoute>} />

          {/* Defaults */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
