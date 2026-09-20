// pages/ai-agent/AllAgent.jsx (Task 39: Plan-Gated Agent Management)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { 
  FiCpu, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiMoreVertical, 
  FiPlay, 
  FiPause, 
  FiTrash2,
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiChevronRight,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { Zap, Sparkles, AlertCircle } from 'lucide-react';
import { setAgentDetail } from '../../stateManagement/slices/aiAgentSlice';
import { getAllUserAIagentApi, getAccountUsageApi } from '../../api/authApi';
import Loader from '../../components/common/Loader';
import { Badge, Button } from '../../components/ui';
import CreateAgentModal from '../../components/agent/CreateAgentModal';
import UpgradePlanModal from '../../components/plan/UpgradePlanModal';

const AllAgent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Task 39: Plan gating and usage state
  const [usage, setUsage] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await getAllUserAIagentApi();
      setList(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const res = await getAccountUsageApi();
      if (res?.data?.data) {
        setUsage(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching account usage:', err);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchUsage();
  }, []);

  const handleAgentCreated = (newAgent) => {
    fetchAgents();
    fetchUsage();
  };

  // Usage calculations
  const agentCount = usage?.agentCount ?? list.length;
  const agentLimit = usage?.agentLimit ?? 1;
  const plan = usage?.plan ?? 'free';
  const isAtLimit = agentCount >= agentLimit;
  const percentUsed = Math.min(100, Math.round((agentCount / agentLimit) * 100));

  const filteredAgents = list.filter(agent => {
    const matchesSearch = agent?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && agent?.isOnOff) ||
                         (filterStatus === 'paused' && !agent?.isOnOff);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: list.length,
    active: list.filter(a => a?.isOnOff).length,
    paused: list.filter(a => !a?.isOnOff).length,
    avgResponse: '0.8s'
  };

  const handleAgentClick = (agent) => {
    dispatch(setAgentDetail(agent));
    navigate(`/ai-agent/manage/${agent._id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            AI Agents
          </h1>
          <p className="text-gray-400 mt-1">Manage and monitor your intelligent automation agents</p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            disabled={isAtLimit}
            onClick={() => {
              if (isAtLimit) {
                toast.info(`Agent limit reached (${agentCount}/${agentLimit}) for ${plan} plan.`);
                setUpgradeModalOpen(true);
                return;
              }
              setCreateModalOpen(true);
            }}
            icon={FiPlus}
            className={isAtLimit ? 'opacity-60 cursor-not-allowed' : ''}
          >
            Create New Agent
          </Button>

          {isAtLimit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setUpgradeModalOpen(true)}
              icon={Sparkles}
              className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      {/* Task 39: Plan Usage Banner */}
      <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl ${
              isAtLimit ? 'bg-amber-500/15 text-amber-400' : 'bg-[#06B6D4]/15 text-[#06B6D4]'
            }`}
          >
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Plan Usage</h3>
              <Badge
                variant={plan === 'ultra' ? 'warning' : plan === 'pro' ? 'accent' : 'default'}
                size="sm"
                styleType="solid"
                className="uppercase font-bold tracking-wider text-[10px]"
              >
                {plan} plan
              </Badge>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              <strong className="text-[#F8FAFC]">
                {agentCount} of {agentLimit}
              </strong>{' '}
              agents used ({Math.max(0, agentLimit - agentCount)} remaining)
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAtLimit
                  ? 'bg-amber-500'
                  : percentUsed > 75
                  ? 'bg-amber-400'
                  : 'bg-[#06B6D4]'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-[#94A3B8] shrink-0">
            {percentUsed}%
          </span>
        </div>

        {/* Upgrade Action */}
        <div className="flex items-center gap-2.5">
          {isAtLimit && (
            <span className="text-xs text-amber-400/90 font-medium hidden lg:inline">
              Limit reached
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setUpgradeModalOpen(true)}
            icon={Sparkles}
            className="border-white/15 hover:border-[#06B6D4]/50 hover:bg-[#06B6D4]/10 text-[#F8FAFC]"
          >
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-cyan-500/10">
              <FiCpu className="text-cyan-400" size={18} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-400">Total Agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <FiActivity className="text-emerald-400" size={18} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.active}</span>
          </div>
          <p className="text-sm text-gray-400">Active Agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-yellow-500/10">
              <FiPause className="text-yellow-400" size={18} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.paused}</span>
          </div>
          <p className="text-sm text-gray-400">Paused Agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-violet-500/10">
              <FiTrendingUp className="text-violet-400" size={18} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.avgResponse}</span>
          </div>
          <p className="text-sm text-gray-400">Avg Response Time</p>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search agents by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F0F12] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-[#0F0F12] border border-white/10 rounded-xl p-1">
            {['all', 'active', 'paused'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-white/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex bg-[#0F0F12] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white/10 text-cyan-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white/10 text-cyan-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiList size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Agents Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader />
        </div>
      ) : filteredAgents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 flex items-center justify-center mb-4">
            <FiCpu size={40} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? "No agents match your search criteria" 
              : isAtLimit
              ? `You have reached the limit (${agentCount}/${agentLimit}) for the ${plan} plan.`
              : "Create your first AI agent to get started"}
          </p>
          {(searchTerm || filterStatus !== 'all') ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Clear filters
            </button>
          ) : isAtLimit ? (
            <Button
              variant="outline"
              onClick={() => setUpgradeModalOpen(true)}
              icon={Sparkles}
            >
              Upgrade Plan to Add Agents
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setCreateModalOpen(true)}
              icon={FiPlus}
            >
              Create Agent
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            : "space-y-3"
          }
        >
          <AnimatePresence>
            {filteredAgents.map((agent) => (
              <motion.div
                key={agent._id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                className={`group relative bg-[#0F0F12] border border-white/10 rounded-2xl transition-all hover:border-white/20 hover:shadow-xl ${
                  viewMode === 'list' ? 'p-4' : 'p-5'
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                          <FiCpu className="text-cyan-400" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{agent?.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${agent?.isOnOff ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                            <span className={`text-xs font-medium ${agent?.isOnOff ? 'text-emerald-400' : 'text-yellow-400'}`}>
                              {agent?.isOnOff ? 'Active' : 'Paused'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgent(selectedAgent === agent._id ? null : agent._id);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiMoreVertical size={16} className="text-gray-400" />
                        </button>
                        {selectedAgent === agent._id && (
                          <div className="absolute right-0 mt-2 w-36 bg-[#1A1A1F] border border-white/10 rounded-lg shadow-xl z-10">
                            <button className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                              <FiPlay size={14} /> Start
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                              <FiPause size={14} /> Pause
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2">
                              <FiTrash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                      {agent?.description || 'No description provided'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-1.5">
                        <FiClock size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-500">Active</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FiActivity size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-500">Autonomous</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAgentClick(agent)}
                      className="w-full flex items-center justify-between px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group/btn"
                    >
                      <span className="text-sm font-medium text-gray-300">Manage Agent</span>
                      <FiChevronRight size={16} className="text-gray-400 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                ) : (
                  // List View
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                        <FiCpu className="text-cyan-400" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">{agent?.name}</h3>
                          <div className={`w-1.5 h-1.5 rounded-full ${agent?.isOnOff ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                          <span className={`text-xs font-medium ${agent?.isOnOff ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {agent?.isOnOff ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm truncate max-w-md">
                          {agent?.description || 'No description provided'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-1.5">
                          <FiClock size={12} className="text-gray-500" />
                          <span className="text-xs text-gray-500">Active</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5">
                          <FiActivity size={12} className="text-gray-500" />
                          <span className="text-xs text-gray-500">Autonomous</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAgentClick(agent)}
                      className="ml-4 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <FiChevronRight size={18} className="text-gray-400" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleAgentCreated}
        onPlanLimitExceeded={() => setUpgradeModalOpen(true)}
      />

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlan={plan}
      />
    </div>
  );
};

export default AllAgent;