import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiRefreshCw,
  FiPlus,
  FiZap,
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiMessageSquare,
  FiCheckSquare,
  FiUsers,
  FiCpu,
  FiGlobe,
  FiInstagram,
  FiCalendar,
  FiFilter,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowUpRight,
  FiBarChart2,
  FiLayers,
  FiChevronDown,
  FiCheck,
} from 'react-icons/fi';
import { getDashboardSummaryApi } from '../api/dashboardApi';
import { getApiWithToken } from '../api/apiInterface';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const PERIOD_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last_week', label: 'Last 7 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'custom', label: 'Custom Range' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  // Filter States
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('last_week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartMetric, setChartMetric] = useState('both'); // 'both' | 'conversations' | 'messages'

  // Custom Dropdown Open States & Refs
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const agentDropdownRef = useRef(null);
  const periodDropdownRef = useRef(null);

  // Data States
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Close custom dropdowns on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(e.target)) {
        setAgentDropdownOpen(false);
      }
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target)) {
        setPeriodDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAgentDropdownOpen(false);
        setPeriodDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load available agents for the filter dropdown
  useEffect(() => {
    getApiWithToken('ai-agent/all')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setAgents(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load agents list', err));
  }, []);

  // Fetch Dashboard Summary
  const fetchSummary = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const params = {
          agentId: selectedAgent,
          period: selectedPeriod,
        };
        if (selectedPeriod === 'custom') {
          if (startDate) params.startDate = startDate;
          if (endDate) params.endDate = endDate;
        }

        const res = await getDashboardSummaryApi(params);
        if (res.data?.success) {
          setSummary(res.data.data);
        } else {
          setError(res.data?.message || 'Failed to load dashboard operational metrics');
        }
      } catch (err) {
        console.error('Error loading dashboard summary', err);
        setError(err.response?.data?.message || err.message || 'Error communicating with server');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedAgent, selectedPeriod, startDate, endDate]
  );

  // Initial and reactive fetch on filter change
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Derived Values
  const periodLabel = useMemo(() => {
    const found = PERIOD_OPTIONS.find((p) => p.id === selectedPeriod);
    return found ? found.label : 'Last 7 Days';
  }, [selectedPeriod]);

  const selectedAgentData = useMemo(() => {
    if (selectedAgent === 'all') return null;
    return agents.find((a) => a._id === selectedAgent) || null;
  }, [agents, selectedAgent]);

  const isEmptyAccount = useMemo(() => {
    if (!summary) return false;
    const { agentUsage, conversationVolume, taskSubmissions } = summary;
    return (
      (agentUsage?.currentAgentCount || 0) === 0 &&
      (conversationVolume?.total || 0) === 0 &&
      (taskSubmissions?.total || 0) === 0
    );
  }, [summary]);

  // Max value for chart scaling
  const maxChartValue = useMemo(() => {
    if (!summary?.timeseries || summary.timeseries.length === 0) return 10;
    let max = 1;
    summary.timeseries.forEach((item) => {
      if (item.conversations > max) max = item.conversations;
      if (item.messages > max) max = item.messages;
    });
    return Math.max(10, max);
  }, [summary?.timeseries]);

  if (loading && !summary) {
    return (
      <div className="py-20">
        <LoadingState
          message="Aggregating workspace operational metrics..."
          description="Fetching agent capacity, live conversation volumes, and platform statuses."
        />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="py-20">
        <ErrorState
          title="Could not load workspace dashboard"
          description={error}
          onRetry={() => fetchSummary()}
          retryText="Reload Dashboard"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
              Operational Intelligence
            </span>
            <span className="text-slate-600">•</span>
            <Badge variant="cyan" size="sm" className="uppercase font-mono font-bold tracking-wider shadow-[0_0_8px_rgba(6,182,212,0.25)]">
              {summary?.agentUsage?.plan || 'Free'} Plan
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {summary?.accountName ? `${summary.accountName} Dashboard` : 'Workspace Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 leading-relaxed">
            Real-time analytics, AI agent utilization, and connected integration health.
          </p>
        </div>

        {/* Refresh Button - Premium Glassmorphic with Feedback */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchSummary(true)}
            disabled={refreshing}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/10 hover:border-cyan-500/40 text-[#F8FAFC] transition-all cursor-pointer shadow-sm hover:shadow-[0_0_14px_rgba(6,182,212,0.2)] focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed group select-none"
            aria-label="Refresh operational metrics"
          >
            <FiRefreshCw
              size={14}
              className={`transition-transform duration-500 ${
                refreshing ? 'animate-spin text-cyan-400' : 'text-[#94A3B8] group-hover:text-cyan-300'
              }`}
            />
            <span className="text-xs font-semibold tracking-wide">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      {/* 2. FILTER TOOLBAR - Glassmorphism & Custom Themed Dropdowns */}
      <div className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Custom Themed Agent Selector */}
          <div className="flex-1 sm:max-w-xs relative" ref={agentDropdownRef}>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] mb-1.5">
              Filter by Agent
            </label>
            <button
              type="button"
              onClick={() => {
                setAgentDropdownOpen((prev) => !prev);
                setPeriodDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-left bg-[#131D31]/90 hover:bg-[#1E293B] border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                agentDropdownOpen
                  ? 'border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)] text-[#F8FAFC]'
                  : 'border-white/10 hover:border-white/20 text-[#CBD5E1]'
              }`}
              aria-haspopup="listbox"
              aria-expanded={agentDropdownOpen}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <FiCpu size={13} />
                </div>
                <div className="truncate text-xs font-medium">
                  {selectedAgent === 'all' ? (
                    <span>All Workspace Agents <span className="text-[10px] text-cyan-400 font-mono">({agents.length})</span></span>
                  ) : (
                    <span>{selectedAgentData?.name || 'Selected Agent'}</span>
                  )}
                </div>
              </div>
              <FiChevronDown
                size={14}
                className={`text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                  agentDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>

            {/* Custom Dropdown Options List */}
            <AnimatePresence>
              {agentDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute left-0 top-full mt-2 w-full min-w-[280px] bg-[#0F172A]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-1.5 z-50 overflow-hidden select-none"
                  role="listbox"
                >
                  <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                    {/* All Agents Option */}
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedAgent === 'all'}
                      onClick={() => {
                        setSelectedAgent('all');
                        setAgentDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                        selectedAgent === 'all'
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'text-[#CBD5E1] hover:bg-white/[0.06] hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <FiGrid size={11} />
                        </div>
                        <span>All Workspace Agents</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">
                          {agents.length}
                        </span>
                        {selectedAgent === 'all' && <FiCheck size={14} className="text-cyan-400" />}
                      </div>
                    </button>

                    <div className="border-t border-white/[0.08] my-1" />

                    {/* Agent Items */}
                    {agents.length > 0 ? (
                      agents.map((agent) => {
                        const isSelected = selectedAgent === agent._id;
                        return (
                          <button
                            key={agent._id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedAgent(agent._id);
                              setAgentDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                              isSelected
                                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                : 'text-[#CBD5E1] hover:bg-white/[0.06] hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-5 h-5 rounded-md bg-white/10 text-[#94A3B8] flex items-center justify-center shrink-0">
                                <FiCpu size={11} />
                              </div>
                              <div className="truncate">
                                <span className="block truncate font-semibold text-white">
                                  {agent.name || 'Unnamed Agent'}
                                </span>
                                {agent.role && (
                                  <span className="text-[10px] text-[#94A3B8] capitalize block truncate">
                                    {agent.role}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && <FiCheck size={14} className="text-cyan-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-4 text-center text-xs text-[#94A3B8]">
                        No individual agents found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Custom Themed Date Period Selector */}
          <div className="flex-1 sm:max-w-xs relative" ref={periodDropdownRef}>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] mb-1.5">
              Filter by Date
            </label>
            <button
              type="button"
              onClick={() => {
                setPeriodDropdownOpen((prev) => !prev);
                setAgentDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-left bg-[#131D31]/90 hover:bg-[#1E293B] border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                periodDropdownOpen
                  ? 'border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)] text-[#F8FAFC]'
                  : 'border-white/10 hover:border-white/20 text-[#CBD5E1]'
              }`}
              aria-haspopup="listbox"
              aria-expanded={periodDropdownOpen}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <FiCalendar size={13} />
                </div>
                <span className="truncate text-xs font-medium">
                  {periodLabel}
                </span>
              </div>
              <FiChevronDown
                size={14}
                className={`text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                  periodDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>

            {/* Custom Period Options List */}
            <AnimatePresence>
              {periodDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-full min-w-[220px] bg-[#0F172A]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-1.5 z-50 overflow-hidden select-none"
                  role="listbox"
                >
                  <div className="space-y-1">
                    {PERIOD_OPTIONS.map((period) => {
                      const isSelected = selectedPeriod === period.id;
                      return (
                        <button
                          key={period.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSelectedPeriod(period.id);
                            setPeriodDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              : 'text-[#CBD5E1] hover:bg-white/[0.06] hover:text-white border border-transparent'
                          }`}
                        >
                          <span>{period.label}</span>
                          {isSelected && <FiCheck size={14} className="text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Custom Date Range Picker (collapsible) */}
        <AnimatePresence>
          {selectedPeriod === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 mt-4 border-t border-white/[0.08] flex flex-wrap items-center gap-3 text-xs text-[#CBD5E1]"
            >
              <div className="flex items-center gap-2">
                <FiCalendar className="text-cyan-400" />
                <span className="font-medium">Custom Date Window:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#131D31] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                />
                <span className="text-[#64748B]">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#131D31] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                />
                <button
                  onClick={() => fetchSummary(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 active:scale-95 transition-all font-semibold text-xs cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                >
                  Apply Window
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. FIRST-RUN / EMPTY STATE (Brand-new Account) */}
      {isEmptyAccount ? (
        <EmptyState
          icon={FiCpu}
          title="Welcome to your AI Assistant Dashboard!"
          description="Your workspace is set up and ready. Deploy your first AI Agent to handle website chats and Instagram inquiries, or connect your customer communication channels."
          action={{
            label: 'Create First AI Agent',
            icon: FiPlus,
            onClick: () => navigate('/ai-agent'),
          }}
          secondaryAction={{
            label: 'View Connected Channels',
            icon: FiGlobe,
            onClick: () => navigate('/ai-agent'),
          }}
          className="my-8 py-16"
        />
      ) : (
        <>
          {/* 4. STAT CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Agent Capacity */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <StatCard
                label={`Agent Capacity (${summary?.agentUsage?.plan?.toUpperCase() || 'FREE'})`}
                value={`${summary?.agentUsage?.currentAgentCount || 0} / ${summary?.agentUsage?.maxAgents || 1}`}
                change={`${summary?.agentUsage?.usagePercent || 0}% used`}
                icon={FiCpu}
                color="cyan"
              />
            </motion.div>

            {/* Card 2: Conversation Volume */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <StatCard
                label={`Conversations (${periodLabel})`}
                value={(summary?.conversationVolume?.periodCount ?? summary?.conversationVolume?.thisWeek ?? 0).toLocaleString()}
                change={`+${summary?.conversationVolume?.periodMessages ?? summary?.conversationVolume?.thisWeekMessages ?? 0} msgs`}
                icon={FiMessageSquare}
                color="violet"
              />
            </motion.div>

            {/* Card 3: Captured Task Submissions */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <StatCard
                label="Captured Submissions"
                value={(summary?.taskSubmissions?.periodCount ?? summary?.taskSubmissions?.thisWeek ?? 0).toLocaleString()}
                change={`${summary?.taskSubmissions?.pendingReview || 0} pending`}
                icon={FiCheckSquare}
                color="emerald"
              />
            </motion.div>

            {/* Card 4: Instagram Automation Impact */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <StatCard
                label="Instagram DMs Handled"
                value={(summary?.instagramAutomation?.dmsHandled || 0).toLocaleString()}
                change={`${summary?.instagramAutomation?.timeSavedHours || 0}h saved`}
                icon={FiZap}
                color="blue"
              />
            </motion.div>
          </div>

          {/* 5. VISUAL TIMESERIES CHART & RECENT ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Activity Trend Chart */}
            <div className="lg:col-span-2 bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                    <FiBarChart2 className="text-cyan-400" />
                    <span>Conversation & Message Activity Trend</span>
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Daily breakdown for {periodLabel.toLowerCase()}
                    {selectedAgent !== 'all' && ` • Filtered to selected agent`}
                  </p>
                </div>

                {/* Metric Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#131D31] p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    onClick={() => setChartMetric('both')}
                    className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
                      chartMetric === 'both'
                        ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Both
                  </button>
                  <button
                    onClick={() => setChartMetric('conversations')}
                    className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
                      chartMetric === 'conversations'
                        ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Conversations
                  </button>
                  <button
                    onClick={() => setChartMetric('messages')}
                    className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
                      chartMetric === 'messages'
                        ? 'bg-violet-500/20 text-violet-300 shadow-[0_0_8px_rgba(139,92,246,0.25)]'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Messages
                  </button>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs mb-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-[#CBD5E1]">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4]" /> Conversations
                </span>
                <span className="flex items-center gap-1.5 text-[#CBD5E1]">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_6px_#8B5CF6]" /> Messages
                </span>
                <span className="flex items-center gap-1.5 text-[#94A3B8] text-[11px] sm:ml-auto">
                  Total: {summary?.conversationVolume?.total || 0} convs ({summary?.conversationVolume?.totalMessages || 0} msgs)
                </span>
              </div>

              {/* Visual CSS / SVG Bar Chart */}
              <div className="h-56 pt-4 flex items-end justify-between gap-1 sm:gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto">
                {summary?.timeseries && summary.timeseries.length > 0 ? (
                  summary.timeseries.map((item, idx) => {
                    const convHeight = Math.min(100, Math.max(item.conversations > 0 ? 15 : 4, (item.conversations / maxChartValue) * 100));
                    const msgHeight = Math.min(100, Math.max(item.messages > 0 ? 15 : 4, (item.messages / maxChartValue) * 100));
                    const dateDisplay = item.date.slice(5); // MM-DD

                    return (
                      <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 h-full justify-end group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                          <div className="bg-[#1E293B]/95 backdrop-blur-xl border border-white/15 text-white text-[11px] px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap">
                            <p className="font-bold text-[#CBD5E1] border-b border-white/10 pb-1 mb-1">{item.date}</p>
                            <p className="text-cyan-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              Conversations: <span className="font-bold">{item.conversations}</span>
                            </p>
                            <p className="text-violet-400 flex items-center gap-1.5 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                              Messages: <span className="font-bold">{item.messages}</span>
                            </p>
                            {item.submissions > 0 && (
                              <p className="text-emerald-400 flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Submissions: <span className="font-bold">{item.submissions}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Visual Bars */}
                        <div className="w-full flex items-end justify-center gap-1 h-full">
                          {(chartMetric === 'both' || chartMetric === 'conversations') && (
                            <div
                              style={{ height: `${convHeight}%` }}
                              className="w-1/2 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all group-hover:brightness-125 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                            />
                          )}
                          {(chartMetric === 'both' || chartMetric === 'messages') && (
                            <div
                              style={{ height: `${msgHeight}%` }}
                              className="w-1/2 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-md transition-all group-hover:brightness-125 shadow-[0_0_8px_rgba(139,92,246,0.15)]"
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-[#64748B] truncate mt-1 group-hover:text-white transition-colors">
                          {dateDisplay}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#64748B] text-xs">
                    No activity recorded for this period.
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Task Submissions Pipeline */}
            <div className="space-y-6">
              <div className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                    <FiCheckSquare className="text-emerald-400" />
                    <span>Lead & Task Submissions</span>
                  </h3>
                  <button
                    onClick={() => navigate('/tasks')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold cursor-pointer group"
                  >
                    <span>View all</span>
                    <FiArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>

                {/* Pending Review Banner */}
                {summary?.taskSubmissions?.pendingReview > 0 ? (
                  <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle className="text-amber-400" size={16} />
                      <span className="text-xs text-amber-200 font-medium">
                        {summary.taskSubmissions.pendingReview} submission(s) pending review
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/tasks')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold hover:bg-amber-500/30 active:scale-95 transition-all cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                ) : (
                  <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-400" size={16} />
                    <span className="text-xs text-emerald-200 font-medium">All task submissions reviewed</span>
                  </div>
                )}

                {/* Breakdown bars */}
                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[#CBD5E1] mb-1.5">
                      <span>Form Inquiries</span>
                      <span className="font-bold text-white">{summary?.taskSubmissions?.breakdown?.forms || 0}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${
                            summary?.taskSubmissions?.total > 0
                              ? ((summary.taskSubmissions.breakdown.forms || 0) / summary.taskSubmissions.total) * 100
                              : 0
                          }%`,
                        }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#CBD5E1] mb-1.5">
                      <span>Bookings & Appointments</span>
                      <span className="font-bold text-white">{summary?.taskSubmissions?.breakdown?.bookings || 0}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${
                            summary?.taskSubmissions?.total > 0
                              ? ((summary.taskSubmissions.breakdown.bookings || 0) / summary.taskSubmissions.total) * 100
                              : 0
                          }%`,
                        }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Total captured across all time</span>
                  <span className="font-bold text-white text-sm">{summary?.taskSubmissions?.total || 0}</span>
                </div>
              </div>

              {/* Instagram Automation Card */}
              <div className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                    <FiInstagram className="text-pink-400" />
                    <span>Instagram Automation</span>
                  </h3>
                  <Badge variant="cyan" size="sm">
                    {summary?.instagramAutomation?.responseRate || 100}% Reply Rate
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[11px] text-[#94A3B8]">Automated Leads</p>
                    <p className="text-xl font-bold text-white mt-1">
                      {summary?.instagramAutomation?.leadsCaptured || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[11px] text-[#94A3B8]">Hours Saved</p>
                    <p className="text-xl font-bold text-white mt-1">
                      {summary?.instagramAutomation?.timeSavedHours || 0}h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. CONNECTED PLATFORMS HEALTH OVERVIEW */}
          <div className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <FiGlobe className="text-cyan-400" />
                  <span>Connected Platform Integrations</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Live health status across website chat widgets and social channels
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
                  {summary?.connectedIntegrations?.connectedCount || 0} Connected
                </span>
                {summary?.connectedIntegrations?.needsAttentionCount > 0 && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
                      {summary?.connectedIntegrations?.needsAttentionCount} Needs Attention
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Website Channel Card */}
              <div className="p-4 rounded-xl bg-[#131D31]/70 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] shrink-0">
                    <FiGlobe size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Website Chat Widget</h4>
                    <p className="text-xs text-[#94A3B8]">Embeddable customer service agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="emerald" size="sm">
                    Active
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/ai-agent')}
                    className="text-xs text-[#94A3B8] hover:text-white"
                  >
                    Configure
                  </Button>
                </div>
              </div>

              {/* Instagram Channel Card */}
              {(() => {
                const igPlatform = summary?.connectedIntegrations?.platforms?.find((p) => p.type === 'instagram');
                const isConnected = igPlatform?.status === 'connected';

                return (
                  <div className="p-4 rounded-xl bg-[#131D31]/70 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)] shrink-0">
                        <FiInstagram size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Instagram DM Automation</h4>
                        <p className="text-xs text-[#94A3B8]">
                          {igPlatform
                            ? isConnected
                              ? 'Active & replying to direct messages'
                              : igPlatform.statusReason || 'Authentication needs attention'
                            : 'Not yet connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {igPlatform ? (
                        isConnected ? (
                          <Badge variant="emerald" size="sm">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="amber" size="sm">
                            Needs Attention
                          </Badge>
                        )
                      ) : (
                        <Badge variant="gray" size="sm">
                          Disconnected
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/ai-agent')}
                        className="text-xs text-[#94A3B8] hover:text-white"
                      >
                        {isConnected ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}