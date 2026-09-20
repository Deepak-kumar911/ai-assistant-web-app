import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiX,
  FiRotateCcw,
  FiMessageSquare,
  FiLock,
} from "react-icons/fi";
import { SiGooglegemini } from "react-icons/si";

export default function LiveWidgetPreview({
  agent,
  settings,
  onOpenAvatarModal,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [replayKey, setReplayKey] = useState(0);

  const color1 = settings?.color1 || "#824dff";
  const color2 = settings?.color2 || "#ff4242";
  const color3 = settings?.color3 || "#ffffff";
  const position = settings?.position || "right";
  const greetingTime = Number(settings?.greetingTime) || 3;
  const greetingText = settings?.greetingMsg?.[0] || "Hello! How can I help you today?";
  const agentName = agent?.name || "Support Assistant";
  const avatarUrl = agent?.avatarUrl || agent?.agentImg || "";

  // Reset & run greeting delay timer whenever greetingTime or replayKey changes
  useEffect(() => {
    setShowGreeting(false);
    setCountdown(greetingTime);

    let remaining = greetingTime;
    const interval = setInterval(() => {
      remaining -= 1;
      setCountdown(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(interval);
        setShowGreeting(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [greetingTime, replayKey]);

  // Default conversation template
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: "bot",
        text: greetingText,
        time: "Just now",
      },
    ]);
  }, [greetingText]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: inputText.trim(),
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate AI typing response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: `Thanks for asking! I'm ${agentName}, configured live to answer questions about products, services, and bookings.`,
          time: "Just now",
        },
      ]);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Preview Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-semibold text-white tracking-wide uppercase whitespace-nowrap">
            Live Sandbox Preview
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setReplayKey((k) => k + 1)}
            title="Replay greeting delay countdown"
            className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <FiRotateCcw size={12} className="shrink-0" />
            <span>
              {countdown > 0 ? `Trigger in ${countdown}s` : "Replay Greeting"}
            </span>
          </button>
          <button
            onClick={() => setIsOpen((open) => !open)}
            className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors cursor-pointer"
          >
            <FiMessageSquare size={12} className="shrink-0" />
            <span>{isOpen ? "Close Chat" : "Open Chat"}</span>
          </button>
        </div>
      </div>

      {/* Browser Mockup Chrome */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-[#080C14]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.04] text-[11px] text-gray-400 max-w-xs w-full justify-center">
            <FiLock size={10} className="text-emerald-400" />
            <span className="truncate">https://yourstore.com/preview</span>
          </div>
        </div>
      </div>

      {/* Simulated Website Canvas */}
      <div className="relative flex-1 min-h-[460px] md:min-h-[560px] bg-gradient-to-b from-[#080C14] to-[#0D111A] p-6 overflow-hidden select-none">
        {/* Mock Webpage Content Behind Widget */}
        <div className="space-y-6 max-w-md opacity-40 pointer-events-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500" />
              <div className="h-3 w-20 bg-white/20 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-10 bg-white/10 rounded" />
              <div className="h-2 w-10 bg-white/10 rounded" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="h-6 w-3/4 bg-white/20 rounded-md" />
            <div className="h-3 w-full bg-white/10 rounded" />
            <div className="h-3 w-5/6 bg-white/10 rounded" />
            <div className="pt-2 flex gap-3">
              <div className="h-8 w-24 rounded-lg bg-cyan-500/30" />
              <div className="h-8 w-24 rounded-lg bg-white/10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="h-24 rounded-xl bg-white/[0.03] border border-white/5 p-3 space-y-2">
              <div className="h-3 w-16 bg-white/20 rounded" />
              <div className="h-2 w-full bg-white/10 rounded" />
              <div className="h-2 w-3/4 bg-white/10 rounded" />
            </div>
            <div className="h-24 rounded-xl bg-white/[0.03] border border-white/5 p-3 space-y-2">
              <div className="h-3 w-16 bg-white/20 rounded" />
              <div className="h-2 w-full bg-white/10 rounded" />
              <div className="h-2 w-3/4 bg-white/10 rounded" />
            </div>
          </div>
        </div>

        {/* --- SIMULATED CHAT WIDGET ROOT --- */}
        <div
          className={`absolute bottom-6 ${
            position === "left" ? "left-6" : "right-6"
          } z-30 flex flex-col ${
            position === "left" ? "items-start" : "items-end"
          }`}
        >
          {/* Animated Greeting Speech Bubble */}
          <AnimatePresence>
            {!isOpen && showGreeting && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="mb-3 max-w-[240px] bg-white text-gray-900 px-4 py-3 rounded-2xl shadow-xl border border-gray-100 text-xs font-medium relative cursor-pointer"
                onClick={() => setIsOpen(true)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span>{greetingText}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGreeting(false);
                    }}
                    className="text-gray-400 hover:text-gray-700 p-0.5 rounded"
                  >
                    <FiX size={12} />
                  </button>
                </div>
                {/* Pointer arrow pointing down to launcher */}
                <div
                  className={`absolute -bottom-1.5 ${
                    position === "left" ? "left-6" : "right-6"
                  } w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Chat Window Modal */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="w-[310px] sm:w-[340px] h-[430px] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10 mb-3 bg-white"
              >
                {/* Chat Header styled with color1 */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${color1}, ${color2})`,
                  }}
                  className="px-4 py-3 flex items-center justify-between text-white shadow-md relative"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={agentName}
                          className="w-9 h-9 rounded-full object-cover border-2 border-white/40 shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40 text-white">
                          <SiGooglegemini size={18} />
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm tracking-tight truncate max-w-[150px]">
                          {agentName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-semibold uppercase">
                          AI
                        </span>
                      </div>
                      <span className="text-[11px] text-white/80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                        Online now
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F8FAFC]">
                  <div className="text-center my-1">
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-200/60 px-2.5 py-0.5 rounded-full">
                      Today
                    </span>
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        style={
                          msg.sender === "bot"
                            ? { backgroundColor: color2, color: "#ffffff" }
                            : { backgroundColor: "#E2E8F0", color: "#1E293B" }
                        }
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs shadow-sm ${
                          msg.sender === "user"
                            ? "rounded-br-xs"
                            : "rounded-bl-xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 px-1">
                        {msg.time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Simulated Input Field */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a test message..."
                    className="flex-1 bg-gray-100 text-gray-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: color1 }}
                    className="p-2 rounded-xl text-white hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <FiSend size={14} />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Launcher Button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen((open) => !open)}
            style={{
              backgroundColor: color1,
              boxShadow: `0 8px 24px -4px ${color1}66`,
            }}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white border-2 border-white/30 cursor-pointer relative group transition-all"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Chat Launcher"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <SiGooglegemini size={24} className="text-white" />
            )}

            {/* Notification Dot */}
            {!isOpen && showGreeting && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
                1
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
