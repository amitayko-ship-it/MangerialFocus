import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from 'sonner';

// Pages
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Questionnaire from '@/pages/Questionnaire';
import FutureVision from '@/pages/setup/FutureVision';
import FocusAreaSelection from '@/pages/setup/FocusAreaSelection';
import TasksEnergySetup from '@/pages/setup/TasksEnergySetup';
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

  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Public feedback form (no auth required) */}
      <Route path="/feedback/:token" element={<FeedbackPage />} />

      {/* Onboarding flow */}
      <Route path="/questionnaire" element={<ProtectedRoute><Questionnaire /></ProtectedRoute>} />
      <Route path="/setup/vision" element={<ProtectedRoute><FutureVision /></ProtectedRoute>} />
      <Route path="/setup/focus-area" element={<ProtectedRoute><FocusAreaSelection /></ProtectedRoute>} />
      <Route path="/setup/tasks-energy" element={<ProtectedRoute><TasksEnergySetup /></ProtectedRoute>} />
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
