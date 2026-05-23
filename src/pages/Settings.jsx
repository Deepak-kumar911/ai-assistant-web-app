// pages/Settings.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiKey, FiBell, FiGlobe, FiShield, FiDatabase, FiChevronRight } from 'react-icons/fi';

const settingsSections = [
  { id: 'profile', icon: FiUser, label: 'Profile', description: 'Manage your personal information' },
  { id: 'api', icon: FiKey, label: 'API Keys', description: 'Manage API access tokens' },
  { id: 'notifications', icon: FiBell, label: 'Notifications', description: 'Configure alert preferences' },
  { id: 'integrations', icon: FiGlobe, label: 'Integrations', description: 'Connected services and apps' },
  { id: 'security', icon: FiShield, label: 'Security', description: 'Security and authentication settings' },
  { id: 'storage', icon: FiDatabase, label: 'Storage', description: 'Data retention and backups' },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-400 mt-1">Configure your workspace and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64 shrink-0 space-y-1">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{section.label}</p>
                  <p className="text-xs opacity-70 hidden lg:block">{section.description}</p>
                </div>
                <FiChevronRight size={14} className={`${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-[#0F0F12] border border-white/10 rounded-2xl p-6"
        >
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                <p className="text-sm text-gray-400 mt-1">Update your personal details and avatar</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-2xl font-bold">
                    JD
                  </div>
                  <button className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                    Change Avatar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input type="text" defaultValue="John Doe" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                    <input type="email" defaultValue="john@automate.ai" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                    <input type="text" defaultValue="Admin" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Timezone</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50">
                      <option>America/New York</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-medium hover:shadow-lg transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'api' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">API Keys</h2>
                <p className="text-sm text-gray-400 mt-1">Manage your API authentication tokens</p>
              </div>
              <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <code className="text-sm text-cyan-400">sk_live_••••••••••••••••••••••••</code>
                  <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                </div>
                <p className="text-xs text-gray-500">Created: Dec 15, 2023 • Last used: 2 hours ago</p>
              </div>
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm">
                + Generate New Key
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}