export const agentPosition = [
    { label: "Right", value: "right" },
    { label: "Left", value: "left" },
]

export const agentVoice = [
    { label: "Voice 1", value: "voice-1" },
    { label: "Voice 2", value: "voice-2" },
]

export const themes = {
  light: {
    bg: "bg-slate-50",                 
    text: "text-zinc-800",
    textMuted: "text-zinc-500",
    textSimple: "text-sm text-zinc-600",

    // Layout
    sidebar: "bg-white shadow-md",
    card: "bg-white/90 backdrop-blur-md shadow-sm",
    subcard: "bg-slate-100 hover:bg-slate-200 transition rounded-xl", // 👈 subcard

    border: "border-slate-200",
    hover: "hover:bg-slate-100 transition",
    shadow: "shadow-md",
    shadowHover: "hover:shadow-lg",

    // Brand Buttons
    button: "px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md",
    buttonHover: "hover:opacity-90 hover:shadow-lg transition-all duration-200", // 👈 smooth hover

    primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
    primaryHover: "hover:opacity-90",
    accent: "bg-gradient-to-r from-cyan-500 to-teal-500 text-white",

    // Status
    success: "bg-emerald-500 text-white",
    warning: "bg-amber-500 text-white",
    danger: "bg-rose-500 text-white",

    // Inputs
    input: "bg-white border border-slate-300 focus:ring-2 focus:ring-indigo-400",
    inputText: "text-zinc-800",
  },

  dark: {
    bg: "bg-zinc-900",
    text: "text-zinc-100",
    textMuted: "text-zinc-400",
    textSimple: "text-sm text-zinc-300",

    // Layout
    sidebar: "bg-zinc-800 shadow-md",
    card: "bg-zinc-800/90 backdrop-blur-md",
    subcard: "bg-zinc-700 hover:bg-zinc-600 transition rounded-xl", // 👈 subcard

    border: "border-zinc-700",
    hover: "hover:bg-zinc-700 transition",
    shadow: "shadow-md",
    shadowHover: "hover:shadow-xl",

    // Brand Buttons
    button: "px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md",
    buttonHover: "hover:opacity-90 hover:shadow-xl transition-all duration-200", // 👈 smooth hover

    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
    primaryHover: "hover:opacity-90",
    accent: "bg-gradient-to-r from-teal-400 to-cyan-500 text-gray-900",

    // Status
    success: "bg-emerald-400 text-gray-900",
    warning: "bg-amber-400 text-gray-900",
    danger: "bg-rose-500 text-white",

    // Inputs
    input: "bg-zinc-800 border border-zinc-600 focus:ring-2 focus:ring-purple-400",
    inputText: "text-zinc-100",
  },
};

