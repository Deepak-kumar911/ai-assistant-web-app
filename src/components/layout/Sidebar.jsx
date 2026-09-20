import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiCpu,
  FiZap,
  FiInbox,
  FiMessageSquare,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiLogOut,
  FiCalendar,
  FiClock,
  FiX,
} from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, closeMobileSidebar } from '../../stateManagement/slices/uiSlice';
import { logout } from '../../stateManagement/slices/authSlice';
import { logoutApi } from '../../api/authApi';
import { clearAuthTokens } from '../../utils/helperFunction';
import { motion, AnimatePresence } from 'framer-motion';
import { SiGooglegemini } from 'react-icons/si';
import AccountSwitcher from './AccountSwitcher';

// Primary workspace navigation
const mainNavItems = [
  { url: '/dashboard', icon: FiGrid, text: 'Dashboard' },
  { url: '/ai-agent', icon: FiCpu, text: 'AI Agents', badge: '3' },
  { url: '/inbox', icon: FiMessageSquare, text: 'Chat & DMs' },
];

// Reorganized Instagram parent section with plain, business-friendly sub-items (Task 45)
const instagramNav = {
  id: 'instagram',
  title: 'Instagram Automation',
  icon: FaInstagram,
  items: [
    { url: '/workflows', icon: FiZap, text: 'Comments & Workflows' },
    { url: '/scheduler', icon: FiCalendar, text: 'Post Scheduler' },
    { url: '/post-scheduler', icon: FiClock, text: 'Scheduled Posts' },
    { url: '/analytics', icon: FiBarChart2, text: 'Insights & Analytics' },
  ],
};

// Workspace utilities
const secondaryNavItems = [
  { url: '/tasks', icon: FiInbox, text: 'Form Responses' },
  { url: '/team', icon: FiUsers, text: 'Team' },
  { url: '/settings', icon: FiSettings, text: 'Settings' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const { sidebarOpen, mobileSidebarOpen } = useSelector((state) => state?.ui);
  const auth = useSelector((state) => state?.auth);
  const user = auth?.details;
  const location = useLocation();
  const navigate = useNavigate();

  const isInstagramRoute =
    location.pathname.includes('/workflows') ||
    location.pathname.includes('/scheduler') ||
    location.pathname.includes('/post-scheduler') ||
    location.pathname.includes('/analytics') ||
    location.pathname.includes('/instagram');

  const [instagramExpanded, setInstagramExpanded] = useState(true);

  // Auto-expand if active route is an Instagram page
  useEffect(() => {
    if (isInstagramRoute) {
      setInstagramExpanded(true);
    }
  }, [location.pathname]);

  const isActive = (url) => location.pathname === url || location.pathname.startsWith(url + '/');

  const handleNavigation = (url) => {
    navigate(url);
    if (mobileSidebarOpen) {
      dispatch(closeMobileSidebar());
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // ignore
    }
    clearAuthTokens();
    dispatch(logout());
    navigate('/sign-in');
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
    return user?.email?.substring(0, 2).toUpperCase() || 'AI';
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 z-40 h-full bg-[#0F0F12] border-r border-white/5 flex-col hidden md:flex select-none"
    >
      {/* Logo Area */}
      <div
        className={`flex items-center h-16 px-4 ${
          sidebarOpen ? 'justify-between' : 'justify-center'
        } border-b border-white/5`}
      >
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
          className="items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors hidden md:flex cursor-pointer"
        >
          {sidebarOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
        </button>
      </div>

      {/* Workspace Switcher (Task 42) */}
      {sidebarOpen ? (
        <div className="px-3 pt-3">
          <AccountSwitcher className="w-full" />
        </div>
      ) : (
        <div className="px-2 pt-3 flex justify-center">
          <AccountSwitcher compact className="w-auto" />
        </div>
      )}

      {/* Main Navigation Scroll Area */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* Core items */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            return (
              <motion.button
                key={item.url}
                onClick={() => handleNavigation(item.url)}
                className={`relative flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-white border border-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  size={19}
                  className={active ? 'text-cyan-400' : 'group-hover:text-cyan-400 transition-colors'}
                />
                {sidebarOpen && <span className="text-sm font-medium">{item.text}</span>}
                {item.badge && sidebarOpen && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1A1A1E] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 shadow-xl z-50">
                    {item.text}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* --- REORGANIZED INSTAGRAM PARENT SECTION (Task 45) --- */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          {sidebarOpen ? (
            <div>
              {/* Parent Section Header with Collapse toggle */}
              <button
                type="button"
                onClick={() => setInstagramExpanded((prev) => !prev)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <FaInstagram size={15} className="text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-bold">
                    {instagramNav.title}
                  </span>
                </div>
                <FiChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${
                    instagramExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {/* Sub-items */}
              <AnimatePresence initial={false}>
                {instagramExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 pl-2 pt-1"
                  >
                    {instagramNav.items.map((sub) => {
                      const SubIcon = sub.icon;
                      const active = isActive(sub.url);
                      return (
                        <motion.button
                          key={sub.url}
                          onClick={() => handleNavigation(sub.url)}
                          className={`relative flex items-center w-full gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group cursor-pointer ${
                            active
                              ? 'bg-gradient-to-r from-pink-500/15 to-purple-500/15 text-white border border-pink-500/30'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <SubIcon
                            size={16}
                            className={
                              active
                                ? 'text-pink-400'
                                : 'text-gray-500 group-hover:text-pink-400 transition-colors'
                            }
                          />
                          <span className="truncate">{sub.text}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Collapsed rail display
            <div className="relative group">
              <motion.button
                onClick={() => handleNavigation('/workflows')}
                className={`relative flex items-center justify-center w-full p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isInstagramRoute
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FaInstagram size={20} className={isInstagramRoute ? 'text-pink-400' : 'text-gray-400'} />
              </motion.button>

              {/* Flyout Submenu on hover */}
              <div className="absolute left-full top-0 ml-2 p-2 bg-[#141418] border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all w-52 space-y-1 z-50">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-pink-400 border-b border-white/5 mb-1">
                  Instagram Automation
                </div>
                {instagramNav.items.map((sub) => {
                  const SubIcon = sub.icon;
                  const active = isActive(sub.url);
                  return (
                    <button
                      key={sub.url}
                      onClick={() => handleNavigation(sub.url)}
                      className={`flex items-center w-full gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                        active
                          ? 'bg-pink-500/20 text-pink-300'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <SubIcon size={14} className={active ? 'text-pink-400' : 'text-gray-400'} />
                      <span className="truncate">{sub.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Workspace Management items */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          {sidebarOpen && (
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Workspace
            </div>
          )}
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            return (
              <motion.button
                key={item.url}
                onClick={() => handleNavigation(item.url)}
                className={`relative flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-white border border-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  size={19}
                  className={active ? 'text-cyan-400' : 'group-hover:text-cyan-400 transition-colors'}
                />
                {sidebarOpen && <span className="text-sm font-medium">{item.text}</span>}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1A1A1E] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 shadow-xl z-50">
                    {item.text}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        <div
          className={`flex items-center ${
            sidebarOpen ? 'justify-between' : 'justify-center'
          } p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors`}
        >
          <div
            onClick={() => navigate('/settings?search=profile')}
            className={`flex items-center ${sidebarOpen ? 'gap-3 flex-1 min-w-0' : 'justify-center'} cursor-pointer group`}
            title="Profile & Settings"
          >
            <div className="relative shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'User'}
                  className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:border-cyan-500/50 transition-colors"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/20 transition-all">
                  <span className="text-white font-semibold">{getInitials()}</span>
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#0F0F12]" />
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </motion.aside>
  );

  // Mobile Sidebar (Drawer)
  const MobileSidebar = () => (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => dispatch(closeMobileSidebar())}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 z-50 w-72 h-full bg-[#0F0F12] border-r border-white/10 flex flex-col shadow-2xl md:hidden select-none"
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
                onClick={() => dispatch(closeMobileSidebar())}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Drawer Workspace Switcher */}
            <div className="px-4 pt-3">
              <AccountSwitcher className="w-full" />
            </div>

            {/* Drawer Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  return (
                    <button
                      key={item.url}
                      onClick={() => handleNavigation(item.url)}
                      className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-white border border-white/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={19} className={active ? 'text-cyan-400' : ''} />
                      <span className="text-sm font-medium flex-1 text-left">{item.text}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instagram Section (Mobile) */}
              <div className="space-y-1 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-pink-400">
                  <FaInstagram size={15} />
                  <span>{instagramNav.title}</span>
                </div>
                <div className="space-y-1 pl-2">
                  {instagramNav.items.map((sub) => {
                    const SubIcon = sub.icon;
                    const active = isActive(sub.url);
                    return (
                      <button
                        key={sub.url}
                        onClick={() => handleNavigation(sub.url)}
                        className={`flex items-center w-full gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                          active
                            ? 'bg-pink-500/15 text-white border border-pink-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <SubIcon size={16} className={active ? 'text-pink-400' : 'text-gray-400'} />
                        <span>{sub.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Navigation (Mobile) */}
              <div className="space-y-1 pt-2 border-t border-white/5">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Workspace
                </div>
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  return (
                    <button
                      key={item.url}
                      onClick={() => handleNavigation(item.url)}
                      className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-white border border-white/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={19} className={active ? 'text-cyan-400' : ''} />
                      <span className="text-sm font-medium flex-1 text-left">{item.text}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Drawer User Profile Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => {
                    navigate('/settings?search=profile');
                    dispatch(closeMobileSidebar());
                  }}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
                  title="Profile & Settings"
                >
                  <div className="relative shrink-0">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user?.name || 'User'}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:border-cyan-500/50 transition-colors"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/20 transition-all">
                        <span className="text-white font-semibold">{getInitials()}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#0F0F12]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}