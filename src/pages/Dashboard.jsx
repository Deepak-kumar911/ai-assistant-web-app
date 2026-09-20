import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  { id: 'custom', label: 'Custom' },
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

  // Data States
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
      <div className="py-16">
        <LoadingState
          message="Aggregating workspace operational metrics..."
          description="Fetching agent capacity, live conversation volumes, and platform statuses."
        />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="py-16">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              Operational Intelligence
            </span>
            <span className="text-gray-600">•</span>
            <Badge variant="cyan" size="sm" className="uppercase font-mono">
              {summary?.agentUsage?.plan || 'Free'} Plan
            </Badge>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            {summary?.accountName ? `${summary.accountName} Dashboard` : 'Workspace Dashboard'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time analytics, AI agent utilization, and connected integration health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchSummary(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-[#13131A] border-white/10 hover:border-cyan-500/30"
          >
            <FiRefreshCw size={14} className={refreshing ? 'animate-spin text-cyan-400' : 'text-gray-400'} />
            <span className="text-xs font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* 2. FILTER TOOLBAR */}
      <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Agent Selector Dropdown */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
              <FiCpu size={16} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-0.5">
                Filter by Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full bg-[#16161F] text-sm text-white font-medium border border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                <option value="all">All Workspace Agents ({agents.length})</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name || 'Unnamed Agent'} {agent.role ? `(${agent.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Period Selector Dropdown */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
              <FiCalendar size={16} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-semibold text-gray-400 mb-0.5">
                Filter by Date
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-[#16161F] text-sm text-white font-medium border border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                {PERIOD_OPTIONS.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Custom Date Range Picker (collapsible) */}
        <AnimatePresence>
          {selectedPeriod === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 mt-3 border-t border-white/5 flex flex-wrap items-center gap-3 text-xs text-gray-300"
            >
              <div className="flex items-center gap-2">
                <FiCalendar className="text-cyan-400" />
                <span>Custom Date Window:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#16161F] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#16161F] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => fetchSummary(true)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors font-medium text-xs"
                >
                  Apply
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
            <div className="lg:col-span-2 bg-[#0F0F14] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <FiBarChart2 className="text-cyan-400" />
                    <span>Conversation & Message Activity Trend</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Daily breakdown for {periodLabel.toLowerCase()}
                    {selectedAgent !== 'all' && ` • Filtered to selected agent`}
                  </p>
                </div>

                {/* Metric Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#16161F] p-1 rounded-xl border border-white/5 text-xs">
                  <button
                    onClick={() => setChartMetric('both')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      chartMetric === 'both' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Both
                  </button>
                  <button
                    onClick={() => setChartMetric('conversations')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      chartMetric === 'conversations' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Conversations
                  </button>
                  <button
                    onClick={() => setChartMetric('messages')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      chartMetric === 'messages' ? 'bg-violet-500/20 text-violet-300 font-medium' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Messages
                  </button>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs mb-4">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Conversations
                </span>
                <span className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400" /> Messages
                </span>
                <span className="flex items-center gap-1.5 text-gray-400 text-[11px] ml-auto">
                  Total Volume: {summary?.conversationVolume?.total || 0} convs ({summary?.conversationVolume?.totalMessages || 0} msgs)
                </span>
              </div>

              {/* Visual CSS / SVG Bar Chart */}
              <div className="h-56 pt-4 flex items-end justify-between gap-1 sm:gap-2 border-b border-white/5 pb-2 overflow-x-auto">
                {summary?.timeseries && summary.timeseries.length > 0 ? (
                  summary.timeseries.map((item, idx) => {
                    const convHeight = Math.min(100, Math.max(item.conversations > 0 ? 15 : 4, (item.conversations / maxChartValue) * 100));
                    const msgHeight = Math.min(100, Math.max(item.messages > 0 ? 15 : 4, (item.messages / maxChartValue) * 100));
                    const dateDisplay = item.date.slice(5); // MM-DD

                    return (
                      <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 h-full justify-end group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                          <div className="bg-[#1C1C28] border border-white/10 text-white text-[11px] px-2.5 py-1.5 rounded-xl shadow-2xl whitespace-nowrap">
                            <p className="font-semibold text-gray-300 border-b border-white/5 pb-1 mb-1">{item.date}</p>
                            <p className="text-cyan-400">Conversations: {item.conversations}</p>
                            <p className="text-violet-400">Messages: {item.messages}</p>
                            {item.submissions > 0 && <p className="text-emerald-400">Submissions: {item.submissions}</p>}
                          </div>
                        </div>

                        {/* Visual Bars */}
                        <div className="w-full flex items-end justify-center gap-1 h-full">
                          {(chartMetric === 'both' || chartMetric === 'conversations') && (
                            <div
                              style={{ height: `${convHeight}%` }}
                              className="w-1/2 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all group-hover:brightness-125"
                            />
                          )}
                          {(chartMetric === 'both' || chartMetric === 'messages') && (
                            <div
                              style={{ height: `${msgHeight}%` }}
                              className="w-1/2 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-md transition-all group-hover:brightness-125"
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 truncate mt-1 group-hover:text-white transition-colors">
                          {dateDisplay}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                    No activity recorded for this period.
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Task Submissions Pipeline */}
            <div className="space-y-6">
              <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <FiCheckSquare className="text-emerald-400" />
                    <span>Lead & Task Submissions</span>
                  </h3>
                  <button
                    onClick={() => navigate('/tasks')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-medium"
                  >
                    <span>View all</span>
                    <FiArrowUpRight size={12} />
                  </button>
                </div>

                {/* Pending Review Banner */}
                {summary?.taskSubmissions?.pendingReview > 0 ? (
                  <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle className="text-amber-400" size={16} />
                      <span className="text-xs text-amber-200 font-medium">
                        {summary.taskSubmissions.pendingReview} submission(s) pending review
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/tasks')}
                      className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-semibold hover:bg-amber-500/30"
                    >
                      Review
                    </button>
                  </div>
                ) : (
                  <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-400" size={16} />
                    <span className="text-xs text-emerald-200 font-medium">All task submissions reviewed</span>
                  </div>
                )}

                {/* Breakdown bars */}
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>Form Inquiries</span>
                      <span className="font-semibold text-white">{summary?.taskSubmissions?.breakdown?.forms || 0}</span>
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
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>Bookings & Appointments</span>
                      <span className="font-semibold text-white">{summary?.taskSubmissions?.breakdown?.bookings || 0}</span>
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
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span>Total captured across all time</span>
                  <span className="font-bold text-white text-sm">{summary?.taskSubmissions?.total || 0}</span>
                </div>
              </div>

              {/* Instagram Automation Card */}
              <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <FiInstagram className="text-pink-400" />
                    <span>Instagram Automation</span>
                  </h3>
                  <Badge variant="cyan" size="sm">
                    {summary?.instagramAutomation?.responseRate || 100}% Reply Rate
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[11px] text-gray-400">Automated Leads</p>
                    <p className="text-xl font-bold text-white mt-0.5">
                      {summary?.instagramAutomation?.leadsCaptured || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[11px] text-gray-400">Hours Saved</p>
                    <p className="text-xl font-bold text-white mt-0.5">
                      {summary?.instagramAutomation?.timeSavedHours || 0}h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. CONNECTED PLATFORMS HEALTH OVERVIEW */}
          <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FiGlobe className="text-cyan-400" />
                  <span>Connected Platform Integrations</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Live health status across website chat widgets and social channels
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-medium">
                  {summary?.connectedIntegrations?.connectedCount || 0} Connected
                </span>
                {summary?.connectedIntegrations?.needsAttentionCount > 0 && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-amber-400 font-medium">
                      {summary?.connectedIntegrations?.needsAttentionCount} Needs Attention
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Website Channel Card */}
              <div className="p-4 rounded-xl bg-[#16161F] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <FiGlobe size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Website Chat Widget</h4>
                    <p className="text-xs text-gray-400">Embeddable customer service agent</p>
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
                    className="text-xs text-gray-400 hover:text-white"
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
                  <div className="p-4 rounded-xl bg-[#16161F] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                        <FiInstagram size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Instagram DM Automation</h4>
                        <p className="text-xs text-gray-400">
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
                        className="text-xs text-gray-400 hover:text-white"
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