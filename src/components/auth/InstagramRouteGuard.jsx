import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getInstagramStatusApi } from '../../api/integration/platformIntegrationApi';

let lastNoticeTimestamp = 0;

/**
 * Route guard for Instagram management sub-pages.
 * If user attempts to access Instagram pages with an unhealthy/disconnected integration,
 * redirects back to the Connected Platforms tab with a helpful notice.
 * Reference: AGENT_TASK_PLAN.md Phase 14 Task 47.
 */
export default function InstagramRouteGuard({ children }) {
  const [status, setStatus] = useState(null); // 'checking' | 'connected' | 'unhealthy'
  const [agentId, setAgentId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const res = await getInstagramStatusApi();
        if (!isMounted) return;

        const data = res?.data?.data;
        if (data?.status === 'connected') {
          setStatus('connected');
          setAgentId(data?.aiAgentId || null);
        } else {
          setStatus('unhealthy');
          setAgentId(data?.aiAgentId || null);

          // Debounce toast notification (once per 4 seconds)
          const now = Date.now();
          if (now - lastNoticeTimestamp > 4000) {
            lastNoticeTimestamp = now;
            toast.warn(
              data?.statusReason ||
              "Instagram connection requires attention. Please reconnect your account to access Instagram features.",
              { autoClose: 5000, toastId: 'ig-guard-notice' }
            );
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus('unhealthy');
        const now = Date.now();
        if (now - lastNoticeTimestamp > 4000) {
          lastNoticeTimestamp = now;
          toast.warn("Instagram connection requires attention. Please reconnect your account.", {
            autoClose: 5000,
            toastId: 'ig-guard-notice',
          });
        }
      }
    };

    checkHealth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (status === null) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-medium tracking-wide">
          Verifying Instagram connection status...
        </span>
      </div>
    );
  }

  if (status === 'unhealthy') {
    const destination = agentId ? `/ai-agent/manage/${agentId}?tab=integration` : `/ai-agent`;
    return <Navigate to={destination} replace state={{ from: location.pathname, reason: 'unhealthy_instagram' }} />;
  }

  return children;
}
