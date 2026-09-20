import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Check, ChevronDown, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { switchAccountApi } from '../../api/accountApi';
import { setToken, setRefreshToken } from '../../utils/helperFunction';
import { setSession } from '../../stateManagement/slices/authSlice';
import { Badge } from '../ui/Badge';

export default function AccountSwitcher({ className = '', compact = false }) {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state?.auth);
  const currentAccount = auth?.account;
  const currentAccountId = currentAccount?._id || currentAccount?.id || auth?.account?._id;
  const currentRole = auth?.role || currentAccount?.role || 'member';
  const availableAccounts = auth?.availableAccounts || [];

  const [isOpen, setIsOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSwitchAccount = async (target) => {
    const targetId = target.accountId || target._id;
    if (!targetId || targetId.toString() === currentAccountId?.toString()) {
      setIsOpen(false);
      return;
    }

    try {
      setSwitchingId(targetId);
      const res = await switchAccountApi({ accountId: targetId });

      if (res?.data?.status === 1 || res?.status === 200) {
        const { accessToken, refreshToken, user, account } = res.data;

        // Replace stored session tokens
        if (accessToken) setToken(accessToken);
        if (refreshToken) setRefreshToken(refreshToken);

        // Update session in Redux state
        dispatch(
          setSession({
            user,
            account,
            role: account?.role || target.role,
          })
        );

        toast.success(`Switched to workspace "${account?.name || target.name}"`);
        setIsOpen(false);

        // Clean reload to refresh all account-scoped contexts
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        toast.error(res?.data?.message || 'Failed to switch workspace');
      }
    } catch (err) {
      console.error('Account switch error:', err);
      toast.error(err?.response?.data?.message || 'Failed to switch workspace');
    } finally {
      setSwitchingId(null);
    }
  };

  const planVariant = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'ultra':
        return 'amber';
      case 'pro':
        return 'violet';
      default:
        return 'cyan';
    }
  };

  const accountName = currentAccount?.name || 'Workspace';
  const accountPlan = currentAccount?.plan || 'free';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Compact Trigger Button (for collapsed sidebar) */}
      {compact ? (
        <div className="relative group flex justify-center w-full">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
              isOpen
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'bg-white/[0.03] hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] border-white/[0.08]'
            }`}
            id="account-switcher-trigger-compact"
            aria-label={`Switch workspace (${accountName})`}
          >
            <Building2 className="w-5 h-5 text-cyan-400 shrink-0" />
          </button>

          {/* Tooltip on hover when compact */}
          {!isOpen && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1E293B]/95 backdrop-blur-xl text-[#F8FAFC] text-xs font-medium rounded-lg shadow-2xl border border-white/10 pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="font-semibold">{accountName}</span>
              <span className="text-[10px] text-[#94A3B8] uppercase">({accountPlan})</span>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#1E293B]" />
            </div>
          )}
        </div>
      ) : (
        /* Full Trigger Button (for expanded sidebar and mobile) */
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl transition-all duration-200 border text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
            isOpen
              ? 'bg-white/[0.08] border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
              : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/[0.15]'
          }`}
          id="account-switcher-trigger"
          aria-label="Switch workspace"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#F8FAFC] truncate tracking-tight group-hover:text-cyan-300 transition-colors">
                {accountName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-[#94A3B8] capitalize truncate">
                  {currentRole}
                </span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20">
                  {accountPlan}
                </span>
              </div>
            </div>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-cyan-400' : 'group-hover:text-[#F8FAFC]'
            }`}
          />
        </button>
      )}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: compact ? 0 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: compact ? 0 : 6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute ${
              compact
                ? 'left-full ml-3 top-0 w-72 sm:w-80'
                : 'left-0 top-full mt-2 w-full min-w-[280px] sm:w-80'
            } bg-[#0F172A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden select-none`}
            id="account-switcher-dropdown"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-[#F8FAFC] tracking-wide uppercase">
                  Workspaces ({availableAccounts.length || 1})
                </span>
              </div>
              <span className="text-[10px] text-[#64748B] font-mono">
                Click to switch
              </span>
            </div>

            {/* Account List */}
            <div className="p-2 space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
              {availableAccounts.length > 0 ? (
                availableAccounts.map((item) => {
                  const targetId = item.accountId?._id || item.accountId;
                  const isCurrent =
                    Boolean(item.isCurrent) ||
                    targetId?.toString() === currentAccountId?.toString();
                  const isSwitching = switchingId === targetId;

                  return (
                    <button
                      key={targetId?.toString() || item.name}
                      type="button"
                      disabled={isCurrent || Boolean(switchingId)}
                      onClick={() => handleSwitchAccount(item)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group ${
                        isCurrent
                          ? 'bg-cyan-500/10 border border-cyan-500/30 cursor-default'
                          : 'hover:bg-white/[0.06] border border-transparent hover:border-white/10 cursor-pointer'
                      } ${isSwitching ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isCurrent
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                              : 'bg-white/[0.04] border-white/10 text-[#94A3B8] group-hover:text-[#F8FAFC]'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex flex-col">
                          <span
                            className={`text-xs font-semibold truncate ${
                              isCurrent ? 'text-cyan-300' : 'text-[#F8FAFC] group-hover:text-cyan-300'
                            }`}
                          >
                            {item.name || 'Workspace'}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-[#94A3B8] capitalize">
                              {item.role || 'member'}
                            </span>
                            <span className="text-[9px] text-[#64748B] font-mono">·</span>
                            <Badge
                              variant={planVariant(item.plan)}
                              size="sm"
                              className="text-[9px] py-0 px-1"
                            >
                              {item.plan || 'free'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Right Indicator */}
                      <div className="shrink-0 ml-2">
                        {isSwitching ? (
                          <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : isCurrent ? (
                          <div className="flex items-center gap-1 text-cyan-400 text-xs font-medium">
                            <Check className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Active</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#64748B] group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            Switch
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                /* Fallback for single workspace */
                <div className="p-3 text-center text-xs text-[#94A3B8]">
                  <p className="font-semibold text-[#F8FAFC]">{accountName}</p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">Current active workspace</p>
                </div>
              )}
            </div>

            {/* Footer tip */}
            <div className="px-4 py-2 border-t border-white/[0.08] bg-white/[0.01] text-[10px] text-[#64748B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-tenant switching preserves active credentials</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
