import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiCpu,
  FiInbox,
  FiMessageSquare,
  FiUsers,
  FiSettings,
} from 'react-icons/fi';

const mobileNavItems = [
  { url: '/dashboard', icon: FiGrid, label: 'Home', tooltip: 'Dashboard Overview' },
  { url: '/ai-agent', icon: FiCpu, label: 'Agents', tooltip: 'AI Agent Management' },
  { url: '/inbox', icon: FiMessageSquare, label: 'Inbox', tooltip: 'Messages & Chats' },
  { url: '/tasks', icon: FiInbox, label: 'Responses', tooltip: 'Form Responses' },
  { url: '/team', icon: FiUsers, label: 'Team', tooltip: 'Team Members' },
  { url: '/settings', icon: FiSettings, label: 'Settings', tooltip: 'Account & Preferences' },
];

export default function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredTab, setHoveredTab] = useState(null);

  const isActive = (url) => {
    if (url === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080C14]/90 backdrop-blur-2xl border-t border-white/[0.08] select-none pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-1 py-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          const isHovered = hoveredTab === item.url;

          return (
            <div
              key={item.url}
              className="relative flex flex-col items-center flex-1"
              onMouseEnter={() => setHoveredTab(item.url)}
              onMouseLeave={() => setHoveredTab(null)}
              onFocus={() => setHoveredTab(item.url)}
              onBlur={() => setHoveredTab(null)}
            >
              {/* Custom animated tooltip on hover/focus - no default browser tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-9 z-50 pointer-events-none whitespace-nowrap px-2.5 py-1 text-[11px] font-medium text-[#F8FAFC] bg-[#1E293B]/95 border border-white/15 rounded-lg shadow-2xl backdrop-blur-xl flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{item.tooltip || item.label}</span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-[#1E293B]" />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={() => navigate(item.url)}
                className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all duration-200 w-full cursor-pointer focus:outline-none ${
                  active
                    ? 'text-cyan-400'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] active:scale-95'
                }`}
                aria-label={item.label}
              >
                <Icon
                  size={20}
                  className={active ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : ''}
                />
                <span className="text-[10px] font-medium tracking-tight">
                  {item.label}
                </span>

                {/* Active Indicator bar */}
                {active && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px_#06B6D4]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}