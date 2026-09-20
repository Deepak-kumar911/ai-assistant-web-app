import { Link, NavLink, Outlet, useParams, useNavigate, Navigate, Route, Routes } from "react-router-dom";
import { integrationConfigs } from "../config/integrations/integration";
import Header from "../components/layout/Header";
import IntegrationSidebar from "../components/layout/IntegrationSidebar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getPlatformIntegrationApi } from "../api/integration/integrationApi";
import { getInstagramStatusApi } from "../api/integration/platformIntegrationApi";
import { setIntegrationDetail } from "../stateManagement/slices/integrationSlice";

export default function IntegrationLayout() {
  const { theme, sidebarOpen } = useSelector(state => state?.ui)
  const { platformId, platform } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  if (!platform || !integrationConfigs[platform]) {
    return <div className="p-6">Platform not supported</div>;
  }

  const config = integrationConfigs[platform]

  const fetchDetails = async () => {
    setLoading(true);
    try {
      if (platform === 'instagram') {
        const healthRes = await getInstagramStatusApi({ agentId: platformId });
        const healthData = healthRes?.data?.data;
        if (healthData && healthData.status !== 'connected') {
          toast.warn(
            healthData.statusReason ||
            "Instagram connection requires attention. Please reconnect your account.",
            { autoClose: 5000, toastId: 'ig-guard-notice' }
          );
          navigate(`/ai-agent/manage/${healthData.aiAgentId || platformId}?tab=integration`, { replace: true });
          return;
        }
      }

      const response = await getPlatformIntegrationApi({ type: platform });
      dispatch(setIntegrationDetail(response?.data?.data || null))
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (platform) {
      fetchDetails();
    }
  }, [platform, platformId]);



  const integrationDetail = useSelector(state => state?.integration?.details);
  const resolvedAgentId =
    (integrationDetail?.aiAgentId?._id || integrationDetail?.aiAgentId)?.toString() || null;

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-[#080C14] text-[#F8FAFC] font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Dynamic Ambient Background Lights */}
      <div
        aria-hidden="true"
        className="fixed top-0 -left-48 w-96 sm:w-[32rem] h-96 sm:h-[32rem] bg-cyan-500/[0.07] rounded-full blur-[140px] pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="fixed bottom-0 -right-48 w-96 sm:w-[32rem] h-96 sm:h-[32rem] bg-blue-600/[0.06] rounded-full blur-[140px] pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="fixed top-1/3 right-1/4 w-72 h-72 bg-teal-500/[0.03] rounded-full blur-[160px] pointer-events-none z-0"
      />

      {/* Main Viewport Shell */}
      <div className="relative flex flex-1 min-h-0 w-full z-10">
        {/* Sidebar */}
        <IntegrationSidebar />

        {/* Dynamic Content Canvas with Responsive Offset */}
        <div
          className={`relative flex flex-col flex-1 min-w-0 transition-all duration-300 ease-out w-full ${
            sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20'
          }`}
        >
          {/* Header */}
          <Header />

          {/* Main Scrollable Canvas with WCAG AAA Scroll Padding */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto custom-scrollbar scroll-pt-20 outline-none pb-12 md:pb-8"
          >
            <div className="w-full max-w-[1536px] mx-auto p-3.5 sm:p-5 md:p-6 lg:p-8">
              <Routes>
                {/* Redirect default -> overview */}
                <Route index element={<Navigate to="overview" replace />} />

                {config.sidebar.map((item) => {
                  const Component = item?.component;
                  return (
                    <Route
                      key={item.path}
                      path={item.path}
                      element={
                        Component ? (
                          <Component
                            fixedPlatform={platform}
                            fixedAgentId={resolvedAgentId}
                            hidePlatformFilter={true}
                            hideAgentFilter={true}
                          />
                        ) : (
                          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
                            {config.name} - {item.label} Page
                          </div>
                        )
                      }
                    />
                  );
                })}
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
