import React, { useState, useEffect, useCallback } from "react";
import {
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiGlobe,
  FiInstagram,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiShield,
  FiCpu,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import {
  getThreadsApi,
  getThreadByIdApi,
  updateThreadStatusApi,
} from "../../api/inbox/inboxApi";
import { getApiWithToken } from "../../api/apiInterface";
import { EmptyState, Skeleton, useToast } from "../../components/ui";

const PLATFORM_CONFIG = {
  website: {
    label: "Website",
    icon: FiGlobe,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
  },
  instagram: {
    label: "Instagram",
    icon: FiInstagram,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: FiMessageSquare,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  facebook: {
    label: "Facebook",
    icon: FiGlobe,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
};

const STATUS_CONFIG = {
  open: {
    label: "Open",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  escalated: {
    label: "Escalated",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  closed: {
    label: "Closed",
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    border: "border-gray-500/30",
  },
};

export default function ChatInbox() {
  const toast = useToast();
  const [threads, setThreads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [activeThreadData, setActiveThreadData] = useState(null);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    escalated: 0,
    closed: 0,
    byPlatform: { website: 0, instagram: 0, whatsapp: 0, facebook: 0 },
  });

  // Load agents
  useEffect(() => {
    getApiWithToken("ai-agent/all")
      .then((res) => {
        if (res.data?.data) {
          setAgents(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to load agents", err));
  }, []);

  // Fetch threads list
  const fetchThreads = useCallback(async (keepSelected = true) => {
    setLoadingThreads(true);
    try {
      const params = {
        search: search.trim() || undefined,
        platform: selectedPlatform !== "all" ? selectedPlatform : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        agentId: selectedAgent !== "all" ? selectedAgent : undefined,
      };

      const res = await getThreadsApi(params);
      if (res.data?.success) {
        const fetched = res.data.data || [];
        setThreads(fetched);
        if (res.data.stats) {
          setStats(res.data.stats);
        }

        // Auto-select first thread if none selected or current is missing
        if (fetched.length > 0) {
          if (!keepSelected || !selectedThreadId || !fetched.find((t) => t._id === selectedThreadId)) {
            setSelectedThreadId(fetched[0]._id);
          }
        } else {
          setSelectedThreadId(null);
          setActiveThreadData(null);
        }
      }
    } catch (err) {
      console.error("Error fetching threads:", err);
    } finally {
      setLoadingThreads(false);
    }
  }, [search, selectedPlatform, selectedStatus, selectedAgent, selectedThreadId]);

  useEffect(() => {
    fetchThreads(false);
  }, [search, selectedPlatform, selectedStatus, selectedAgent]);

  // Fetch active thread details and messages
  useEffect(() => {
    if (!selectedThreadId) {
      setActiveThreadData(null);
      return;
    }

    let isMounted = true;
    setLoadingMessages(true);

    getThreadByIdApi(selectedThreadId)
      .then((res) => {
        if (isMounted && res.data?.success) {
          setActiveThreadData(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching thread messages:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedThreadId]);

  // Handle status update
  const handleStatusChange = async (newStatus) => {
    if (!selectedThreadId) return;
    setUpdatingStatus(true);
    try {
      const res = await updateThreadStatusApi(selectedThreadId, { status: newStatus });
      if (res.data?.success) {
        setThreads((prev) =>
          prev.map((t) => (t._id === selectedThreadId ? { ...t, status: newStatus } : t))
        );
        if (activeThreadData?.thread) {
          setActiveThreadData((prev) => ({
            ...prev,
            thread: { ...prev.thread, status: newStatus },
          }));
        }
        toast.success(`Conversation marked as ${newStatus}`);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update conversation status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FiMessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Unified Chat Inbox
            </h1>
            <p className="text-sm text-gray-400">
              Read-only conversation log across Website Chat, Instagram DM, and connected channels
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchThreads(true)}
          disabled={loadingThreads}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium border border-white/10 transition-colors self-start md:self-auto"
        >
          <FiRefreshCw className={`w-4 h-4 ${loadingThreads ? "animate-spin text-cyan-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#13131A] border border-white/5">
          <span className="text-xs text-gray-400 font-medium block">Total Threads</span>
          <span className="text-xl font-bold text-white mt-1 block">{stats.total}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#13131A] border border-white/5">
          <span className="text-xs text-cyan-400 font-medium block">Open Conversations</span>
          <span className="text-xl font-bold text-cyan-400 mt-1 block">{stats.open}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#13131A] border border-white/5">
          <span className="text-xs text-amber-400 font-medium block">Escalated</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">{stats.escalated}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#13131A] border border-white/5">
          <span className="text-xs text-gray-400 font-medium block">Channels</span>
          <div className="text-xs text-gray-300 mt-1.5 flex items-center gap-2 font-medium">
            <span>Web: {stats.byPlatform?.website || 0}</span>
            <span>•</span>
            <span>IG: {stats.byPlatform?.instagram || 0}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Pane Inbox Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] bg-[#13131A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {/* LEFT PANE: Threads List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col border-r border-white/5 bg-[#0F0F12]/50">
          {/* Filters Bar */}
          <div className="p-4 border-b border-white/5 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search participant or summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Platform & Status Dropdowns */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="all" className="bg-[#13131A]">All Channels</option>
                <option value="website" className="bg-[#13131A]">Website</option>
                <option value="instagram" className="bg-[#13131A]">Instagram</option>
                <option value="whatsapp" className="bg-[#13131A]">WhatsApp</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="all" className="bg-[#13131A]">All Statuses</option>
                <option value="open" className="bg-[#13131A]">Open</option>
                <option value="escalated" className="bg-[#13131A]">Escalated</option>
                <option value="closed" className="bg-[#13131A]">Closed</option>
              </select>
            </div>
          </div>

          {/* Threads Scrollable List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
            {loadingThreads ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton variant="circular" width="36px" height="36px" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="85%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : threads.length === 0 ? (
              <div className="py-12 px-4">
                <EmptyState
                  icon={FiMessageSquare}
                  title="No conversations found"
                  description="Adjust your search query or channel filter to view active customer threads."
                  compact
                />
              </div>
            ) : (
              threads.map((t) => {
                const isSelected = t._id === selectedThreadId;
                const platformConf = PLATFORM_CONFIG[t.platform] || PLATFORM_CONFIG.website;
                const PlatformIcon = platformConf.icon;
                const statusConf = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;

                return (
                  <div
                    key={t._id}
                    onClick={() => setSelectedThreadId(t._id)}
                    className={`p-3.5 transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border-l-2 border-cyan-400"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Channel Icon Avatar */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${platformConf.bg} ${platformConf.color}`}
                        >
                          <PlatformIcon size={14} />
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {t.participantId || "Visitor"}
                          </div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <span className="truncate max-w-[120px]">
                              {t.agentId?.name || "AI Agent"}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{t.platform}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {formatRelativeTime(t.lastMessageAt)}
                      </span>
                    </div>

                    {/* Summary Snippet */}
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {t.lastMessageSummary || "No preview summary recorded."}
                    </p>

                    {/* Status Badge */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                      >
                        {statusConf.label}
                      </span>

                      {t.leadCaptured && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Lead Captured
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Message Stream & Transcript (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#0A0A0C]">
          {selectedThreadId && activeThreadData ? (
            <>
              {/* Thread Viewer Header */}
              <div className="p-4 border-b border-white/5 bg-[#0F0F12] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 font-semibold text-xs border border-white/10">
                    {(activeThreadData.thread?.participantId || "V").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white">
                        {activeThreadData.thread?.participantId || "Conversation"}
                      </h2>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                          activeThreadData.source === "database"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : activeThreadData.source === "live_graph_api"
                            ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                            : activeThreadData.source === "redis_cache"
                            ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {activeThreadData.source === "database"
                          ? "Website DB"
                          : activeThreadData.source === "live_graph_api"
                          ? "Live Graph API"
                          : activeThreadData.source === "redis_cache"
                          ? "Cached (5m)"
                          : "Summary Only"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>Agent: {activeThreadData.thread?.agentId?.name || "Agent"}</span>
                      <span>•</span>
                      <span className="capitalize">{activeThreadData.thread?.platform}</span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Status:</span>
                  <select
                    value={activeThreadData.thread?.status || "open"}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="open" className="bg-[#13131A] text-cyan-400">Open</option>
                    <option value="escalated" className="bg-[#13131A] text-amber-400">Escalated</option>
                    <option value="closed" className="bg-[#13131A] text-gray-400">Closed</option>
                  </select>
                </div>
              </div>

              {/* Notice Banner (If Graph API is in fallback or error mode) */}
              {activeThreadData.liveFetchError && (
                <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
                  <FiAlertTriangle size={14} className="shrink-0 text-amber-400" />
                  <span>{activeThreadData.liveFetchError}</span>
                </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                {loadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                    <FiRefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                    <span className="text-xs">Fetching transcript...</span>
                  </div>
                ) : !activeThreadData.messages || activeThreadData.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                    <FiInfo className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs text-gray-400">No messages found for this thread.</p>
                  </div>
                ) : (
                  activeThreadData.messages.map((m, idx) => {
                    const isAgent = m.sender === "agent" || m.sender === "assistant" || m.sender === "ai";
                    const isSystem = m.sender === "system";

                    if (isSystem) {
                      return (
                        <div key={m.id || idx} className="flex justify-center my-3">
                          <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-gray-400 max-w-md text-center">
                            <span className="font-semibold text-gray-300 block mb-0.5">
                              Session Summary
                            </span>
                            {m.message}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={m.id || idx}
                        className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-semibold text-gray-400">
                            {isAgent ? (activeThreadData.thread?.agentId?.name || "AI Agent") : "Customer"}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {formatTimestamp(m.createdAt)}
                          </span>
                        </div>

                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            isAgent
                              ? "bg-gradient-to-br from-cyan-600 to-violet-600 text-white rounded-tr-sm shadow-md shadow-cyan-900/20"
                              : "bg-[#181820] text-gray-200 border border-white/5 rounded-tl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Read-Only Operator Footer */}
              <div className="p-3 bg-[#0F0F12] border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <FiShield size={14} className="text-cyan-400" />
                  <span>Read-Only Channel Mode (Phase 1)</span>
                </div>
                <span className="text-[11px] text-gray-500">
                  Manual reply from dashboard scheduled for Phase 2
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-6">
              <EmptyState
                icon={FiMessageSquare}
                title="Select a Conversation"
                description="Choose a conversation thread from the left pane to view its full transcript or live on-demand history."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
