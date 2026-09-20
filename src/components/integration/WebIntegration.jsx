import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCopy,
  FiCheck,
  FiCode,
  FiSliders,
  FiUpload,
  FiInfo,
  FiZap,
} from "react-icons/fi";
import { SiGooglegemini } from "react-icons/si";
import { toast } from "react-toastify";
import {
  getWebIntegrationByIdApi,
  updateWebIntegrationByIdApi,
} from "../../api/integration/webIntegrationApi";
import { getAllUserAIagentApi, getAiAgentByIdApi } from "../../api/authApi";
import { setAgentDetail } from "../../stateManagement/slices/aiAgentSlice";
import { apiUrl } from "../../api/baseUrl";
import AvatarCropperModal from "../common/ai-agent/AvatarCropperModal";
import LiveWidgetPreview from "./LiveWidgetPreview";

// Curated preset color palettes for fast luxury customization
const PRESET_PALETTES = [
  { name: "Cyan & Violet", c1: "#06B6D4", c2: "#8B5CF6", c3: "#FFFFFF" },
  { name: "Royal Indigo", c1: "#6366F1", c2: "#4F46E5", c3: "#FFFFFF" },
  { name: "Emerald Cyber", c1: "#10B981", c2: "#059669", c3: "#FFFFFF" },
  { name: "Sunset Amber", c1: "#F59E0B", c2: "#EF4444", c3: "#FFFFFF" },
  { name: "Neon Magenta", c1: "#EC4899", c2: "#8B5CF6", c3: "#FFFFFF" },
  { name: "Dark Titanium", c1: "#1E293B", c2: "#0EA5E9", c3: "#F8FAFC" },
];

export default function WebIntegration() {
  const dispatch = useDispatch();
  const reduxAgent = useSelector((state) => state?.ai_agent?.details);

  const [agentsList, setAgentsList] = useState([]);
  const [activeAgent, setActiveAgent] = useState(reduxAgent || null);
  const [configId, setConfigId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Widget Customization Settings
  const [settings, setSettings] = useState({
    color1: "#824dff",
    color2: "#ff4242",
    color3: "#ffffff",
    position: "right",
    greetingTime: 3,
    greetingMsg: ["Hello! How can I help you today?"],
    showAgent: true,
    isVoiceChat: false,
    agentVoice: "",
  });

  // 1. Fetch available agents if current agent is not loaded in Redux
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await getAllUserAIagentApi();
        const list = res?.data?.data || [];
        setAgentsList(list);
        if (!activeAgent && list.length > 0) {
          setActiveAgent(list[0]);
          dispatch(setAgentDetail(list[0]));
        }
      } catch (err) {
        console.error("Error fetching agents list:", err);
      }
    };

    if (!activeAgent?._id) {
      fetchAgents();
    } else {
      setActiveAgent(reduxAgent);
    }
  }, [reduxAgent]);

  // 2. Fetch existing web integration configuration for active agent
  const fetchIntegrationConfig = async (agentId) => {
    if (!agentId) return;
    setLoading(true);
    try {
      const res = await getWebIntegrationByIdApi(agentId);
      const data = res?.data?.data;
      if (data) {
        setConfigId(data._id);
        setSettings({
          color1: data.color1 || "#824dff",
          color2: data.color2 || "#ff4242",
          color3: data.color3 || "#ffffff",
          position: data.position || "right",
          greetingTime: data.greetingTime !== undefined ? data.greetingTime : 3,
          greetingMsg: Array.isArray(data.greetingMsg) && data.greetingMsg.length > 0
            ? data.greetingMsg
            : ["Hello! How can I help you today?"],
          showAgent: data.showAgent !== undefined ? data.showAgent : true,
          isVoiceChat: data.isVoiceChat || false,
          agentVoice: data.agentVoice || "",
        });
      }
    } catch (err) {
      console.error("Error fetching web integration details:", err);
      toast.error(err?.response?.data?.message || "Failed to load widget settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAgent?._id) {
      fetchIntegrationConfig(activeAgent._id);
    }
  }, [activeAgent?._id]);

  // Handle agent switch
  const handleSelectAgent = async (agentId) => {
    const found = agentsList.find((a) => a._id === agentId);
    if (found) {
      setActiveAgent(found);
      dispatch(setAgentDetail(found));
    }
  };

  // Handle Save
  const handleSaveSettings = async () => {
    if (!activeAgent?._id) {
      toast.error("Please select an agent first");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        _id: configId,
        aiAgentId: activeAgent._id,
        color1: settings.color1,
        color2: settings.color2,
        color3: settings.color3,
        position: settings.position,
        greetingTime: Number(settings.greetingTime),
        greetingMsg: settings.greetingMsg.filter((m) => m && m.trim().length > 0),
        showAgent: settings.showAgent,
        isVoiceChat: settings.isVoiceChat,
        agentVoice: settings.agentVoice,
      };

      const res = await updateWebIntegrationByIdApi(payload);
      if (res?.data?.status === 1 || res?.data?.status === 0) {
        toast.success("Widget configuration saved successfully!");
        if (res?.data?.data?._id) {
          setConfigId(res.data.data._id);
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Generate production-grade snippet (matching Task 8 Shadow DOM loader)
  const resolvedBaseUrl = apiUrl
    ? apiUrl.replace(/\/api\/v1\/?$/, "")
    : window.location.origin;

  const codeSnippet = `<!-- AI Assistant Chat Widget (Shadow DOM Encapsulated) -->
<script 
  src="${resolvedBaseUrl}/widget.js" 
  data-agent-key="${activeAgent?.apiKey || "YOUR_AGENT_API_KEY"}" 
  defer>
</script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    toast.success("Embed script copied to clipboard!");
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-gray-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-cyan-500/30">
              Website Integration UX
            </span>
            <span className="text-xs text-gray-400">• Shadow DOM v2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Website Chat Widget Customizer
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Customize branding, launcher avatar, positioning, and preview real-time behavior before embedding.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {agentsList.length > 1 && (
            <select
              value={activeAgent?._id || ""}
              onChange={(e) => handleSelectAgent(e.target.value)}
              className="bg-[#0F0F12] text-sm text-gray-200 border border-white/15 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {agentsList.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} ({a.companyName || "Agent"})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiCheck size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customization Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Launcher Avatar & Agent Persona */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FiUpload className="text-cyan-400" />
                  Launcher Avatar & Identity
                </h3>
                <p className="text-xs text-gray-400">
                  Custom image displayed in the floating launcher and chat header.
                </p>
              </div>
              <button
                onClick={() => setAvatarModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition-colors cursor-pointer"
              >
                <FiUpload size={13} />
                <span>Upload & Crop</span>
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#080C14] border border-white/5">
              <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
                {activeAgent?.avatarUrl || activeAgent?.agentImg ? (
                  <img
                    src={activeAgent.avatarUrl || activeAgent.agentImg}
                    alt={activeAgent.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400/80 shadow-md group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <SiGooglegemini size={28} />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-medium transition-opacity">
                  Edit
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{activeAgent?.name || "AI Agent"}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                    Active
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeAgent?.companyName || "Website Assistant"} • API Key:{" "}
                  <span className="font-mono text-gray-300">
                    {activeAgent?.apiKey ? `${activeAgent.apiKey.substring(0, 14)}...` : "None"}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Click avatar to crop and upload directly via Amazon S3.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Brand Colors */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FiSliders className="text-violet-400" />
                Brand Theme & Colors
              </h3>
              <p className="text-xs text-gray-400">
                Match the widget header, floating button, and bot bubbles to your brand.
              </p>
            </div>

            {/* Quick Palettes */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400 font-medium">Quick Preset Themes:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_PALETTES.map((palette) => (
                  <button
                    key={palette.name}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        color1: palette.c1,
                        color2: palette.c2,
                        color3: palette.c3,
                      }))
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080C14] border border-white/10 hover:border-white/25 text-xs text-gray-300 transition-all cursor-pointer"
                  >
                    <div className="flex -space-x-1">
                      <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: palette.c1 }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: palette.c2 }} />
                    </div>
                    <span>{palette.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Color 1 */}
              <div className="p-3.5 rounded-xl bg-[#080C14] border border-white/10 space-y-2">
                <span className="text-xs text-gray-300 font-medium block">Header & Launcher</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.color1}
                    onChange={(e) => setSettings((s) => ({ ...s, color1: e.target.value }))}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.color1}
                    onChange={(e) => setSettings((s) => ({ ...s, color1: e.target.value }))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Color 2 */}
              <div className="p-3.5 rounded-xl bg-[#080C14] border border-white/10 space-y-2">
                <span className="text-xs text-gray-300 font-medium block">Bot Message Bubble</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.color2}
                    onChange={(e) => setSettings((s) => ({ ...s, color2: e.target.value }))}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.color2}
                    onChange={(e) => setSettings((s) => ({ ...s, color2: e.target.value }))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Color 3 */}
              <div className="p-3.5 rounded-xl bg-[#080C14] border border-white/10 space-y-2">
                <span className="text-xs text-gray-300 font-medium block">Text & Contrast</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.color3}
                    onChange={(e) => setSettings((s) => ({ ...s, color3: e.target.value }))}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.color3}
                    onChange={(e) => setSettings((s) => ({ ...s, color3: e.target.value }))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Position & Delay Behavior */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FiZap className="text-cyan-400" />
                Position & Greeting Timing
              </h3>
              <p className="text-xs text-gray-400">
                Choose screen dock position and greeting delay timing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Position Toggle */}
              <div className="p-4 rounded-xl bg-[#080C14] border border-white/10 space-y-2">
                <label className="text-xs text-gray-300 font-medium block">
                  Widget Launcher Placement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, position: "right" }))}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      settings.position === "right"
                        ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>Bottom Right</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, position: "left" }))}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      settings.position === "left"
                        ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>Bottom Left</span>
                  </button>
                </div>
              </div>

              {/* Greeting Delay Slider */}
              <div className="p-4 rounded-xl bg-[#080C14] border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-gray-300 font-medium">
                    Greeting Pop-up Delay
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                    {settings.greetingTime}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={settings.greetingTime}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, greetingTime: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full accent-cyan-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>0s (Instant)</span>
                  <span>5s</span>
                  <span>10s</span>
                </div>
              </div>
            </div>

            {/* Greeting Messages */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-300 font-medium">
                  Greeting Bubble Messages (Max 3)
                </label>
                {settings.greetingMsg.length < 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        greetingMsg: [...s.greetingMsg, "How can we assist you?"],
                      }))
                    }
                    className="text-xs text-cyan-400 hover:underline cursor-pointer"
                  >
                    + Add Message
                  </button>
                )}
              </div>

              {settings.greetingMsg.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={msg}
                    onChange={(e) => {
                      const updated = [...settings.greetingMsg];
                      updated[idx] = e.target.value;
                      setSettings((s) => ({ ...s, greetingMsg: updated }));
                    }}
                    placeholder={`Greeting message ${idx + 1}...`}
                    className="flex-1 bg-[#080C14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  {settings.greetingMsg.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = settings.greetingMsg.filter((_, i) => i !== idx);
                        setSettings((s) => ({ ...s, greetingMsg: updated }));
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Embed Snippet (Task 8 Shadow DOM Loader) */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FiCode className="text-emerald-400" />
                  Embed On Your Website
                </h3>
                <p className="text-xs text-gray-400">
                  Paste this single script tag right before the closing <code>&lt;/body&gt;</code> tag.
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all hover:scale-105 cursor-pointer shadow-sm"
              >
                {copied ? (
                  <>
                    <FiCheck size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <FiCopy size={14} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-[#080C14] border border-white/10 p-4">
              <pre className="text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {codeSnippet}
              </pre>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 bg-cyan-500/[0.05] border border-cyan-500/15 p-3 rounded-xl">
              <FiInfo size={16} className="text-cyan-400 flex-shrink-0" />
              <span>
                <strong>Shadow DOM Isolation:</strong> The widget runs inside an isolated root so it will never conflict with your website's CSS, fonts, or frameworks.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Preview (5 Cols - Sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <LiveWidgetPreview
            agent={activeAgent}
            settings={settings}
            onOpenAvatarModal={() => setAvatarModalOpen(true)}
          />
        </div>
      </div>

      {/* Avatar Cropper Modal (Task 43 / Task 44 Integration) */}
      <AvatarCropperModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        agent={activeAgent}
        onUploadSuccess={(newAvatarUrl) => {
          setActiveAgent((prev) => ({
            ...prev,
            avatarUrl: newAvatarUrl,
            agentImg: newAvatarUrl,
            fullAgentImg: newAvatarUrl,
          }));
        }}
      />
    </div>
  );
}
