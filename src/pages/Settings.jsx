import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiZap,
  FiUsers,
  FiShield,
  FiCheck,
  FiUploadCloud,
  FiChevronRight,
  FiArrowUpRight,
  FiCpu,
  FiMail,
  FiBriefcase,
  FiSave,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { setDetails } from '../stateManagement/slices/authSlice';
import { updateUserProfileApi } from '../api/userApi';
import { getAccountUsageApi } from '../api/authApi';
import UpgradePlanModal from '../components/plan/UpgradePlanModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { postApiWithToken } from '../api/apiInterface';

const SECTIONS = [
  { id: 'profile', icon: FiUser, label: 'Profile', description: 'Personal details and avatar' },
  { id: 'plan', icon: FiZap, label: 'Plan & Billing', description: 'Usage and plan capacity' },
  { id: 'team', icon: FiUsers, label: 'Team & Workspace', description: 'Workspace members and roles' },
  { id: 'security', icon: FiShield, label: 'Security', description: 'Account session details' },
];

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const auth = useSelector((state) => state?.auth);
  const user = auth?.details;
  const currentAccount = auth?.account;

  // Active section sync from URL query ?tab= or ?search=
  const initialSection = searchParams.get('tab') || searchParams.get('search') || 'profile';
  const [activeSection, setActiveSection] = useState(
    SECTIONS.some((s) => s.id === initialSection) ? initialSection : 'profile'
  );

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Plan & Usage state (Task 39 logic)
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Sync state when Redux user details update
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Update URL when active section changes
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setSearchParams({ tab: sectionId });
  };

  // Fetch account plan usage for Plan tab
  useEffect(() => {
    if (activeSection === 'plan') {
      setLoadingUsage(true);
      getAccountUsageApi()
        .then((res) => {
          if (res.data?.data) {
            setUsage(res.data.data);
          }
        })
        .catch((err) => console.error('Error fetching account usage:', err))
        .finally(() => setLoadingUsage(false));
    }
  }, [activeSection]);

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a valid full name');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserProfileApi({
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
      });

      if (res.data?.status === 1) {
        toast.success('Profile updated successfully');
        dispatch(setDetails({ ...user, name: name.trim(), avatarUrl: avatarUrl.trim() }));
      } else {
        toast.error(res.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Avatar Image Upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file size must be under 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderName', 'avatars');

    try {
      const res = await postApiWithToken('upload/user/media', formData);
      if (res.data?.success && res.data.file?.url) {
        const uploadedUrl = res.data.file.url;
        setAvatarUrl(uploadedUrl);
        toast.success('Avatar uploaded! Click Save to apply changes.');
      } else {
        toast.error(res.data?.message || 'Failed to upload avatar');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = () => {
    if (name) {
      return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const planTier = (usage?.plan || currentAccount?.plan || 'free').toUpperCase();
  const agentCount = usage?.agentCount ?? 0;
  const agentLimit = usage?.agentLimit ?? 1;
  const usagePercent = Math.min(100, Math.round((agentCount / agentLimit) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
            Account Management
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-xs text-gray-400 font-mono">
            {currentAccount?.name || 'Workspace'}
          </span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your personal profile, plan quotas, and workspace governance.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 shrink-0 space-y-1.5">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-white/10 text-white shadow-lg shadow-cyan-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div
                  className={`p-2 rounded-xl ${
                    isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold truncate">{section.label}</p>
                  <p className="text-xs opacity-70 truncate hidden lg:block">{section.description}</p>
                </div>
                <FiChevronRight
                  size={14}
                  className={`${isActive ? 'opacity-100 text-cyan-400' : 'opacity-0'} transition-opacity`}
                />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-[#0F0F14] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl"
        >
          {/* 1. PROFILE SECTION */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Manage your personal account identity and display avatar across workspaces.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="relative shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name || 'Avatar'}
                        className="w-20 h-20 rounded-2xl object-cover border border-white/15 shadow-xl"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                        {getInitials()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">Your Avatar</p>
                    <p className="text-xs text-gray-400">
                      JPG, PNG, WebP or GIF up to 5MB. This photo appears on your profile and comments.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <label className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium cursor-pointer transition-all flex items-center gap-2">
                        <FiUploadCloud size={14} className="text-cyan-400" />
                        <span>{isUploading ? 'Uploading...' : 'Upload New Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-[#16161F] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Email Address
                      </label>
                      <Badge variant="emerald" size="sm" className="gap-1">
                        <FiCheck size={10} /> Verified
                      </Badge>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        disabled
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed select-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Email address is verified via {user?.authProvider === 'google' ? 'Google OAuth' : 'OTP'} and cannot be edited directly.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Active Workspace Role
                    </label>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <FiBriefcase className="text-cyan-400" size={16} />
                      <span className="text-sm font-medium text-white capitalize">
                        {auth?.role || currentAccount?.role || 'Owner'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Active Workspace
                    </label>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-sm font-medium text-white">
                        {currentAccount?.name || 'Primary Workspace'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <FiSave size={16} />
                    <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 2. PLAN & BILLING SECTION */}
          {activeSection === 'plan' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Plan & Quotas</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Review your workspace subscription tier, agent capacities, and upgrade options.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setUpgradeModalOpen(true)}
                  className="flex items-center gap-2 shadow-lg shadow-cyan-500/15"
                >
                  <FiZap size={14} />
                  <span>Upgrade Plan</span>
                </Button>
              </div>

              {/* Plan Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161622] to-[#12121A] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <FiZap size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{planTier} Plan</h3>
                      <p className="text-xs text-gray-400">
                        {planTier === 'FREE'
                          ? 'Starter tier for small projects and initial testing'
                          : planTier === 'PRO'
                          ? 'Professional tier with multi-agent orchestration and advanced automations'
                          : 'Enterprise tier with maximum agent capacity and priority compute'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="cyan" size="md">
                    Active
                  </Badge>
                </div>

                {/* Agent Capacity Meter (Reusing Task 39 Logic) */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-300 flex items-center gap-1.5">
                      <FiCpu className="text-cyan-400" />
                      <span>AI Agent Allocation:</span>
                    </span>
                    <span className="font-semibold text-white">
                      {agentCount} of {agentLimit} Deployed ({usagePercent}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      style={{ width: `${usagePercent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        usagePercent >= 100
                          ? 'bg-gradient-to-r from-amber-500 to-red-500'
                          : 'bg-gradient-to-r from-cyan-500 to-violet-500'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1">
                    <span>
                      {agentLimit - agentCount > 0
                        ? `${agentLimit - agentCount} agent slot(s) remaining`
                        : 'Plan limit reached'}
                    </span>
                    <button
                      onClick={() => setUpgradeModalOpen(true)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
                    >
                      Need more agents? Upgrade →
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Comparison Feature Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-semibold text-gray-300">Free Tier</p>
                  <p className="text-sm font-bold text-white mt-1">1 AI Agent</p>
                  <p className="text-[11px] text-gray-400 mt-2">Essential website widget & community support</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-cyan-500/20 bg-cyan-500/[0.02]">
                  <p className="text-xs font-semibold text-cyan-400">Pro Tier</p>
                  <p className="text-sm font-bold text-white mt-1">4 AI Agents</p>
                  <p className="text-[11px] text-gray-400 mt-2">Instagram automation, RAG knowledge bases & webhooks</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-semibold text-violet-400">Ultra Tier</p>
                  <p className="text-sm font-bold text-white mt-1">10 AI Agents</p>
                  <p className="text-[11px] text-gray-400 mt-2">Unlimited workflow runs, priority LLM compute & SLA</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. TEAM & WORKSPACE SECTION */}
          {activeSection === 'team' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Team & Workspace Governance</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Manage collaborators, assign role permissions, and configure workspace identity.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                      <FiUsers size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {currentAccount?.name || 'Workspace'} Team Members
                      </h3>
                      <p className="text-xs text-gray-400">
                        Invite co-workers and manage roles (`Owner` or `Member`) across this account.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/team')}
                    className="flex items-center gap-1.5"
                  >
                    <span>Manage Members</span>
                    <FiArrowUpRight size={14} />
                  </Button>
                </div>

                <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-[#16161F] border border-white/5">
                    <span className="text-gray-400">Workspace Identifier (ID):</span>
                    <p className="text-white font-mono font-medium truncate mt-1">
                      {currentAccount?._id || 'Primary'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#16161F] border border-white/5">
                    <span className="text-gray-400">Your Membership Role:</span>
                    <p className="text-cyan-400 font-semibold capitalize mt-1">
                      {auth?.role || 'Owner'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. SECURITY & SESSIONS SECTION */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Security & Authentication</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Your identity verification provider and active Redis-backed session status.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <FiShield size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Active Session Protection</h3>
                    <p className="text-xs text-gray-400">
                      Protected with opaque Redis session tokens and auto-refresh guards.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-3 rounded-xl bg-[#16161F] border border-white/5">
                    <span className="text-gray-400">Authentication Method:</span>
                    <p className="text-white font-semibold mt-1 capitalize">
                      {user?.authProvider === 'google' ? 'Google OAuth 2.0' : 'Email & Password with OTP'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#16161F] border border-white/5">
                    <span className="text-gray-400">Session Status:</span>
                    <p className="text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Active & Authenticated
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlan={usage?.plan || currentAccount?.plan || 'free'}
      />
    </div>
  );
}