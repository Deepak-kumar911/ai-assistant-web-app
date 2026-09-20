import React, { useState, useEffect, useRef } from "react";
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
  FiEye,
  FiMessageSquare,
  FiPlus,
  FiTrash2,
  FiSmartphone,
  FiMonitor,
} from "react-icons/fi";
import { SiGooglegemini } from "react-icons/si";
import { toast } from "react-toastify";
import {
  getWebIntegrationByIdApi,
  updateWebIntegrationByIdApi,
} from "../../api/integration/webIntegrationApi";
import { getAllUserAIagentApi } from "../../api/authApi";
import { setAgentDetail } from "../../stateManagement/slices/aiAgentSlice";
import { apiUrl } from "../../api/baseUrl";
import AvatarCropperModal from "../common/ai-agent/AvatarCropperModal";
import LiveWidgetPreview from "./LiveWidgetPreview";
import { CustomSelect } from "../ui";

// Curated preset color palettes for fast luxury customization
const PRESET_PALETTES = [
  { name: "Cyan & Violet", c1: "#06B6D4", c2: "#8B5CF6", c3: "#FFFFFF" },
  { name: "Royal Indigo", c1: "#6366F1", c2: "#4F46E5", c3: "#FFFFFF" },
  { name: "Emerald Cyber", c1: "#10B981", c2: "#059669", c3: "#FFFFFF" },
  { name: "Sunset Amber", c1: "#F59E0B", c2: "#EF4444", c3: "#FFFFFF" },
  { name: "Neon Magenta", c1: "#EC4899", c2: "#8B5CF6", c3: "#FFFFFF" },
  { name: "Dark Titanium", c1: "#1E293B", c2: "#0EA5E9", c3: "#F8FAFC" },
];

/**
 * Modern Glassmorphic Color Picker Input with Swatch, Native Picker, & Hex Input
 */
function ColorInputCard({ label, subtitle, color, onChange, suggestedShades = [] }) {
  const [copied, setCopied] = useState(false);
  const colorInputRef = useRef(null);

  const handleTextChange = (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#") && val.length > 0) {
      val = "#" + val;
    }
    onChange(val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    toast.info(`Copied ${color} to clipboard`, { autoClose: 1500 });
    setTimeout(() => setCopied(false), 1500);
  };

  // Safe color for input type=color
  const safeHex = /^#[0-9A-Fa-f]{6}$/.test(color) ? color : "#8B5CF6";

  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all space-y-3 relative group shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-white tracking-wide block">{label}</span>
          <span className="text-[11px] text-gray-400 block mt-0.5">{subtitle}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy HEX"
          className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-white/5 transition-colors text-xs cursor-pointer"
        >
          {copied ? <FiCheck size={12} className="text-emerald-400" /> : <FiCopy size={12} />}
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Visual Swatch with hidden triggerable color input */}
        <div className="relative">
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className="w-12 h-12 rounded-xl border-2 border-white/20 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer relative overflow-hidden flex items-center justify-center group/swatch"
            style={{
              backgroundColor: color,
              boxShadow: `0 4px 14px ${safeHex}55`,
            }}
          >
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/swatch:opacity-100 flex items-center justify-center transition-opacity">
              <FiEye size={14} className="text-white drop-shadow" />
            </div>
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={safeHex}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
          />
        </div>

        {/* Formatted HEX Code Input */}
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono font-bold">
            #
          </span>
          <input
            type="text"
            value={color.replace(/^#/, "").toUpperCase()}
            onChange={handleTextChange}
            maxLength={7}
            placeholder="HEX"
            className="w-full pl-7 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono font-semibold text-white tracking-wider focus:outline-none focus:border-cyan-500/80 transition-colors uppercase"
          />
        </div>
      </div>

      {/* Suggested Quick Shades */}
      {suggestedShades.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] text-gray-500 mr-1 font-medium">Shades:</span>
          {suggestedShades.map((shade, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(shade)}
              title={shade}
              className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 active:scale-95 cursor-pointer ${
                color.toLowerCase() === shade.toLowerCase() ? "border-white scale-110 shadow-sm" : "border-black/40"
              }`}
              style={{ backgroundColor: shade }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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

  // Mobile viewport toggle: 'config' vs 'preview'
  const [mobileTab, setMobileTab] = useState("config");

  // Widget Customization Settings
  const [settings, setSettings] = useState({
    color1: "#06B6D4",
    color2: "#8B5CF6",
    color3: "#FFFFFF",
    position: "right",
    greetingTime: 3,
    greetingMsg: ["Hello! How can I help you today?"],
    showAgent: true,
    isVoiceChat: false,
    agentVoice: "",
  });

  // 1. Fetch available agents
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
          color1: data.color1 || "#06B6D4",
          color2: data.color2 || "#8B5CF6",
          color3: data.color3 || "#FFFFFF",
          position: data.position || "right",
          greetingTime: data.greetingTime !== undefined ? data.greetingTime : 3,
          greetingMsg:
            Array.isArray(data.greetingMsg) && data.greetingMsg.length > 0
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

  // Add / Remove greeting messages
  const handleAddGreeting = () => {
    setSettings((prev) => ({
      ...prev,
      greetingMsg: [...prev.greetingMsg, ""],
    }));
  };

  const handleUpdateGreeting = (index, value) => {
    setSettings((prev) => {
      const copy = [...prev.greetingMsg];
      copy[index] = value;
      return { ...prev, greetingMsg: copy };
    });
  };

  const handleRemoveGreeting = (index) => {
    setSettings((prev) => {
      const copy = prev.greetingMsg.filter((_, i) => i !== index);
      return { ...prev, greetingMsg: copy.length > 0 ? copy : [""] };
    });
  };

  // Generate snippet
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
    <div className="space-y-6 sm:space-y-8 text-gray-100 w-full max-w-full">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 border border-cyan-500/30">
              Live Customizer
            </span>
            <span className="text-xs text-gray-400">• Shadow DOM v2.0</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
            Website Chat Widget Customizer
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Customize branding, floating launcher, avatar, greeting delays, and preview behavior in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {agentsList.length > 1 && (
            <div className="w-full sm:w-60">
              <CustomSelect
                value={activeAgent?._id || ""}
                onChange={handleSelectAgent}
                options={agentsList.map((a) => ({
                  value: a._id,
                  label: `${a.name} (${a.companyName || "Agent"})`,
                }))}
                placeholder="Select Agent"
              />
            </div>
          )}

          <button
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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

      {/* Mobile Tab Switcher (Visible on < lg screens - Sticky) */}
      <div className="flex lg:hidden items-center p-1 rounded-xl bg-[#0F1422]/90 border border-white/10 w-full max-w-sm mx-auto shadow-xl sticky top-2 z-20 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setMobileTab("config")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "config"
              ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FiSliders size={14} />
          <span>Customizer</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "preview"
              ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FiEye size={14} />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Main Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customization Controls (7 Cols on desktop) */}
        <div
          className={`space-y-6 lg:col-span-7 ${
            mobileTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Card 1: Launcher Avatar & Identity */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1422]/70 border border-white/10 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <FiUpload className="text-cyan-400 shrink-0" />
                  <span>Launcher Avatar & Brand Identity</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Custom image displayed in the floating launcher badge and chat header.
                </p>
              </div>
              <button
                onClick={() => setAvatarModalOpen(true)}
                className="shrink-0 whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition-colors cursor-pointer"
              >
                <FiUpload size={13} className="shrink-0" />
                <span>Upload Avatar</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="relative group cursor-pointer w-fit" onClick={() => setAvatarModalOpen(true)}>
                {activeAgent?.avatarUrl || activeAgent?.agentImg ? (
                  <img
                    src={activeAgent.avatarUrl || activeAgent.agentImg}
                    alt={activeAgent.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400/80 shadow-md group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <SiGooglegemini size={28} />
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-medium transition-opacity">
                  Edit
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white truncate">{activeAgent?.name || "AI Agent"}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                    Active
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {activeAgent?.companyName || "Website Assistant"} • API Key:{" "}
                  <span className="font-mono text-gray-300">
                    {activeAgent?.apiKey ? `${activeAgent.apiKey.substring(0, 14)}...` : "Configured"}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Click avatar to crop and update launcher image via Amazon S3.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Brand Theme & Colors (UI/UX Pro Max Glassmorphic Inputs) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1422]/70 border border-white/10 backdrop-blur-2xl shadow-xl space-y-5">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <FiSliders className="text-violet-400" />
                Brand Theme & Colors
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Configure color tokens for the floating launcher, chat header, bot message bubbles, and text contrast.
              </p>
            </div>

            {/* Quick Preset Themes */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400 font-medium block">Curated Preset Palettes:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PRESET_PALETTES.map((palette) => {
                  const isActive =
                    settings.color1.toLowerCase() === palette.c1.toLowerCase() &&
                    settings.color2.toLowerCase() === palette.c2.toLowerCase();

                  return (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          color1: palette.c1,
                          color2: palette.c2,
                          color3: palette.c3,
                        }))
                      }
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-cyan-500/15 border-2 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
                          : "bg-black/30 border border-white/10 hover:border-white/25 text-gray-300"
                      }`}
                    >
                      <div className="flex -space-x-1.5 shrink-0">
                        <span
                          className="w-4 h-4 rounded-full border border-black/50 shadow-sm"
                          style={{ backgroundColor: palette.c1 }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/50 shadow-sm"
                          style={{ backgroundColor: palette.c2 }}
                        />
                      </div>
                      <span className="truncate font-medium">{palette.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dedicated Professional Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <ColorInputCard
                label="Header & Launcher"
                subtitle="Primary theme color"
                color={settings.color1}
                onChange={(c) => setSettings((s) => ({ ...s, color1: c }))}
                suggestedShades={["#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6"]}
              />

              <ColorInputCard
                label="Bot Message Bubble"
                subtitle="Agent bubble accent"
                color={settings.color2}
                onChange={(c) => setSettings((s) => ({ ...s, color2: c }))}
                suggestedShades={["#8B5CF6", "#A855F7", "#EC4899", "#10B981", "#EF4444"]}
              />

              <ColorInputCard
                label="Text & Accent"
                subtitle="Contrast & button text"
                color={settings.color3}
                onChange={(c) => setSettings((s) => ({ ...s, color3: c }))}
                suggestedShades={["#FFFFFF", "#F8FAFC", "#E2E8F0", "#CBD5E1", "#080C14"]}
              />
            </div>
          </div>

          {/* Card 3: Position & Greeting Timing */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1422]/70 border border-white/10 backdrop-blur-2xl shadow-xl space-y-5">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <FiZap className="text-cyan-400" />
                Position & Timing Behavior
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Select floating dock location on the visitor screen and automatic greeting delay.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Position Toggle */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                <label className="text-xs text-gray-300 font-medium block">
                  Floating Launcher Dock Placement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, position: "right" }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-300 font-medium">Greeting Auto-Popup Delay</label>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                    {settings.greetingTime}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={settings.greetingTime}
                  onChange={(e) => setSettings((s) => ({ ...s, greetingTime: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Instant (0s)</span>
                  <span>5s</span>
                  <span>10s</span>
                  <span>15s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Greeting Messages */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1422]/70 border border-white/10 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <FiMessageSquare className="text-violet-400 shrink-0" />
                  <span>Greeting Message Templates</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  First proactive message sent to greet your website visitors.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddGreeting}
                className="shrink-0 whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition-colors cursor-pointer"
              >
                <FiPlus size={13} className="shrink-0" />
                <span>Add Message</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {settings.greetingMsg.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={msg}
                    onChange={(e) => handleUpdateGreeting(idx, e.target.value)}
                    placeholder="Enter proactive welcome greeting..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/80"
                  />
                  {settings.greetingMsg.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGreeting(idx)}
                      className="p-2.5 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Embed Code Snippet */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1422]/70 border border-white/10 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <FiCode className="text-emerald-400 shrink-0" />
                  <span>Embed On Your Website</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Paste this single script tag right before the closing <code className="text-cyan-300 font-mono text-[11px]">&lt;/body&gt;</code> tag.
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="shrink-0 whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                {copied ? <FiCheck size={14} className="text-emerald-400 shrink-0" /> : <FiCopy size={14} className="shrink-0" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 p-4">
              <pre className="text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                {codeSnippet}
              </pre>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-gray-400 bg-cyan-500/[0.05] border border-cyan-500/15 p-3.5 rounded-xl">
              <FiInfo size={16} className="text-cyan-400 shrink-0" />
              <span>
                <strong>Shadow DOM Isolation:</strong> The widget runs inside an isolated shadow root so it will never conflict with your website's CSS, fonts, or frameworks.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Preview (5 Cols on desktop - Sticky) */}
        <div
          className={`space-y-4 lg:col-span-5 lg:sticky lg:top-6 ${
            mobileTab === "config" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10 lg:hidden">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <FiEye className="text-cyan-400" /> Live Interactive Preview
            </span>
            <button
              type="button"
              onClick={() => setMobileTab("config")}
              className="text-xs text-cyan-400 hover:underline"
            >
              &larr; Back to Settings
            </button>
          </div>

          <LiveWidgetPreview
            agent={activeAgent}
            settings={settings}
            onOpenAvatarModal={() => setAvatarModalOpen(true)}
          />
        </div>
      </div>

      {/* Avatar Cropper Modal */}
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
