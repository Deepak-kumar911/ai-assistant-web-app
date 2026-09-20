import React from 'react';
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

export default function IntegrationSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mobileSidebarOpen, sidebarOpen } = useSelector((state) => state?.ui);
  const auth = useSelector((state) => state?.auth);
  const user = auth?.details;
  const location = useLocation();
  const { platform, platformId } = useParams();

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

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => dispatch(closeMobileSidebar())}
        />
      )}

      <aside
        className={`fixed z-40 top-0 left-0 h-full bg-[#0F0F12] border-r border-white/5 shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Top App Branding */}
        <div
          className={`flex items-center h-16 px-4 ${
            sidebarOpen ? 'justify-between' : 'justify-center'
          } border-b border-white/5`}
        >
          {sidebarOpen && (
            <Link to="/ai-agent" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-md">
                <SiGooglegemini className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-base bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Automate AI
              </span>
            </Link>
          )}

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors hidden md:flex cursor-pointer"
          >
            {sidebarOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
          </button>

          <button
            onClick={() => dispatch(toggleMobileSidebar())}
            className="items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors md:hidden cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Back to Workspace button */}
        <div className="px-3 pt-3">
          <Link
            to="/ai-agent"
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl transition-all ${
              sidebarOpen ? 'justify-start' : 'justify-center'
            }`}
          >
            <FiArrowLeft size={14} className="text-cyan-400 shrink-0" />
            {sidebarOpen && <span>Back to AI Agents</span>}
          </Link>
        </div>

        {/* Integration Header Label */}
        {sidebarOpen && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-white/5 border border-white/10">
                {getPlatformIcon()}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                {name} Automation
              </span>
            </div>
          </div>
        )}

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
                  className={`relative flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-white border border-white/10 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                >
                  <Icon
                    size={item?.iconSize || 18}
                    className={
                      active
                        ? 'text-cyan-400 shrink-0'
                        : 'text-gray-400 group-hover:text-cyan-400 shrink-0 transition-colors'
                    }
                  />
                  {sidebarOpen && <span className="truncate">{item?.label}</span>}

                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#1A1A1E] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 shadow-xl z-50">
                      {item?.label}
                    </div>
                  )}
                </NavLink>
              );
            })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-white/5 bg-white/[0.01]">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user?.name || 'User'}
                      className="w-8 h-8 rounded-lg object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold shadow-md">
                      {getInitials()}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#0F0F12]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.name || 'Workspace Member'}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize truncate">
                    {user?.role || 'Member'}
                  </p>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
