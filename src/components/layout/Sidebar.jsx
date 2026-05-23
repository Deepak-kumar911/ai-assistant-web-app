// components/layout/Sidebar.tsx (Complete working version with debugging)
import React, { useEffect } from 'react';
import { 
  FiGrid, 
  FiCpu, 
  FiSettings, 
  FiLogOut, 
  FiChevronLeft,
  FiChevronRight,
  FiZap,
  FiBarChart2,
  FiX
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toggleSidebar, closeMobileSidebar } from '../../stateManagement/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { SiGooglegemini } from 'react-icons/si';

const navItems = [
  { url: '/dashboard', icon: FiGrid, text: 'Dashboard', badge: null },
  { url: '/ai-agent', icon: FiCpu, text: 'AI Agents', badge: '3' },
  { url: '/workflows', icon: FiZap, text: 'Workflows', badge: null },
  { url: '/analytics', icon: FiBarChart2, text: 'Analytics', badge: null },
  { url: '/settings', icon: FiSettings, text: 'Settings', badge: null },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const { sidebarOpen, mobileSidebarOpen } = useSelector((state) => state?.ui);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (url) => location.pathname.includes(url);

  const handleNavigation = (url) => {
    navigate(url);
    // Close mobile sidebar on navigation
    if (mobileSidebarOpen) {
      dispatch(closeMobileSidebar());
    }
  };

  // Desktop Sidebar - Only visible on desktop
  const DesktopSidebar = () => (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 z-40 h-full bg-[#0F0F12] border-r border-white/5 flex-col hidden md:flex"
    >
      {/* Logo Area */}
      <div className={`flex items-center h-16 px-4 ${sidebarOpen ? 'justify-between' : 'justify-center'} border-b border-white/5`}>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <SiGooglegemini className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Automate AI
            </span>
          </motion.div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors hidden md:flex"
        >
          {sidebarOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          return (
            <motion.button
              key={item.url}
              onClick={() => handleNavigation(item.url)}
              className={`relative flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active 
                  ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-white border border-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={20} className={active ? 'text-cyan-400' : 'group-hover:text-cyan-400 transition-colors'} />
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.text}</span>
              )}
              {item.badge && sidebarOpen && (
                <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 z-50">
                  {item.text}
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold">JD</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#0F0F12]" />
          </div>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-white truncate">John Doe</p>
              <p className="text-xs text-gray-400 truncate">john@automate.ai</p>
            </motion.div>
          )}
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </motion.aside>
  );

  // Mobile Sidebar (Drawer)
  const MobileSidebar = () => {
    // Debug log
    useEffect(() => {
      console.log('MobileSidebar Open State:', mobileSidebarOpen);
    }, [mobileSidebarOpen]);

    return (
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
              onClick={() => {
                console.log('Backdrop clicked - closing sidebar');
                dispatch(closeMobileSidebar());
              }}
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 w-72 h-full bg-[#0F0F12] border-r border-white/10 flex flex-col shadow-2xl md:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                    <SiGooglegemini className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Automate AI
                  </span>
                </div>
                <button
                  onClick={() => {
                    console.log('Close button clicked');
                    dispatch(closeMobileSidebar());
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors active:bg-white/20"
                  aria-label="Close menu"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Drawer Navigation */}
              <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  return (
                    <button
                      key={item.url}
                      onClick={() => handleNavigation(item.url)}
                      className={`flex items-center w-full gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                        active 
                          ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-white border border-white/10' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={20} className={active ? 'text-cyan-400' : ''} />
                      <span className="text-sm font-medium flex-1 text-left">{item.text}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Drawer User Profile */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold">JD</span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#0F0F12]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">John Doe</p>
                    <p className="text-xs text-gray-400 truncate">john@automate.ai</p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                    <FiLogOut size={18} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}