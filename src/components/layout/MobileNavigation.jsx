// components/layout/MobileNavigation.tsx (Updated with better active state)
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiGrid, 
  FiCpu, 
  FiZap, 
  FiBarChart2, 
  FiSettings
} from 'react-icons/fi';

const mobileNavItems = [
  { url: '/dashboard', icon: FiGrid, label: 'Home' },
  { url: '/ai-agent', icon: FiCpu, label: 'Agents' },
  { url: '/workflows', icon: FiZap, label: 'Workflows' },
  { url: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  { url: '/settings', icon: FiSettings, label: 'Settings' },
];

export default function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (url) => {
    if (url === '/dashboard' && location.pathname === '/dashboard') return true;
    if (url !== '/dashboard' && location.pathname.includes(url)) return true;
    return false;
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F0F12]/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          return (
            <button
              key={item.url}
              onClick={() => navigate(item.url)}
              className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 min-w-[64px] ${
                active 
                  ? 'text-cyan-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={22} className={active ? 'drop-shadow-glow' : ''} />
              <span className="text-[11px] font-medium">{item.label}</span>
              {active && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute -top-[1px] left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}