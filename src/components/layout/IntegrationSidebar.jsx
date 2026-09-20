import React, { useState } from 'react';
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { FaInstagram, FaGlobe, FaWhatsapp } from 'react-icons/fa';
import { SiGooglegemini } from 'react-icons/si';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useParams, useNavigate } from 'react-router-dom';
import { toggleMobileSidebar, toggleSidebar, closeMobileSidebar } from '../../stateManagement/slices/uiSlice';
import { integrationConfigs } from '../../config/integrations/integration';
import { logout } from '../../stateManagement/slices/authSlice';
import { logoutApi } from '../../api/authApi';
import { clearAuthTokens } from '../../utils/helperFunction';
import { motion } from 'framer-motion';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export default function IntegrationSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mobileSidebarOpen, sidebarOpen } = useSelector((state) => state?.ui);
  const auth = useSelector((state) => state?.auth);
  const user = auth?.details;
  const location = useLocation();
  const { platform, platformId } = useParams();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!platform || !integrationConfigs[platform]) {
    return <div className="p-6 text-gray-400">Platform not supported</div>;
  }

  const { name, sidebar } = integrationConfigs[platform];

  const getPlatformIcon = () => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <FaInstagram className="text-pink-400" size={18} />;
      case 'website':
        return <FaGlobe className="text-cyan-400" size={18} />;
      case 'whatsapp':
        return <FaWhatsapp className="text-emerald-400" size={18} />;
      default:
        return <SiGooglegemini className="text-cyan-400" size={18} />;
    }
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutApi();
    } catch (_) {
      // ignore
    } finally {
      clearAuthTokens();
      dispatch(logout());
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      navigate('/sign-in');
    }
  };

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => dispatch(closeMobileSidebar())}
        />
      )}

      <aside
        className={`fixed z-40 top-0 left-0 h-full bg-[#0F0F12] border-r border-white/5 shadow-2xl flex flex-col transition-all duration-300 ease-in-out w-72 max-w-[85vw] md:max-w-none ${
          sidebarOpen ? 'md:w-64' : 'md:w-20'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Top App Branding */}
        <div
          className="flex items-center h-16 px-4 justify-between border-b border-white/5"
        >
          <Link to="/ai-agent" className={`flex items-center gap-2 group ${!sidebarOpen ? 'md:hidden flex' : 'flex'}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-md">
              <SiGooglegemini className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-base bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Automate AI
            </span>
          </Link>

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors hidden md:flex cursor-pointer"
          >
            {sidebarOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
          </button>

          <button
            onClick={() => dispatch(toggleMobileSidebar())}
            className="items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors md:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Back to Workspace button */}
        <div className="px-3 pt-3">
          <Link
            to="/ai-agent"
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl transition-all ${
              sidebarOpen ? 'justify-start' : 'md:justify-center justify-start'
            }`}
          >
            <FiArrowLeft size={14} className="text-cyan-400 shrink-0" />
            <span className={!sidebarOpen ? 'md:hidden inline' : 'inline'}>Back to AI Agents</span>
          </Link>
        </div>

        {/* Integration Header Label */}
        <div className={`px-4 pt-4 pb-2 ${!sidebarOpen ? 'md:hidden block' : 'block'}`}>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-white/5 border border-white/10">
              {getPlatformIcon()}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
              {name} Automation
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {sidebar
            ?.filter((ele) => ele?.isSidebar)
            ?.map((item) => {
              const Icon = item.icon;
              const pathUrl = `/ai-agent/integration/${platformId}/${platform}/${item.path}`;
              const active = location?.pathname.includes(item?.path);

              return (
                <NavLink
                  key={item.path}
                  to={pathUrl}
                  onClick={() => {
                    if (mobileSidebarOpen) dispatch(closeMobileSidebar());
                  }}
                  className={`relative flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                      ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-white border border-white/10 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    } ${!sidebarOpen ? 'md:justify-center justify-start' : ''}`}
                >
                  <Icon
                    size={item?.iconSize || 18}
                    className={
                      active
                        ? 'text-cyan-400 shrink-0'
                        : 'text-gray-400 group-hover:text-cyan-400 shrink-0 transition-colors'
                    }
                  />
                  <span className={`truncate ${!sidebarOpen ? 'md:hidden inline' : 'inline'}`}>{item?.label}</span>

                  {!sidebarOpen && (
                    <div className="hidden md:block absolute left-full ml-2 px-2.5 py-1 bg-[#1A1A1E] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 shadow-xl z-50">
                      {item?.label}
                    </div>
                  )}
                </NavLink>
              );
            })}
        </nav>

        {/* Bottom Logout Area (Full button on mobile or desktop expanded, icon-only on desktop collapsed) */}
        <div className="p-3 border-t border-white/[0.08] bg-white/[0.01]">
          <div className={!sidebarOpen ? 'hidden md:block' : 'hidden'}>
            <div className="relative group flex justify-center w-full">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/15 transition-all duration-200 border border-transparent hover:border-rose-500/20 cursor-pointer focus:outline-none"
                aria-label="Log Out"
              >
                <FiLogOut size={19} className="shrink-0" />
              </button>

              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1E293B]/95 backdrop-blur-xl text-rose-300 text-xs font-medium rounded-lg shadow-2xl border border-rose-500/25 pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Log Out</span>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#1E293B]" />
              </div>
            </div>
          </div>

          <div className={!sidebarOpen ? 'block md:hidden' : 'block'}>
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/15 transition-all duration-200 border border-transparent hover:border-rose-500/20 cursor-pointer group focus:outline-none"
              aria-label="Log Out"
            >
              <FiLogOut size={18} className="text-[#94A3B8] group-hover:text-rose-400 transition-colors shrink-0" />
              <span className="text-sm font-medium tracking-wide">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

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
