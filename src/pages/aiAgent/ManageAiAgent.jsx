import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiInfo, 
  FiZap, 
  FiBookOpen, 
  FiLink, 
  FiArrowLeft,
  FiCheckCircle,
  FiCpu,
  FiCheckSquare
} from 'react-icons/fi';
import { resentAgentDetail, setAgentDetail } from '../../stateManagement/slices/aiAgentSlice';
import Loader from '../../components/common/Loader';
import AgentInfo from '../../components/common/ai-agent/tabs/AgentInfo';
import AgentBehaviour from '../../components/common/ai-agent/tabs/AgentBehaviour';
import { getAiAgentByIdApi } from '../../api/authApi';
import IntegrationTab from '../../components/common/ai-agent/tabs/IntegrationTab';
import AgentTraining from '../../components/common/ai-agent/tabs/AgentTraining';
import AgentTask from '../../components/common/ai-agent/tabs/AgentTask';

export default function ManageAiAgent() {
  const dispatch = useDispatch();
  const { details } = useSelector((state) => state?.ai_agent);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'info');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const params = useParams();

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getAiAgentByIdApi(params?.id);
      dispatch(setAgentDetail(response?.data?.data));
    } catch (error) {
      console.error('Error fetching agent details:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
      dispatch(resentAgentDetail());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchDetails();
    }
  }, [params?.id]);

  const agentAvatar = details?.avatarUrl || details?.image || details?.agentImg || details?.photoUrl;

  const tabsOptions = [
    {
      value: 'info',
      label: 'Information',
      icon: <FiInfo className="w-4 h-4" />,
      description: 'Profile and basic agent configuration',
      content: (
        <AgentInfo
          onSave={() => {
            fetchDetails();
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
        />
      ),
    },
    {
      value: 'behaviour',
      label: 'Behavior',
      icon: <FiZap className="w-4 h-4" />,
      description: 'Define prompt and conversational tone',
      content: (
        <AgentBehaviour
          refetch={fetchDetails}
          onSave={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
        />
      ),
    },
    {
      value: 'training',
      label: 'Knowledge',
      icon: <FiBookOpen className="w-4 h-4" />,
      description: 'Train with custom documents and web data',
      content: <AgentTraining />,
    },
    {
      value: 'tasks',
      label: 'Tasks',
      icon: <FiCheckSquare className="w-4 h-4" />,
      description: 'Custom forms, leads, and booking tasks',
      content: <AgentTask />,
    },
    {
      value: 'integration',
      label: 'Integrations',
      icon: <FiLink className="w-4 h-4" />,
      description: 'Connect website widgets and social platforms',
      content: <IntegrationTab agentId={params?.id} />,
    },
  ];

  return (
    <>
      {loading && !details ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader />
        </div>
      ) : (
        <div className="space-y-6 max-w-full pb-10">
          {/* Top Bar with Back Navigation & Agent Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/ai-agent')}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-[#94A3B8] hover:text-white border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                title="Back to all agents"
                aria-label="Back to all agents"
              >
                <FiArrowLeft size={18} />
              </button>

              <div className="flex items-center gap-3 min-w-0">
                {agentAvatar ? (
                  <img
                    src={agentAvatar}
                    alt={details?.name || 'Agent'}
                    className="w-11 h-11 rounded-xl object-cover border border-white/15 shadow-md shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)] shrink-0">
                    <FiCpu size={20} />
                  </div>
                )}

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate">
                    {details?.name || 'AI Agent'}
                  </h1>
                  <p className="text-xs text-[#94A3B8] truncate mt-0.5">
                    {details?.companyName ? `${details.companyName} • ` : ''}Configure agent persona, knowledge, and channels
                  </p>
                </div>
              </div>
            </div>

            {/* Save Indicator */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)] self-start sm:self-auto"
                >
                  <FiCheckCircle size={14} className="text-emerald-400" />
                  <span>Changes saved successfully</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modern Responsive Glassmorphic Tab Bar */}
          <div className="border-b border-white/[0.08] overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-1.5 min-w-max pb-0.5">
              {tabsOptions.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleTabChange(tab.value)}
                    className={`
                      relative px-4 py-3 rounded-t-xl transition-all duration-200
                      flex items-center gap-2.5 whitespace-nowrap cursor-pointer text-xs sm:text-sm font-semibold select-none
                      ${
                        isActive
                          ? 'text-[#F8FAFC] bg-white/[0.04]'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.02]'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]' : 'text-[#94A3B8]'}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>

                    {/* Active Gradient Border Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activeManageTabBar"
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_#06B6D4]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Canvas with Glassmorphism */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              {tabsOptions.find((tab) => tab.value === activeTab)?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
