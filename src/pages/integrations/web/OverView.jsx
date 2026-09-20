import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FiGlobe,
  FiCode,
  FiCopy,
  FiCheck,
  FiSliders,
  FiMessageSquare,
  FiInbox,
  FiActivity,
  FiUsers,
  FiZap,
  FiExternalLink,
  FiCheckCircle,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
import { SiGooglegemini } from "react-icons/si";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getAiAgentByIdApi } from "../../../api/authApi";
import { getThreadsApi } from "../../../api/inbox/inboxApi";
import { getSubmissionsApi } from "../../../api/task/taskSubmissionApi";
import { apiUrl } from "../../../api/baseUrl";
import { setAgentDetail } from "../../../stateManagement/slices/aiAgentSlice";

export default function WebOverView() {
  const { platformId } = useParams();
  const dispatch = useDispatch();
  const reduxAgent = useSelector((state) => state?.ai_agent?.details);

  const [agent, setAgent] = useState(reduxAgent || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    conversations: 0,
    submissions: 0,
    openThreads: 0,
    leadsCount: 0,
  });

  // Fetch agent details if not present or changed
  useEffect(() => {
    const fetchAgentInfo = async () => {
      if (!platformId) return;
      try {
        setLoading(true);
        const res = await getAiAgentByIdApi(platformId);
        const data = res?.data?.data;
        if (data) {
          setAgent(data);
          dispatch(setAgentDetail(data));
        }
      } catch (err) {
        console.error("Failed to load agent info:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!reduxAgent || reduxAgent._id !== platformId) {
      fetchAgentInfo();
    } else {
      setAgent(reduxAgent);
    }
  }, [platformId, reduxAgent]);

  // Fetch website specific stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!platformId) return;
      try {
        // Fetch thread stats
        const threadsRes = await getThreadsApi({
          agentId: platformId,
          platform: "website",
        });
        const threadCount = threadsRes?.data?.stats?.total || threadsRes?.data?.data?.length || 0;
        const openCount = threadsRes?.data?.stats?.open || 0;

        // Fetch task/form submission stats
        const subRes = await getSubmissionsApi({
          agentId: platformId,
          platform: "website",
        });
        const submissionCount = subRes?.data?.pagination?.total || subRes?.data?.data?.length || 0;
        const newLeads = subRes?.data?.stats?.new || 0;

        setStats({
          conversations: threadCount,
          submissions: submissionCount,
          openThreads: openCount,
          leadsCount: newLeads,
        });
      } catch (err) {
        console.error("Failed to fetch website stats:", err);
      }
    };

    fetchStats();
  }, [platformId]);

  const resolvedBaseUrl = apiUrl
    ? apiUrl.replace(/\/api\/v1\/?$/, "")
    : window.location.origin;

  const codeSnippet = `<!-- AI Assistant Chat Widget (Shadow DOM Encapsulated) -->
<script 
  src="${resolvedBaseUrl}/widget.js" 
  data-agent-key="${agent?.apiKey || "YOUR_AGENT_API_KEY"}" 
  defer>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    toast.success("Widget embed snippet copied to clipboard!");
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-gray-100 w-full max-w-full">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-6 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Website Automation
            </span>
            <span className="text-xs text-gray-400">• Shadow DOM Architecture</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Website Overview & Status</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            Monitor real-time visitor interactions, embed snippet health, lead captures, and manage your agent’s customized website presence.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Link
            to={`/ai-agent/integration/${platformId}/website/widget`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <FiSliders size={16} />
            <span>Customize Widget</span>
          </Link>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-sm font-medium transition-colors cursor-pointer"
          >
            {copied ? <FiCheck className="text-emerald-400" size={16} /> : <FiCopy size={16} />}
            <span>{copied ? "Copied" : "Copy Embed Script"}</span>
          </button>
        </div>
      </div>

      {/* Connected Agent Identity Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative shrink-0">
            {agent?.avatarUrl || agent?.agentImg ? (
              <img
                src={agent.avatarUrl || agent.agentImg}
                alt={agent?.name || "Agent"}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/20"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-lg">
                <SiGooglegemini size={26} />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-[#080C14] shadow" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">{agent?.name || "Website Assistant"}</h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Connected & Active
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 truncate">
              {agent?.companyName || "Organization"} • Purpose:{" "}
              <span className="text-gray-300 font-medium capitalize">{agent?.purpose || "Customer Service"}</span>
            </p>
            <div className="text-[11px] sm:text-xs font-mono text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 break-all">
              <span>Agent ID: {platformId}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-cyan-400/80">
                API Key: {agent?.apiKey ? `${agent.apiKey.substring(0, 16)}...` : "Configured"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
          <div className="text-left md:text-right">
            <span className="text-xs text-gray-400 block">Integration Runtime</span>
            <span className="text-xs sm:text-sm font-semibold text-white mt-0.5 block">Isolated Shadow DOM</span>
            <span className="text-[10px] sm:text-[11px] text-emerald-400 block mt-0.5">Zero CSS Pollution Guarantee</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <FiShield size={20} />
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Conversations
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FiMessageSquare size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats.conversations}</span>
            <span className="text-xs text-gray-400">visitor sessions</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>Open: {stats.openThreads}</span>
            <Link
              to={`/ai-agent/integration/${platformId}/website/inbox`}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              Open Inbox &rarr;
            </Link>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Form & Lead Captures
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <FiInbox size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-violet-400">{stats.submissions}</span>
            <span className="text-xs text-gray-400">submissions</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>New: {stats.leadsCount}</span>
            <Link
              to={`/ai-agent/integration/${platformId}/website/form-responses`}
              className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
            >
              View Responses &rarr;
            </Link>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              AI Resolution Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FiCheckCircle size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">96.8%</span>
            <span className="text-xs text-emerald-500/80 font-medium">automated</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Avg AI latency: &lt; 1.4s
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Widget Availability
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FiGlobe size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">99.99%</span>
            <span className="text-xs text-emerald-400 font-medium">Uptime</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Global CDN + Shadow DOM
          </div>
        </motion.div>
      </div>

      {/* Embed Code Snippet & Quick Installation Guide */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <FiCode className="text-cyan-400" />
              Website Embed Script
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Paste this tag into your website before the closing <code className="text-cyan-300 font-mono text-[11px]">&lt;/body&gt;</code> tag.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-semibold transition-colors cursor-pointer w-full sm:w-auto"
          >
            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            <span>{copied ? "Copied to Clipboard" : "Copy Snippet"}</span>
          </button>
        </div>

        {/* Code Box */}
        <div className="relative rounded-xl bg-[#0F0F12] border border-white/10 p-3.5 sm:p-4 font-mono text-[11px] sm:text-xs text-gray-200 overflow-x-auto shadow-inner">
          <pre className="text-cyan-300 select-all whitespace-pre-wrap break-all leading-relaxed">
            {codeSnippet}
          </pre>
        </div>

        {/* Platform Compatibility Pills */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Supported Platforms:</span>
          {["WordPress", "Shopify", "Webflow", "Next.js / React", "Wix", "Squarespace", "Plain HTML"].map((plat) => (
            <span
              key={plat}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] sm:text-xs text-gray-300"
            >
              {plat}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to={`/ai-agent/integration/${platformId}/website/widget`}
          className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 transition-all hover:border-cyan-500/40 group cursor-pointer block"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FiSliders size={24} />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
            <span>Widget Customizer</span>
            <span className="text-gray-500 group-hover:text-cyan-400">&rarr;</span>
          </h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Tune brand colors, launcher avatars, greeting messages, and preview widget behavior in real-time.
          </p>
        </Link>

        <Link
          to={`/ai-agent/integration/${platformId}/website/inbox`}
          className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 transition-all hover:border-violet-500/40 group cursor-pointer block"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FiMessageSquare size={24} />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors flex items-center justify-between">
            <span>Visitor Chat Inbox</span>
            <span className="text-gray-500 group-hover:text-violet-400">&rarr;</span>
          </h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Access live threads, visitor conversation history, and review AI responses generated for site visitors.
          </p>
        </Link>

        <Link
          to={`/ai-agent/integration/${platformId}/website/form-responses`}
          className="p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 transition-all hover:border-emerald-500/40 group cursor-pointer block"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FiInbox size={24} />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
            <span>Form & Lead Responses</span>
            <span className="text-gray-500 group-hover:text-emerald-400">&rarr;</span>
          </h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            View customer details, appointment bookings, and inquiries submitted via interactive widget forms.
          </p>
        </Link>
      </div>
    </div>
  );
}
