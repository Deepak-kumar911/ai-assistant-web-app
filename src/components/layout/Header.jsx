import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiMenu, FiArrowRight, FiCheckCircle, FiZap, FiLayers, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openMobileSidebar } from '../../stateManagement/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  const auth = useSelector((state) => state?.auth);
  const user = auth?.details;

  const notifications = [
    {
      id: 1,
      title: 'Workflow completed',
      message: 'Customer support agent finished processing queue',
      time: '2 min ago',
      read: false,
      type: 'success',
      icon: FiCheckCircle,
    },
    {
      id: 2,
      title: 'AI model updated',
      message: 'GPT-4 Turbo is now available for your agents',
      time: '1 hour ago',
      read: false,
      type: 'update',
      icon: FiZap,
    },
    {
      id: 3,
      title: 'Integration connected',
      message: 'Slack workspace connected successfully',
      time: '3 hours ago',
      read: true,
      type: 'integration',
      icon: FiLayers,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle click outside and Escape key to close notifications modal
  useEffect(() => {
    if (!notificationsOpen) return;

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen]);

  const handleMenuClick = () => {
    dispatch(openMobileSidebar());
  };

  const handleViewAllNotifications = () => {
    setNotificationsOpen(false);
    navigate('/settings?search=notification');
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'AI';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080C14]/80 backdrop-blur-xl border-b border-white/[0.08] select-none transition-colors">
      <div className="flex items-center justify-between px-4 md:px-6 h-full max-w-full">
        {/* Left section - Mobile Hamburger Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleMenuClick}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/40"
            aria-label="Open sidebar menu"
          >
            <FiMenu size={20} />
          </button>
        </div>

        {/* Right section - Notifications & Solo Profile Image */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 cursor-pointer border focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/40 ${
                notificationsOpen
                  ? 'bg-white/[0.1] text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] border-white/[0.08]'
              }`}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <FiBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_8px_#06B6D4]" />
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="fixed right-3 sm:absolute sm:right-0 mt-2.5 w-[calc(100vw-1.5rem)] sm:w-88 md:w-96 bg-[#0F172A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {/* Dropdown Header */}
                  <div className="px-4 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      <h3 className="font-semibold text-[#F8FAFC] text-sm tracking-wide">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06] transition-colors"
                      aria-label="Close notifications"
                    >
                      <FiX size={15} />
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[340px] overflow-y-auto divide-y divide-white/[0.05] custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => {
                        const Icon = notif.icon;
                        return (
                          <div
                            key={notif.id}
                            className={`p-3.5 flex items-start gap-3 hover:bg-white/[0.04] transition-colors cursor-pointer group ${
                              !notif.read ? 'bg-cyan-500/[0.03]' : ''
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl shrink-0 border ${
                                notif.type === 'success'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : notif.type === 'update'
                                  ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              }`}
                            >
                              <Icon size={15} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-semibold text-[#F8FAFC] group-hover:text-cyan-300 transition-colors truncate">
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_#06B6D4]" />
                                )}
                              </div>
                              <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="inline-block text-[10px] text-[#64748B] mt-1.5">
                                {notif.time}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-10 text-center text-xs text-[#94A3B8]">
                        No notifications yet
                      </div>
                    )}
                  </div>

                  {/* Dropdown Footer - Navigate to settings?search=notification */}
                  <div className="p-2 border-t border-white/[0.08] bg-[#080C14]/60">
                    <button
                      onClick={handleViewAllNotifications}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 active:bg-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
                    >
                      <span>View all notifications</span>
                      <FiArrowRight
                        size={13}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile - Show ONLY profile image */}
          <div
            onClick={() => navigate('/settings?search=profile')}
            className="relative cursor-pointer group rounded-xl p-0.5 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/40"
            title={user?.name ? `${user.name} - Profile & Settings` : 'Profile & Settings'}
            aria-label="Profile and Settings"
          >
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'User Profile'}
                  className="w-9 h-9 rounded-xl object-cover border border-white/15 group-hover:border-cyan-400/60 group-hover:ring-2 group-hover:ring-cyan-500/25 transition-all duration-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06B6D4] to-violet-600 flex items-center justify-center shadow-md border border-white/10 group-hover:border-cyan-400/60 group-hover:ring-2 group-hover:ring-cyan-500/25 transition-all duration-200">
                  <span className="text-white text-xs font-semibold tracking-wide">
                    {getInitials()}
                  </span>
                </div>
              )}
              {/* Active online status badge */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#080C14]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}