// pages/ai-agent/ManageAiAgent.tsx (Redesigned - No Nested Sidebar)
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiInfo, 
  FiZap, 
  FiBookOpen, 
  FiLink, 
  FiArrowLeft,
  FiSave,
  FiCheckCircle,
  FiSettings,
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
  const { details } = useSelector(state => state?.ai_agent);
  const [activeTab, setActiveTab] = useState('info');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const params = useParams();

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getAiAgentByIdApi(params?.id);
      dispatch(setAgentDetail(response?.data?.data));
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
      dispatch(resentAgentDetail());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchDetails();
    } else {
      // navigate(-1);
    }
  }, [params?.id]);

  const tabsOptions = [
    {
      value: 'info',
      label: 'Information',
      icon: <FiInfo className="w-4 h-4" />,
      description: 'Basic agent configuration',
      content: <AgentInfo onSave={() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }} />,
    },
    {
      value: 'behaviour',
      label: 'Behavior',
      icon: <FiZap className="w-4 h-4" />,
      description: 'Define agent responses',
      content: <AgentBehaviour refetch={fetchDetails} onSave={() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }} />,
    },
    {
      value: 'training',
      label: 'Knowledge',
      icon: <FiBookOpen className="w-4 h-4" />,
      description: 'Train with custom data',
      content: <AgentTraining />,
    },
     {
    value: 'tasks',
    label: 'Tasks',
    icon: <FiCheckSquare className="w-4 h-4" />,
    description: 'Create and manage forms & bookings',
    content: <AgentTask />,
  },
    {
      value: 'integration',
      label: 'Integrations',
      icon: <FiLink className="w-4 h-4" />,
      description: 'Connect platforms',
      content: <IntegrationTab agentId={params?.id} />,
    },
  ];

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header with Breadcrumb */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/ai-agent')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <FiArrowLeft size={20} className="text-gray-400 group-hover:text-white" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                    <FiCpu className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      {details?.name || 'AI Agent'}
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Configure and manage your agent settings
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Save Indicator */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30"
                >
                  <FiCheckCircle size={14} className="text-emerald-400" />
                  <span className="text-sm text-emerald-400">Changes saved</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modern Tab Bar - Like Linear/Vercel */}
          <div className="border-b border-white/10">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {tabsOptions.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`
                      relative px-4 py-3 rounded-t-xl transition-all duration-200
                      flex items-center gap-2 whitespace-nowrap
                      ${isActive 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-gray-300'
                      }
                    `}
                  >
                    <span className={`text-sm ${isActive ? 'text-cyan-400' : ''}`}>
                      {tab.icon}
                    </span>
                    <span className="text-sm font-medium">{tab.label}</span>
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBar"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0F0F12] border border-white/10 rounded-2xl overflow-hidden"
            >
              {tabsOptions.find(tab => tab.value === activeTab)?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

