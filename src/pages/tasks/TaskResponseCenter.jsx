import React, { useState, useEffect, useCallback } from "react";
import {
  FiInbox,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiSearch,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiClock,
  FiMessageSquare,
  FiInstagram,
  FiGlobe,
  FiLayers,
  FiEye,
  FiX,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
  FiAlertCircle,
  FiTrendingUp,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSubmissionsApi,
  getSubmissionByIdApi,
  updateSubmissionStatusApi,
  exportSubmissionsCsvApi,
} from "../../api/task/taskSubmissionApi";
import { getApiWithToken } from "../../api/apiInterface";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui";

const STATUS_CONFIG = {
  new: {
    label: "New",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    dot: "bg-cyan-400",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  reviewed: {
    label: "Reviewed",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  archived: {
    label: "Archived",
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    border: "border-gray-500/30",
    dot: "bg-gray-400",
  },
};

const PLATFORM_CONFIG = {
  website: {
    label: "Website",
    icon: FiGlobe,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  instagram: {
    label: "Instagram",
    icon: FiInstagram,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: FiMessageSquare,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  facebook: {
    label: "Facebook",
    icon: FiGlobe,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
};

export default function TaskResponseCenter() {
  const [submissions, setSubmissions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    reviewed: 0,
    contacted: 0,
    archived: 0,
    byPlatform: { website: 0, instagram: 0, whatsapp: 0, facebook: 0 },
    byType: { form: 0, booking: 0 },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTaskType, setSelectedTaskType] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notesInput, setNotesInput] = useState("");
  const [statusInput, setStatusInput] = useState("new");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load agents for filter dropdown
  useEffect(() => {
    getApiWithToken("ai-agent/all")
      .then((res) => {
        if (res.data?.data) {
          setAgents(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to load agents", err));
  }, []);

  // Compute date filters
  const getDateParams = useCallback(() => {
    const now = new Date();
    if (dateRange === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { startDate: start.toISOString() };
    }
    if (dateRange === "7days") {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString() };
    }
    if (dateRange === "30days") {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: start.toISOString() };
    }
    return {};
  }, [dateRange]);

  // Fetch submissions from API
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        agentId: selectedAgent !== "all" ? selectedAgent : undefined,
        platform: selectedPlatform !== "all" ? selectedPlatform : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        taskType: selectedTaskType !== "all" ? selectedTaskType : undefined,
        ...getDateParams(),
      };

      const res = await getSubmissionsApi(params);
      if (res.data?.success) {
        setSubmissions(res.data.data || []);
        if (res.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.data.pagination.total,
            totalPages: res.data.pagination.totalPages,
          }));
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    search,
    selectedAgent,
    selectedPlatform,
    selectedStatus,
    selectedTaskType,
    getDateParams,
  ]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Handle Export to CSV
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = {
        search: search.trim() || undefined,
        agentId: selectedAgent !== "all" ? selectedAgent : undefined,
        platform: selectedPlatform !== "all" ? selectedPlatform : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        taskType: selectedTaskType !== "all" ? selectedTaskType : undefined,
        ...getDateParams(),
      };
      await exportSubmissionsCsvApi(params);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  // Open detail view
  const openDetail = async (sub) => {
    setSelectedSubmission(sub);
    setStatusInput(sub.status || "new");
    setNotesInput(sub.notes || "");
    setSaveSuccess(false);
    setDrawerOpen(true);

    try {
      const res = await getSubmissionByIdApi(sub._id);
      if (res.data?.success && res.data.data) {
        setSelectedSubmission(res.data.data);
        setStatusInput(res.data.data.status || "new");
        setNotesInput(res.data.data.notes || "");
      }
    } catch (err) {
      console.error("Error loading detail:", err);
    }
  };

  // Update submission status / notes
  const handleSaveDetails = async () => {
    if (!selectedSubmission) return;
    setUpdatingStatus(true);
    try {
      const res = await updateSubmissionStatusApi(selectedSubmission._id, {
        status: statusInput,
        notes: notesInput,
      });
      if (res.data?.success) {
        setSelectedSubmission(res.data.data);
        setSaveSuccess(true);
        // Update item in local list
        setSubmissions((prev) =>
          prev.map((item) =>
            item._id === selectedSubmission._id ? res.data.data : item
          )
        );
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Save details error:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FiInbox size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Task Response Center
              </h1>
              <p className="text-sm text-gray-400">
                Unified visibility, analytics, and status tracking for captured form leads and bookings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium border border-white/10 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/20 transition-all duration-200"
          >
            <FiDownload className={`w-4 h-4 ${exporting ? "animate-bounce" : ""}`} />
            <span>{exporting ? "Exporting..." : "Export CSV"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-[#13131A] border border-white/5 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Submissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FiTrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats.total}</span>
            <span className="text-xs text-gray-400">records</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-3">
            <span>Forms: {stats.byType?.form || 0}</span>
            <span>•</span>
            <span>Bookings: {stats.byType?.booking || 0}</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-[#13131A] border border-white/5 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              New Leads
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FiClock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400">{stats.new}</span>
            <span className="text-xs text-cyan-500/80 font-medium">awaiting review</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Requires initial operator contact
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-[#13131A] border border-white/5 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Contacted
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FiMessageSquare size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400">{stats.contacted}</span>
            <span className="text-xs text-gray-400">in progress</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Outreach initiated
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-[#13131A] border border-white/5 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Reviewed / Closed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FiCheckCircle size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">{stats.reviewed}</span>
            <span className="text-xs text-gray-400">completed</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
            <span>Website: {stats.byPlatform?.website || 0}</span>
            <span>•</span>
            <span>Instagram: {stats.byPlatform?.instagram || 0}</span>
          </div>
        </motion.div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-2xl bg-[#13131A] border border-white/5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contact name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Agent Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="all" className="bg-[#13131A] text-gray-300">
                All AI Agents
              </option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id} className="bg-[#13131A] text-white">
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="all" className="bg-[#13131A] text-gray-300">All Statuses</option>
              <option value="new" className="bg-[#13131A] text-cyan-400">New</option>
              <option value="contacted" className="bg-[#13131A] text-amber-400">Contacted</option>
              <option value="reviewed" className="bg-[#13131A] text-emerald-400">Reviewed</option>
              <option value="archived" className="bg-[#13131A] text-gray-400">Archived</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="md:col-span-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="all" className="bg-[#13131A] text-gray-300">All Time</option>
              <option value="today" className="bg-[#13131A] text-gray-300">Today</option>
              <option value="7days" className="bg-[#13131A] text-gray-300">Last 7 Days</option>
              <option value="30days" className="bg-[#13131A] text-gray-300">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Channel & Task Type Quick Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Platform Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-500 mr-1 font-medium">Channel:</span>
            {[
              { id: "all", label: "All Channels" },
              { id: "website", label: "Website", icon: FiGlobe },
              { id: "instagram", label: "Instagram", icon: FiInstagram },
              { id: "whatsapp", label: "WhatsApp", icon: FiMessageSquare },
            ].map((p) => {
              const active = selectedPlatform === p.id;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  {Icon && <Icon size={12} />}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Task Type Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 mr-1 font-medium">Type:</span>
            {[
              { id: "all", label: "All Types" },
              { id: "form", label: "Forms / Leads" },
              { id: "booking", label: "Bookings" },
            ].map((t) => {
              const active = selectedTaskType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTaskType(t.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submissions Table Area */}
      <div className="bg-[#13131A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-4">Agent & Task</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Submitted At</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5"><Skeleton width="140px" height="16px" /></td>
                    <td className="py-4 px-4"><Skeleton width="120px" height="16px" /></td>
                    <td className="py-4 px-4"><Skeleton width="80px" height="16px" /></td>
                    <td className="py-4 px-4"><Skeleton width="90px" height="16px" /></td>
                    <td className="py-4 px-4"><Skeleton width="70px" height="20px" variant="rectangular" /></td>
                    <td className="py-4 px-5 text-right"><Skeleton width="60px" height="16px" className="ml-auto" /></td>
                  </tr>
                ))
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <EmptyState
                      title="No submissions match selected filters"
                      description="Try resetting your search term, agent, platform, or date range filters to view records."
                      action={{
                        label: 'Reset Filters',
                        onClick: () => {
                          setSelectedAgent('all');
                          setSelectedPlatform('all');
                          setSelectedStatus('all');
                          setSelectedTaskType('all');
                          setSearchTerm('');
                        }
                      }}
                    />
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const statusConf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.new;
                  const platformConf = PLATFORM_CONFIG[sub.platform] || PLATFORM_CONFIG.website;
                  const PlatformIcon = platformConf.icon;

                  const contactName =
                    sub.contact?.name ||
                    sub.submittedData?.full_name ||
                    sub.submittedData?.name ||
                    "Anonymous";
                  const contactEmail = sub.contact?.email || sub.submittedData?.email || "";
                  const contactPhone = sub.contact?.phone || sub.submittedData?.phone || "";

                  return (
                    <tr
                      key={sub._id}
                      onClick={() => openDetail(sub)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Contact */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/10 flex items-center justify-center text-cyan-400 font-semibold text-xs shrink-0">
                            {contactName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate max-w-[180px]">
                              {contactName}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-[180px]">
                              {contactEmail || contactPhone || "No direct contact info"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Agent & Task */}
                      <td className="py-4 px-4">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-200 text-sm truncate max-w-[160px]">
                            {sub.taskId?.name || "Form Task"}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 truncate max-w-[120px]">
                              {sub.agentId?.name || "Agent"}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                sub.taskType === "booking"
                                  ? "bg-violet-500/20 text-violet-300"
                                  : "bg-cyan-500/20 text-cyan-300"
                              }`}
                            >
                              {sub.taskType === "booking" ? "Booking" : "Lead"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${platformConf.bg} ${platformConf.color}`}
                        >
                          <PlatformIcon size={13} />
                          <span>{platformConf.label}</span>
                        </span>
                      </td>

                      {/* Submitted At */}
                      <td className="py-4 px-4 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(sub.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                          <span>{statusConf.label}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(sub);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 group-hover:text-cyan-400 border border-white/5 transition-colors"
                        >
                          <FiEye size={13} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            Showing{" "}
            <span className="font-semibold text-white">
              {submissions.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-white">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-semibold text-white">{pagination.total}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 transition-colors"
            >
              <FiChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 rounded-lg bg-white/5 text-white font-medium">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.totalPages, prev.page + 1),
                }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 transition-colors"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Submission Detail Drawer / Modal */}
      <AnimatePresence>
        {drawerOpen && selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl h-full bg-[#0F0F12] border-l border-white/10 shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <FiInbox size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Submission Details</h2>
                    <p className="text-xs text-gray-400">ID: {selectedSubmission._id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {/* Contact Overview Card */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <FiUser size={13} className="text-cyan-400" />
                    <span>Contact Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 block">Name</span>
                      <span className="text-white font-medium">
                        {selectedSubmission.contact?.name ||
                          selectedSubmission.submittedData?.full_name ||
                          selectedSubmission.submittedData?.name ||
                          "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 block">Email</span>
                      <span className="text-white font-medium">
                        {selectedSubmission.contact?.email ||
                          selectedSubmission.submittedData?.email ||
                          "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 block">Phone</span>
                      <span className="text-white font-medium">
                        {selectedSubmission.contact?.phone ||
                          selectedSubmission.submittedData?.phone ||
                          "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 block">Platform</span>
                      <span className="text-white font-medium capitalize">
                        {selectedSubmission.platform || "website"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submitted Field Key-Values */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <FiLayers size={13} className="text-violet-400" />
                    <span>Submitted Form Data</span>
                  </div>

                  {selectedSubmission.submittedData &&
                  typeof selectedSubmission.submittedData === "object" ? (
                    <div className="space-y-2">
                      {Object.entries(selectedSubmission.submittedData).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex flex-col p-2.5 rounded-lg bg-black/30 border border-white/5"
                        >
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm text-gray-100 mt-0.5 break-words font-mono">
                            {typeof val === "object" ? JSON.stringify(val, null, 2) : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No raw form payload recorded.</div>
                  )}
                </div>

                {/* Status & Operator Notes */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <FiCheckCircle size={13} className="text-emerald-400" />
                    <span>Response Management</span>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5">Change Status</label>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="new">New (Unreviewed)</option>
                      <option value="contacted">Contacted (In Progress)</option>
                      <option value="reviewed">Reviewed (Completed)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5">Operator Notes</label>
                    <textarea
                      rows={3}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Add follow-up notes, call logs, or meeting outcome..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 custom-scrollbar"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {saveSuccess ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <FiCheck size={14} />
                        <span>Changes saved successfully!</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    <button
                      onClick={handleSaveDetails}
                      disabled={updatingStatus}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
                    >
                      {updatingStatus ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
