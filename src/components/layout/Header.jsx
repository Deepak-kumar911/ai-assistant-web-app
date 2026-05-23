// components/layout/Header.tsx (Fixed with working menu button)
import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiChevronDown, FiPlus, FiMenu } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { openMobileSidebar, closeMobileSidebar } from '../../stateManagement/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const dispatch = useDispatch();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { mobileSidebarOpen } = useSelector((state) => state?.ui);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const notifications = [
    { id: 1, title: 'Workflow completed', message: 'Customer support agent finished processing', time: '2 min ago', read: false },
    { id: 2, title: 'AI model updated', message: 'GPT-4 Turbo is now available', time: '1 hour ago', read: false },
    { id: 3, title: 'Integration connected', message: 'Slack workspace connected successfully', time: '3 hours ago', read: true },
  ];

  const handleMenuClick = () => {
    console.log('Menu clicked - current state:', mobileSidebarOpen);
    dispatch(openMobileSidebar());
    console.log('Dispatched openMobileSidebar');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0F0F12]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
        {/* Left section - Mobile Menu Button */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={handleMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors active:bg-white/20"
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>
          
          {/* Desktop breadcrumbs */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 text-xs text-gray-500">
              <span>Workspace</span>
              <FiChevronDown size={12} />
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className={`flex-1 max-w-lg mx-2 md:mx-4 transition-all duration-300 ${searchOpen ? 'absolute left-4 right-4 z-50' : ''}`}>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder={isMobile ? "Search..." : "Search workflows, agents, integrations..."}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 md:py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
            {!isMobile && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white/10 rounded text-gray-400">⌘</kbd>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white/10 rounded text-gray-400">K</kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 md:gap-2">
          <button className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
            <FiPlus size={16} />
            <span className="hidden md:inline">New Workflow</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <FiBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full" />
            </button>
            
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="fixed right-4 md:absolute md:right-0 mt-2 w-[calc(100vw-2rem)] md:w-80 bg-[#151519] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-white/10">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-3 hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-cyan-500/5' : ''}`}>
                        <p className="text-sm font-medium text-white">{notif.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User dropdown */}
          <button className="flex items-center gap-2 ml-1 md:ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
              <span className="text-white text-xs md:text-sm font-medium">JD</span>
            </div>
            <FiChevronDown size={16} className="hidden md:block text-gray-400" />
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md md:hidden"
            onClick={() => setSearchOpen(false)}
          >
            <div className="p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white text-base"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="px-4 py-3 bg-white/10 rounded-xl text-white font-medium"
                >
                  Cancel
                </button>
              </div>
              <div className="text-gray-400 text-center py-8">
                Type to search workflows, agents, and more...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}