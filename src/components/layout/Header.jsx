// components/layout/Header.jsx
import React, { useState } from 'react';
import { FiBell, FiMenu } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openMobileSidebar } from '../../stateManagement/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const auth = useSelector((state) => state?.auth);
  const user = auth?.details;

  const notifications = [
    { id: 1, title: 'Workflow completed', message: 'Customer support agent finished processing', time: '2 min ago', read: false },
    { id: 2, title: 'AI model updated', message: 'GPT-4 Turbo is now available', time: '1 hour ago', read: false },
    { id: 3, title: 'Integration connected', message: 'Slack workspace connected successfully', time: '3 hours ago', read: true },
  ];

  const handleMenuClick = () => {
    dispatch(openMobileSidebar());
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0F0F12]/80 backdrop-blur-xl border-b border-white/5 select-none">
      <div className="flex items-center justify-between px-4 md:px-6 h-14 md:h-16">
        {/* Left section - Mobile Menu Hamburger Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMenuClick}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors active:bg-white/20 cursor-pointer"
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>
        </div>

        {/* Right section - Notifications & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
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
                  <div className="p-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-white text-sm">Notifications</h3>
                    <span className="text-[10px] text-cyan-400 font-medium">3 New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-3 hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-cyan-500/5' : ''}`}>
                        <p className="text-sm font-medium text-white">{notif.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile with redirect to settings?search=profile */}
          <div
            onClick={() => navigate('/settings?search=profile')}
            className="flex items-center gap-2.5 p-1 md:p-1.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
            title="Profile & Settings"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-xl object-cover border border-white/10 group-hover:border-cyan-500/50 transition-colors"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center font-semibold shadow-md group-hover:shadow-cyan-500/20 transition-all">
                <span className="text-white text-xs font-medium">
                  {getInitials()}
                </span>
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}