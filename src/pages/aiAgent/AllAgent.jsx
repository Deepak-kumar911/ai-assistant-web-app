// pages/ai-agent/AllAgent.jsx (Task 39: Plan-Gated Agent Management - Refactored UI/UX)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiCpu, 
  FiPlus, 
  FiSearch, 
  FiMoreVertical, 
  FiPlay, 
  FiPause, 
  FiTrash2,
  FiLock,
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiChevronRight,
  FiGrid,
  FiList,
  FiArrowRight
} from 'react-icons/fi';
import { Zap, Sparkles } from 'lucide-react';
import { setAgentDetail } from '../../stateManagement/slices/aiAgentSlice';
import { 
  getAllUserAIagentApi, 
  getAccountUsageApi, 
  updateAgentStatusApi, 
  deleteAiAgentApi 
} from '../../api/authApi';
import Loader from '../../components/common/Loader';
import { Badge, Button, ConfirmDialog } from '../../components/ui';
import CreateAgentModal from '../../components/agent/CreateAgentModal';
import UpgradePlanModal from '../../components/plan/UpgradePlanModal';

export default function AllAgent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'unactive'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Role check: Only account owner can delete agents
  const auth = useSelector((state) => state?.auth);
  const currentRole = auth?.role || auth?.account?.role || auth?.details?.role || 'member';
  const isOwner = currentRole === 'owner';

  // Status & Delete management
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Plan gating and usage state
  const [usage, setUsage] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Close 3-dot dropdown menu on click outside or Escape
  useEffect(() => {
    if (!activeMenuId) return;

    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-agent-menu]')) {
        setActiveMenuId(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenuId]);

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

  const handleAgentCreated = () => {
    fetchAgents();
    fetchUsage();
  };

  // Helper to determine whether an agent is active or unactive
  const isAgentActive = (agent) => {
    if (agent?.status === 'unactive' || agent?.status === 'paused' || agent?.status === 'inactive') return false;
    if (agent?.isOnOff === false) return false;
    if (agent?.isActive === false) return false;
    return true;
  };

  // Usage calculations
  const agentCount = usage?.agentCount ?? list.length;
  const agentLimit = usage?.agentLimit ?? 1;
  const plan = usage?.plan ?? 'free';
  const isAtLimit = agentCount >= agentLimit;
  const percentUsed = Math.min(100, Math.round((agentCount / agentLimit) * 100));

  // Filter logic for search & active/unactive status
  const filteredAgents = list.filter((agent) => {
    const active = isAgentActive(agent);
    const matchesSearch =
      agent?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && active) ||
      (filterStatus === 'unactive' && !active);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: list.length,
    active: list.filter((a) => isAgentActive(a)).length,
    unactive: list.filter((a) => !isAgentActive(a)).length,
    avgResponse: '0.8s',
  };

  const handleAgentClick = (agent) => {
    dispatch(setAgentDetail(agent));
    navigate(`/ai-agent/manage/${agent._id}`);
  };

  const handleToggleStatus = async (agent, isOnOff) => {
    try {
      const res = await updateAgentStatusApi({
        agentId: agent._id,
        isOnOff,
        isActive: true,
      });
      if (res?.data?.status === 1 || res?.status === 200) {
        toast.success(isOnOff ? `${agent.name} is now Active` : `${agent.name} is now Unactive`);
        setList((prev) =>
          prev.map((a) => (a._id === agent._id ? { ...a, isOnOff, status: isOnOff ? 'active' : 'unactive' } : a))
        );
      }
    } catch (err) {
      console.error('Status toggle error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update agent status');
    } finally {
      setActiveMenuId(null);
    }
  };

  const confirmDeleteAgent = async () => {
    if (!agentToDelete) return;
    if (!isOwner) {
      toast.error('Only account owners have permission to delete an AI agent');
      setAgentToDelete(null);
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await deleteAiAgentApi(agentToDelete._id);
      if (res?.data?.status === 1 || res?.status === 200) {
        toast.success(`Agent "${agentToDelete.name}" deleted successfully`);
        setList((prev) => prev.filter((a) => a._id !== agentToDelete._id));
        setAgentToDelete(null);
        fetchUsage();
      } else {
        toast.error(res?.data?.message || 'Failed to delete agent');
      }
    } catch (err) {
      console.error('Delete agent error:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete agent and resources');
    } finally {
      setDeleteLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            AI Agents
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Deploy, monitor, and configure intelligent conversational agents
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 flex-wrap">
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
            className={isAtLimit ? 'opacity-60 cursor-not-allowed' : 'shadow-[0_0_14px_rgba(6,182,212,0.3)]'}
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

      {/* Plan Usage Banner */}
      <div className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isAtLimit ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Plan Usage</h3>
              <Badge
                variant={plan === 'ultra' ? 'amber' : plan === 'pro' ? 'cyan' : 'default'}
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
        <div className="flex items-center gap-4 flex-1 max-w-md w-full">
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAtLimit
                  ? 'bg-amber-500 shadow-[0_0_8px_#F59E0B]'
                  : percentUsed > 75
                  ? 'bg-amber-400'
                  : 'bg-cyan-400 shadow-[0_0_8px_#06B6D4]'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-[#94A3B8] shrink-0 font-mono">
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
            className="border-white/15 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-[#F8FAFC]"
          >
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg hover:border-white/20 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <FiCpu size={18} />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-xs text-[#94A3B8]">Total Agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg hover:border-white/20 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <FiActivity size={18} />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">{stats.active}</span>
          </div>
          <p className="text-xs text-[#94A3B8]">Active Agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg hover:border-white/20 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <FiPause size={18} />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">{stats.unactive}</span>
          </div>
          <p className="text-xs text-[#94A3B8]">Unactive Agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg hover:border-white/20 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
              <FiTrendingUp size={18} />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">{stats.avgResponse}</span>
          </div>
          <p className="text-xs text-[#94A3B8]">Avg Response</p>
        </motion.div>
      </div>

      {/* Search and Filter Toolbar - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="flex-1 relative min-w-0">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
          <input
            type="text"
            placeholder="Search agents by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F172A]/80 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all"
          />
        </div>

        {/* Filter Pills & View Mode */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end flex-wrap">
          {/* Status Filter Pills: All / Active / Unactive */}
          <div className="flex bg-[#0F172A]/80 border border-white/10 rounded-xl p-1 gap-1">
            {[
              { id: 'all', label: 'All', count: stats.total },
              { id: 'active', label: 'Active', count: stats.active },
              { id: 'unactive', label: 'Unactive', count: stats.unactive },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono opacity-80">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex bg-[#0F172A]/80 border border-white/10 rounded-xl p-1 gap-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white/10 text-cyan-400' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white/10 text-cyan-400' : 'text-[#94A3B8] hover:text-white'
              }`}
              title="List View"
              aria-label="List View"
            >
              <FiList size={16} />
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
          className="flex flex-col items-center justify-center py-16 text-center bg-[#0F172A]/40 border border-white/10 rounded-2xl p-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
            <FiCpu size={36} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5">No agents found</h3>
          <p className="text-xs sm:text-sm text-[#94A3B8] mb-5 max-w-sm">
            {searchTerm || filterStatus !== 'all'
              ? 'No agents match your current search or status filters.'
              : isAtLimit
              ? `You have reached the limit (${agentCount}/${agentLimit}) for the ${plan} plan.`
              : 'Create your first autonomous AI agent to get started.'}
          </p>
          {searchTerm || filterStatus !== 'all' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              Clear filters
            </Button>
          ) : isAtLimit ? (
            <Button variant="outline" onClick={() => setUpgradeModalOpen(true)} icon={Sparkles}>
              Upgrade Plan to Add Agents
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setCreateModalOpen(true)} icon={FiPlus}>
              Create Agent
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
              : 'space-y-3'
          }
        >
          <AnimatePresence>
            {filteredAgents.map((agent) => {
              const active = isAgentActive(agent);
              const agentImage = agent?.avatarUrl || agent?.image || agent?.avatar || agent?.photoUrl;
              const isMenuOpen = activeMenuId === agent._id;

              return (
                <motion.div
                  key={agent._id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={`group relative bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-200 hover:border-white/20 hover:shadow-2xl flex flex-col justify-between ${
                    viewMode === 'list' ? 'p-4' : 'p-5'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        {/* Top: Avatar/Image, Name, Status, 3-dot Menu */}
                        <div className="flex items-start justify-between gap-3 mb-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Show Agent Image if Available, otherwise Fallback Icon */}
                            <div className="relative shrink-0">
                              {agentImage ? (
                                <img
                                  src={agentImage}
                                  alt={agent?.name || 'Agent'}
                                  className="w-12 h-12 rounded-xl object-cover border border-white/15 shadow-md group-hover:border-cyan-400/50 transition-colors"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-md text-cyan-400">
                                  <FiCpu size={22} />
                                </div>
                              )}
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[#0F172A] ${
                                  active ? 'bg-emerald-500 shadow-[0_0_6px_#10B981]' : 'bg-amber-500'
                                }`}
                              />
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-bold text-white text-base truncate group-hover:text-cyan-300 transition-colors">
                                {agent?.name || 'Unnamed Agent'}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className={`text-xs font-semibold ${
                                    active ? 'text-emerald-400' : 'text-amber-400'
                                  }`}
                                >
                                  {active ? 'Active' : 'Unactive'}
                                </span>
                                {agent?.role && (
                                  <span className="text-[11px] text-[#94A3B8] font-medium truncate capitalize">
                                    • {agent.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 3-Dot Action Menu with Click-Outside Handling */}
                          <div className="relative" data-agent-menu="true">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : agent._id);
                              }}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                isMenuOpen
                                  ? 'bg-white/15 text-white'
                                  : 'text-[#94A3B8] hover:text-white hover:bg-white/10'
                              }`}
                              aria-label="Agent options"
                            >
                              <FiMoreVertical size={16} />
                            </button>

                            <AnimatePresence>
                              {isMenuOpen && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute right-0 mt-2 w-44 bg-[#131D31]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl z-30 overflow-hidden py-1 select-none"
                                >
                                  {/* Set Unactive when active; Set Active when unactive */}
                                  {active ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleStatus(agent, false);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-amber-300 hover:bg-white/[0.08] transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                      <FiPause size={14} className="text-amber-400" />
                                      <span>Set Unactive</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleStatus(agent, true);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-emerald-300 hover:bg-white/[0.08] transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                      <FiPlay size={14} className="text-emerald-400" />
                                      <span>Set Active</span>
                                    </button>
                                  )}

                                  <div className="border-t border-white/[0.08] my-1" />

                                  {isOwner ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        setAgentToDelete(agent);
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                      <FiTrash2 size={14} />
                                      <span>Delete Agent</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toast.info('Only account owners have permission to delete an agent.');
                                      }}
                                      className="w-full px-3.5 py-2 text-left text-xs text-[#64748B] hover:bg-white/5 transition-colors flex items-center gap-2 cursor-not-allowed opacity-60"
                                      title="Only account owners can delete an agent"
                                    >
                                      <FiLock size={12} />
                                      <span>Delete (Owner only)</span>
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[#94A3B8] text-xs mb-4 line-clamp-2 leading-relaxed">
                          {agent?.description || 'No description provided for this autonomous agent.'}
                        </p>

                        {/* Agent Info Badges */}
                        <div className="flex items-center gap-3 mb-4 pt-3 border-t border-white/[0.08] text-xs text-[#64748B]">
                          <div className="flex items-center gap-1.5">
                            <FiClock size={13} className="text-cyan-400/80" />
                            <span>Autonomous</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiActivity size={13} className="text-emerald-400/80" />
                            <span>Live Ready</span>
                          </div>
                        </div>
                      </div>

                      {/* Prominent High-Focus Primary Action Button */}
                      <button
                        type="button"
                        onClick={() => handleAgentClick(agent)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_14px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all cursor-pointer group/btn select-none"
                      >
                        <span>Manage Agent</span>
                        <FiArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ) : (
                    // List View
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Avatar / Image */}
                        <div className="relative shrink-0">
                          {agentImage ? (
                            <img
                              src={agentImage}
                              alt={agent?.name || 'Agent'}
                              className="w-10 h-10 rounded-xl object-cover border border-white/15 shadow-md"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-md text-cyan-400">
                              <FiCpu size={18} />
                            </div>
                          )}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#0F172A] ${
                              active ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm truncate">{agent?.name}</h3>
                            <Badge variant={active ? 'emerald' : 'amber'} size="sm" styleType="subtle">
                              {active ? 'Active' : 'Unactive'}
                            </Badge>
                          </div>
                          <p className="text-[#94A3B8] text-xs truncate mt-0.5 max-w-lg">
                            {agent?.description || 'No description provided'}
                          </p>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        {/* High-Focus Manage Agent Button */}
                        <button
                          type="button"
                          onClick={() => handleAgentClick(agent)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-[#080C14] shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:shadow-[0_0_18px_rgba(6,182,212,0.35)] active:scale-95 transition-all cursor-pointer group/listbtn select-none"
                        >
                          <span>Manage</span>
                          <FiChevronRight size={14} className="group-hover/listbtn:translate-x-0.5 transition-transform" />
                        </button>

                        {/* 3-Dot Menu */}
                        <div className="relative" data-agent-menu="true">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : agent._id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isMenuOpen ? 'bg-white/15 text-white' : 'text-[#94A3B8] hover:text-white hover:bg-white/10'
                            }`}
                            aria-label="Agent options"
                          >
                            <FiMoreVertical size={16} />
                          </button>

                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 mt-2 w-44 bg-[#131D31]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl z-30 overflow-hidden py-1 select-none"
                              >
                                {active ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleStatus(agent, false);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-amber-300 hover:bg-white/[0.08] transition-colors flex items-center gap-2 cursor-pointer"
                                  >
                                    <FiPause size={14} className="text-amber-400" />
                                    <span>Set Unactive</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleStatus(agent, true);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-emerald-300 hover:bg-white/[0.08] transition-colors flex items-center gap-2 cursor-pointer"
                                  >
                                    <FiPlay size={14} className="text-emerald-400" />
                                    <span>Set Active</span>
                                  </button>
                                )}

                                <div className="border-t border-white/[0.08] my-1" />

                                {isOwner ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setAgentToDelete(agent);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                                  >
                                    <FiTrash2 size={14} />
                                    <span>Delete Agent</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast.info('Only account owners have permission to delete an agent.');
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs text-[#64748B] hover:bg-white/5 transition-colors flex items-center gap-2 cursor-not-allowed opacity-60"
                                    title="Only account owners can delete an agent"
                                  >
                                    <FiLock size={12} />
                                    <span>Delete (Owner only)</span>
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
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

      {/* User-Friendly Delete Agent Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(agentToDelete)}
        onClose={() => setAgentToDelete(null)}
        onConfirm={confirmDeleteAgent}
        title={`Delete "${agentToDelete?.name}"?`}
        description={`Are you sure you want to delete ${agentToDelete?.name || 'this agent'}? This will permanently remove the agent and all its associated workflows, conversation history, and knowledge base documents. This action cannot be undone.`}
        confirmText="Yes, Delete Agent"
        cancelText="Keep Agent"
        variant="destructive"
        loading={deleteLoading}
      />
    </div>
  );
}