import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from 'sonner';

// Pages
import AuthPage from '@/pages/AuthPage';
import Questionnaire from '@/pages/Questionnaire';
import IntroVideo from '@/pages/IntroVideo';
import IntroRocksVideo from '@/pages/IntroRocksVideo';
import BigRocksAgent from '@/pages/BigRocksAgent';
import ManagementCompass from '@/pages/ManagementCompass';
import FutureVision from '@/pages/setup/FutureVision';
import FocusAreaSelection from '@/pages/setup/FocusAreaSelection';
import StakeholdersSetup from '@/pages/setup/StakeholdersSetup';
import OnboardingSummary from '@/pages/setup/OnboardingSummary';
import Dashboard from '@/pages/Dashboard';
import WeeklyCheckIn from '@/pages/WeeklyCheckIn';
import FeedbackPage from '@/pages/FeedbackPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/management-compass" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />

      {/* Public feedback form (no auth required) */}
      <Route path="/feedback/:token" element={<FeedbackPage />} />

      {/* Onboarding flow */}
      <Route path="/management-compass" element={<ProtectedRoute><ManagementCompass /></ProtectedRoute>} />
      <Route path="/questionnaire" element={<ProtectedRoute><Questionnaire /></ProtectedRoute>} />
      <Route path="/intro-video" element={<ProtectedRoute><IntroVideo /></ProtectedRoute>} />
      <Route path="/setup/vision" element={<ProtectedRoute><FutureVision /></ProtectedRoute>} />
      <Route path="/intro-rocks-video" element={<ProtectedRoute><IntroRocksVideo /></ProtectedRoute>} />
      <Route path="/setup/big-rocks-agent" element={<ProtectedRoute><BigRocksAgent /></ProtectedRoute>} />
      <Route path="/setup/focus-area" element={<ProtectedRoute><FocusAreaSelection /></ProtectedRoute>} />
      <Route path="/setup/stakeholders" element={<ProtectedRoute><StakeholdersSetup /></ProtectedRoute>} />
      <Route path="/setup/summary" element={<ProtectedRoute><OnboardingSummary /></ProtectedRoute>} />

      {/* Main app */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/weekly-check" element={<ProtectedRoute><WeeklyCheckIn /></ProtectedRoute>} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
