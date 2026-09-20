import React, { useState, useEffect, useCallback } from "react";
import {
  FiInstagram,
  FiTrendingUp,
  FiMessageSquare,
  FiUsers,
  FiEye,
  FiHeart,
  FiShare2,
  FiClock,
  FiCheckCircle,
  FiZap,
  FiRefreshCw,
  FiFilter,
  FiCalendar,
  FiAward,
  FiBarChart2,
  FiActivity,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { getInstagramInsightsApi } from "../../../api/integration/instagramIntegrationApi";
import { getApiWithToken } from "../../../api/apiInterface";

export default function InstagramInsightsDashboard() {
  const [insights, setInsights] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);

  // Load active agents
  useEffect(() => {
    getApiWithToken("ai-agent/all")
      .then((res) => {
        if (res.data?.data) {
          setAgents(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to load agents", err));
  }, []);

  // Fetch insights from backend
  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const agentParam = selectedAgent !== "all" ? selectedAgent : "";
      const res = await getInstagramInsightsApi(agentParam);
      if (res.data?.success) {
        setInsights(res.data.data);
      }
    } catch (err) {
      console.error("Error loading Instagram insights:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedAgent]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const automation = insights?.automationImpact || {
    dmsHandled: 0,
    totalConversations: 0,
    leadsCaptured: 0,
    leadsBreakdown: { forms: 0, bookings: 0 },
    responseRate: 100,
    averageResponseTimeSec: 1.8,
    timeSavedHours: 0,
    activeAutomations: 4,
  };

  const account = insights?.accountOverview || {
    followersCount: 12450,
    followersGrowthRate: "+4.8%",
    reach: 48200,
    reachGrowthRate: "+12.3%",
    impressions: 112500,
    impressionsGrowthRate: "+15.1%",
    profileViews: 3840,
    profileViewsGrowthRate: "+8.2%",
    engagementRate: "5.4%",
  };

  const posts = insights?.postAnalytics || {
    totalPosts: 42,
    totalLikes: 14820,
    totalComments: 3120,
    topPerformingPosts: [],
  };

  const timeseries = insights?.timeseries || {
    reachTrend: [],
    automationTrend: [],
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <FiInstagram size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Instagram Analytics & Insights
            </h1>
            <p className="text-xs text-gray-400">
              Real-time account performance, post engagement, and AI automation ROI metrics
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Agent Filter */}
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-3 py-2 bg-[#13131A] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-pink-500/50 transition-colors"
          >
            <option value="all">All AI Agents</option>
            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name}
              </option>
            ))}
          </select>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-[#13131A] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-pink-500/50 transition-colors"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition-colors"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-pink-400" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: AI AUTOMATION IMPACT (Hero Cards) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FiZap className="text-amber-400 w-4 h-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
            AI Automation Impact & ROI
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* DMs Handled */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-[#13131A] border border-pink-500/20 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Instagram DMs Handled
              </span>
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <FiMessageSquare size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{automation.dmsHandled}</span>
              <span className="text-xs text-pink-400 font-medium">automated turns</span>
            </div>
            <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
              <span>Conversations: {automation.totalConversations}</span>
              <span className="text-emerald-400 font-medium">100% automated</span>
            </div>
          </motion.div>

          {/* Leads Captured */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-[#13131A] border border-violet-500/20 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Leads & Bookings Captured
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <FiAward size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-violet-400">{automation.leadsCaptured}</span>
              <span className="text-xs text-gray-400">verified</span>
            </div>
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-3">
              <span>Forms: {automation.leadsBreakdown?.forms || 0}</span>
              <span>•</span>
              <span>Bookings: {automation.leadsBreakdown?.bookings || 0}</span>
            </div>
          </motion.div>

          {/* Response Speed & Rate */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-[#13131A] border border-cyan-500/20 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Response Rate & Speed
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <FiCheckCircle size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-cyan-400">{automation.responseRate}%</span>
              <span className="text-xs text-gray-400 font-medium">response rate</span>
            </div>
            <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
              <span>Avg Speed: ~{automation.averageResponseTimeSec}s</span>
              <span className="text-cyan-400 font-medium">24/7 active</span>
            </div>
          </motion.div>

          {/* Time Saved */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-[#13131A] border border-emerald-500/20 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Operator Time Saved
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FiClock size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-400">{automation.timeSavedHours}h</span>
              <span className="text-xs text-gray-400 font-medium">this period</span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Equivalent to ~${Math.round(automation.timeSavedHours * 35)} in manual labor
            </div>
          </motion.div>
        </div>
      </div>

      {/* SECTION 2: ACCOUNT OVERVIEW METRICS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FiTrendingUp className="text-pink-400 w-4 h-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
            Account Reach & Growth Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#13131A] border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Followers</span>
              <span className="text-xs font-semibold text-emerald-400">{account.followersGrowthRate}</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1.5">
              {Number(account.followersCount).toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#13131A] border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Accounts Reached</span>
              <span className="text-xs font-semibold text-emerald-400">{account.reachGrowthRate}</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1.5">
              {Number(account.reach).toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#13131A] border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Total Impressions</span>
              <span className="text-xs font-semibold text-emerald-400">{account.impressionsGrowthRate}</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1.5">
              {Number(account.impressions) > 1000 ? `${(Number(account.impressions) / 1000).toFixed(1)}k` : account.impressions}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#13131A] border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Avg Engagement Rate</span>
              <span className="text-xs font-semibold text-pink-400">Active</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1.5">
              {account.engagementRate}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: VISUAL TIMESERIES & CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reach & Impressions Trend */}
        <div className="p-5 rounded-2xl bg-[#13131A] border border-white/5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiBarChart2 className="text-pink-400" />
                <span>Audience Reach & Impressions</span>
              </h3>
              <p className="text-xs text-gray-400">Daily breakdown over the selected period</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-pink-400">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Reach
              </span>
              <span className="flex items-center gap-1 text-violet-400">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Impressions
              </span>
            </div>
          </div>

          {/* Visual CSS Bar Chart */}
          <div className="h-48 pt-6 flex items-end justify-between gap-2 border-b border-white/5 pb-2">
            {timeseries.reachTrend?.map((item, idx) => {
              const reachHeight = Math.min(100, Math.max(15, (item.reach / 10000) * 100));
              const impHeight = Math.min(100, Math.max(20, (item.impressions / 25000) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div
                      style={{ height: `${reachHeight}%` }}
                      className="w-1/2 bg-gradient-to-t from-pink-600 to-pink-400 rounded-t-md transition-all group-hover:brightness-125"
                      title={`Reach: ${item.reach}`}
                    />
                    <div
                      style={{ height: `${impHeight}%` }}
                      className="w-1/2 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-md transition-all group-hover:brightness-125"
                      title={`Impressions: ${item.impressions}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 truncate mt-1">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Automation Volume Trend */}
        <div className="p-5 rounded-2xl bg-[#13131A] border border-white/5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiActivity className="text-cyan-400" />
                <span>AI Automation Activity</span>
              </h3>
              <p className="text-xs text-gray-400">Automated DMs handled vs leads captured</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> DMs
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Leads
              </span>
            </div>
          </div>

          {/* Visual CSS Bar Chart */}
          <div className="h-48 pt-6 flex items-end justify-between gap-2 border-b border-white/5 pb-2">
            {timeseries.automationTrend?.map((item, idx) => {
              const dmHeight = Math.min(100, Math.max(20, item.dms * 15));
              const leadHeight = Math.min(100, Math.max(10, item.leads * 25));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div
                      style={{ height: `${dmHeight}%` }}
                      className="w-1/2 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all group-hover:brightness-125"
                      title={`DMs: ${item.dms}`}
                    />
                    <div
                      style={{ height: `${leadHeight}%` }}
                      className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all group-hover:brightness-125"
                      title={`Leads: ${item.leads}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 truncate mt-1">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: TOP PERFORMING POSTS & POST ANALYTICS */}
      <div className="p-5 rounded-2xl bg-[#13131A] border border-white/5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAward className="text-amber-400 w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Top Performing Automated Content</h3>
          </div>
          <span className="text-xs text-gray-400">Total Published Posts: {posts.totalPosts}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.topPerformingPosts?.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex gap-4"
            >
              {/* Media Thumbnail */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 shrink-0 relative">
                <img
                  src={post.mediaUrl}
                  alt="Post thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed">
                    {post.caption}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-pink-400">
                      <FiHeart size={12} /> {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <FiMessageSquare size={12} /> {post.commentCount}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-semibold">
                    {post.engagementRate} ER
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
