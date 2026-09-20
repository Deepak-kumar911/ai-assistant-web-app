import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSession, setBootstrapped } from '../stateManagement/slices/authSlice';
import { getMeApi } from '../api/authApi';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import InstagramRouteGuard from '../components/auth/InstagramRouteGuard';

// Pages
import SignUp from '../pages/SignUp';
import SignIn from '../pages/SignIn';
import Dashboard from '../pages/Dashboard';
import AllAgent from '../pages/aiAgent/AllAgent';
import ManageAiAgent from '../pages/aiAgent/ManageAiAgent';
import Settings from '../pages/Settings';
import UserLayout from '../layout/UserLayout';
import CustomForms from '../pages/CustomForm/CustomForms';
import IntegrationLayout from '../layout/IntegrationLayout';
import OAuthCallback from '../pages/OAuthCallback';
import TaskResponseCenter from '../pages/tasks/TaskResponseCenter';
import ChatInbox from '../pages/inbox/ChatInbox';
import InstagramInsightsDashboard from '../pages/integrations/instagram/InstagramInsightsDashboard';
import WorkflowSetup from '../pages/integrations/instagram/WorkflowSetup';
import InstagramPublisher from '../pages/integrations/instagram/publish/InstagramPublisher';
import PostScheduler from '../pages/integrations/instagram/PostScheduler';
import DesignSystemReference from '../pages/DesignSystemReference';
import TeamMembers from '../pages/team/TeamMembers';

export default function MainRouter() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state?.auth);
  const login = Boolean(auth?.login);
  const bootstrapped = Boolean(auth?.bootstrapped);

  // Session bootstrap on mount (Task 35 & 36)
  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const res = await getMeApi();
        if (!isMounted) return;

        if (res?.data?.user && (res?.data?.status === 1 || res?.status === 200)) {
          dispatch(setSession(res.data));
        } else {
          dispatch(setBootstrapped(true));
        }
      } catch (err) {
        if (!isMounted) return;
        dispatch(setBootstrapped(true));
      }
    };

    if (!bootstrapped) {
      bootstrapSession();
    }

    return () => {
      isMounted = false;
    };
  }, [dispatch, bootstrapped]);

  // Render initial loading state while checking session
  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-[#06B6D4]/20 border-t-[#06B6D4] rounded-full animate-spin" />
          <span className="text-xs text-[#94A3B8] font-medium tracking-wide">
            Initializing session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/design-system" element={<DesignSystemReference />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route
        path="/sign-in"
        element={login ? <Navigate to="/dashboard" replace /> : <SignIn />}
      />
      <Route
        path="/sign-up"
        element={login ? <Navigate to="/dashboard" replace /> : <SignUp />}
      />

      {/* Protected routes wrapped with ProtectedRoute for destination preservation */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <UserLayout><Dashboard /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserLayout><Dashboard /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-agent"
        element={
          <ProtectedRoute>
            <UserLayout><AllAgent /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-agent/manage/:id"
        element={
          <ProtectedRoute>
            <UserLayout><ManageAiAgent /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/form"
        element={
          <ProtectedRoute>
            <UserLayout><CustomForms /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflows"
        element={
          <ProtectedRoute>
            <InstagramRouteGuard>
              <UserLayout><WorkflowSetup /></UserLayout>
            </InstagramRouteGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/scheduler"
        element={
          <ProtectedRoute>
            <InstagramRouteGuard>
              <UserLayout><InstagramPublisher /></UserLayout>
            </InstagramRouteGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/post-scheduler"
        element={
          <ProtectedRoute>
            <InstagramRouteGuard>
              <UserLayout><PostScheduler /></UserLayout>
            </InstagramRouteGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <UserLayout><TaskResponseCenter /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/task-responses"
        element={
          <ProtectedRoute>
            <UserLayout><TaskResponseCenter /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <UserLayout><ChatInbox /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat-inbox"
        element={
          <ProtectedRoute>
            <UserLayout><ChatInbox /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <InstagramRouteGuard>
              <UserLayout><InstagramInsightsDashboard /></UserLayout>
            </InstagramRouteGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <UserLayout><TeamMembers /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <UserLayout><TeamMembers /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <UserLayout><Settings /></UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-agent/integration/:platformId/:platform/*"
        element={
          <ProtectedRoute>
            <IntegrationLayout />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={login ? "/dashboard" : "/sign-in"} replace />}
      />
    </Routes>
  );
}
