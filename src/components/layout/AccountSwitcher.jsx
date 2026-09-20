import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Check, ChevronDown, Shield, User, Sparkles, RefreshCw } from 'lucide-react';
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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        // Replace stored session tokens (Task 36 D2 resolution)
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

        // Clean reload to refresh all account-scoped contexts without stale mix
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
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 border ${
          isOpen
            ? 'bg-white/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
            : 'bg-[#131D31]/80 hover:bg-[#1A2642] border-white/10 hover:border-white/20'
        } text-left group`}
        id="account-switcher-trigger"
        aria-label="Switch workspace"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
          <Building2 className="w-3.5 h-3.5" />
        </div>

        {!compact && (
          <div className="flex flex-col min-w-0 max-w-[140px] sm:max-w-[180px]">
            <span className="text-xs font-semibold text-white truncate tracking-tight group-hover:text-cyan-300 transition-colors">
              {accountName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-gray-400 capitalize">
                {currentRole}
              </span>
              <span className="text-[9px] uppercase px-1 rounded bg-white/5 text-cyan-400 font-bold border border-white/5">
                {accountPlan}
              </span>
            </div>
          </div>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-cyan-400' : 'group-hover:text-white'
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-[#0F1422] border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl"
            id="account-switcher-dropdown"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase">
                  Workspaces ({availableAccounts.length || 1})
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
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
                          : 'hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer'
                      } ${isSwitching ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isCurrent
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                              : 'bg-white/5 border-white/10 text-gray-400 group-hover:text-white'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex flex-col">
                          <span
                            className={`text-xs font-semibold truncate ${
                              isCurrent ? 'text-cyan-300' : 'text-gray-200 group-hover:text-white'
                            }`}
                          >
                            {item.name || 'Workspace'}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-gray-400 capitalize">
                              {item.role || 'member'}
                            </span>
                            <span className="text-[9px] text-gray-500 font-mono">·</span>
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
                          <span className="text-[11px] text-gray-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Switch
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                /* Fallback for single workspace */
                <div className="p-3 text-center text-xs text-gray-400">
                  <p className="font-medium text-white">{accountName}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Current workspace</p>
                </div>
              )}
            </div>

            {/* Footer tip */}
            <div className="px-4 py-2 border-t border-white/10 bg-white/[0.01] text-[10px] text-gray-500 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Multi-tenant switching preserves active credentials</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
