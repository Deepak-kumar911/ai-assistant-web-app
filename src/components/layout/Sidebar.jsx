import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiCpu,
  FiMessageSquare,
  FiUsers,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiInbox,
  FiX,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, closeMobileSidebar } from '../../stateManagement/slices/uiSlice';
import { logout } from '../../stateManagement/slices/authSlice';
import { logoutApi } from '../../api/authApi';
import { clearAuthTokens } from '../../utils/helperFunction';
import { motion, AnimatePresence } from 'framer-motion';
import { SiGooglegemini } from 'react-icons/si';
import AccountSwitcher from './AccountSwitcher';
import { ConfirmDialog } from '../ui/ConfirmDialog';

// Primary workspace navigation - clean, user-friendly names, no badges/counts
const mainNavItems = [
  { url: '/dashboard', icon: FiGrid, text: 'Dashboard' },
  { url: '/ai-agent', icon: FiCpu, text: 'AI Agents' },
  { url: '/inbox', icon: FiMessageSquare, text: 'Inbox' },
  { url: '/tasks', icon: FiInbox, text: 'Form Responses' },
];

// Workspace utilities
const secondaryNavItems = [
  { url: '/team', icon: FiUsers, text: 'Team' },
  { url: '/settings', icon: FiSettings, text: 'Settings' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const { sidebarOpen, mobileSidebarOpen } = useSelector((state) => state?.ui);
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (url) => location.pathname === url || location.pathname.startsWith(url + '/');

  const handleNavigation = (url) => {
    navigate(url);
    if (mobileSidebarOpen) {
      dispatch(closeMobileSidebar());
    }
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutApi();
    } catch (e) {
      // ignore network logout errors
    } finally {
      clearAuthTokens();
      dispatch(logout());
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      navigate('/sign-in');
    }
  };

  // Nav Item component to ensure consistent tooltips & centered alignment when collapsed
  const NavButton = ({ item, isCollapsed = false, isMobile = false }) => {
    const Icon = item.icon;
    const active = isActive(item.url);

    if (isCollapsed) {
      return (
        <div className="relative flex justify-center w-full group">
          <button
            type="button"
            onClick={() => handleNavigation(item.url)}
            className={`relative flex items-center justify-center w-11 h-11 shrink-0 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
              active
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06]'
            }`}
            aria-label={item.text}
          >
            <Icon size={20} className={active ? 'text-cyan-400 shrink-0' : 'group-hover:text-cyan-400 transition-colors shrink-0'} />
            {active && (
              <span className="absolute left-1 w-1 h-5 bg-cyan-400 rounded-full shadow-[0_0_8px_#06B6D4]" />
            )}
          </button>

          {/* Custom tooltip when collapsed */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1E293B]/95 backdrop-blur-xl text-[#F8FAFC] text-xs font-medium rounded-lg shadow-2xl border border-white/10 pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>{item.text}</span>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#1E293B]" />
          </div>
        </div>
      );
    }

    return (
      <motion.button
        onClick={() => handleNavigation(item.url)}
        className={`relative flex items-center w-full gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
          active
            ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/15 text-white border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-medium'
            : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.05]'
        }`}
        whileHover={{ x: isMobile ? 0 : 3 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon
          size={19}
          className={active ? 'text-cyan-400 shrink-0' : 'group-hover:text-cyan-400 transition-colors shrink-0'}
        />
        <span className="text-sm font-medium tracking-wide">{item.text}</span>
        {active && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4]" />
        )}
      </motion.button>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 z-40 h-full bg-[#080C14] border-r border-white/[0.08] flex-col hidden md:flex select-none shadow-2xl"
    >
      {/* Logo Area - Never squeezed when collapsed */}
      {sidebarOpen ? (
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.08]">
          <div
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
            onClick={() => handleNavigation('/dashboard')}
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <SiGooglegemini className="w-4 h-4 text-white shrink-0" />
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate">
              Automate AI
            </span>
          </div>

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer border border-white/[0.06] focus:outline-none"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <FiChevronLeft size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-16 border-b border-white/[0.08] relative group">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className="w-10 h-10 shrink-0 min-w-[40px] rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_14px_rgba(6,182,212,0.35)] cursor-pointer hover:scale-105 active:scale-95 transition-all focus:outline-none"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <SiGooglegemini className="w-5 h-5 text-white shrink-0" />
          </button>

          {/* Tooltip on hover when collapsed */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1E293B]/95 backdrop-blur-xl text-[#F8FAFC] text-xs font-medium rounded-lg shadow-2xl border border-white/10 pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Automate AI (Expand)</span>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#1E293B]" />
          </div>
        </div>
      )}

      {/* Workspace Switcher */}
      {sidebarOpen ? (
        <div className="px-3 pt-3">
          <AccountSwitcher className="w-full" />
        </div>
      ) : (
        <div className="px-2 pt-3 flex justify-center">
          <AccountSwitcher compact className="w-auto" />
        </div>
      )}

      {/* Main Navigation Area (Clean, no vertical scrollbar when collapsed) */}
      <nav
        className={`flex-1 py-4 space-y-4 ${
          sidebarOpen
            ? 'px-3 overflow-y-auto custom-scrollbar'
            : 'px-2 overflow-visible scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        }`}
      >
        {/* Core items */}
        <div className="space-y-1.5">
          {mainNavItems.map((item) => (
            <NavButton key={item.url} item={item} isCollapsed={!sidebarOpen} />
          ))}
        </div>

        {/* Workspace Utilities */}
        <div className="space-y-1.5 pt-3 border-t border-white/[0.08]">
          {sidebarOpen && (
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Workspace
            </div>
          )}
          {secondaryNavItems.map((item) => (
            <NavButton key={item.url} item={item} isCollapsed={!sidebarOpen} />
          ))}
        </div>
      </nav>

      {/* Bottom Logout Area (NO profile icon, shows logout text when expanded, logout tooltip when collapsed) */}
      <div className="p-3 border-t border-white/[0.08] bg-white/[0.01]">
        {sidebarOpen ? (
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/15 transition-all duration-200 border border-transparent hover:border-rose-500/20 cursor-pointer group focus:outline-none"
            aria-label="Log Out"
          >
            <FiLogOut size={18} className="text-[#94A3B8] group-hover:text-rose-400 transition-colors shrink-0" />
            <span className="text-sm font-medium tracking-wide">Log Out</span>
          </button>
        ) : (
          <div className="relative group flex justify-center w-full">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/15 transition-all duration-200 border border-transparent hover:border-rose-500/20 cursor-pointer focus:outline-none"
              aria-label="Log Out"
            >
              <FiLogOut size={19} className="shrink-0" />
            </button>

            {/* Logout tooltip text when sidebarOpen is false */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1E293B]/95 backdrop-blur-xl text-rose-300 text-xs font-medium rounded-lg shadow-2xl border border-rose-500/25 pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Log Out</span>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#1E293B]" />
            </div>
          </div>
        )}
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
            className="fixed top-0 left-0 z-50 w-72 h-full bg-[#080C14] border-r border-white/[0.08] flex flex-col shadow-2xl md:hidden select-none"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => handleNavigation('/dashboard')}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                  <SiGooglegemini className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-base bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Automate AI
                </span>
              </div>
              <button
                onClick={() => dispatch(closeMobileSidebar())}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-white transition-colors cursor-pointer border border-white/[0.06]"
                aria-label="Close menu"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Drawer Workspace Switcher */}
            <div className="px-4 pt-3">
              <AccountSwitcher className="w-full" />
            </div>

            {/* Drawer Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <NavButton key={item.url} item={item} isMobile={true} />
                ))}
              </div>

              <div className="space-y-1 pt-3 border-t border-white/[0.08]">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Workspace
                </div>
                {secondaryNavItems.map((item) => (
                  <NavButton key={item.url} item={item} isMobile={true} />
                ))}
              </div>
            </nav>

            {/* Drawer Bottom Logout */}
            <div className="p-4 border-t border-white/[0.08] bg-white/[0.01]">
              <button
                type="button"
                onClick={() => {
                  dispatch(closeMobileSidebar());
                  setIsLogoutModalOpen(true);
                }}
                className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/15 transition-all duration-200 border border-transparent hover:border-rose-500/20 cursor-pointer group focus:outline-none"
                aria-label="Log Out"
              >
                <FiLogOut size={18} className="text-[#94A3B8] group-hover:text-rose-400 transition-colors shrink-0" />
                <span className="text-sm font-medium tracking-wide">Log Out</span>
              </button>
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

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign out of Automate AI?"
        description="Are you sure you want to sign out of your account? Any active workspace session will end."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="destructive"
        loading={isLoggingOut}
        icon={FiLogOut}
      />
    </>
  );
}