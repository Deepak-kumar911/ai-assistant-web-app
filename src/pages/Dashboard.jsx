// pages/Dashboard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiTrendingUp, FiClock, FiActivity, FiPlay, FiMoreVertical, FiRefreshCw } from 'react-icons/fi';
import StatCard from '../components/ui/StatCard';
import WorkflowCard from '../components/ui/WorkflowCard';
import IntegrationCard from '../components/ui/IntegrationCard';

const stats = [
  { label: 'Active Workflows', value: '24', change: '+12%', icon: FiZap, color: 'cyan' },
  { label: 'Tasks Executed', value: '1,847', change: '+23%', icon: FiActivity, color: 'violet' },
  { label: 'Success Rate', value: '99.2%', change: '+2.1%', icon: FiTrendingUp, color: 'emerald' },
  { label: 'Avg. Response', value: '0.8s', change: '-0.2s', icon: FiClock, color: 'blue' },
];

const recentWorkflows = [
  { id: 1, name: 'Customer Support Agent', status: 'active', lastRun: '2 min ago', runs: 1247, icon: '🤖' },
  { id: 2, name: 'Lead Qualification', status: 'active', lastRun: '15 min ago', runs: 892, icon: '🎯' },
  { id: 3, name: 'Content Generator', status: 'paused', lastRun: '2 hours ago', runs: 456, icon: '✍️' },
  { id: 4, name: 'Data Sync Pipeline', status: 'active', lastRun: '5 min ago', runs: 2341, icon: '🔄' },
];

const integrations = [
  { name: 'Slack', icon: '💬', status: 'connected', category: 'Communication' },
  { name: 'Salesforce', icon: '📊', status: 'connected', category: 'CRM' },
  { name: 'Google Drive', icon: '📁', status: 'pending', category: 'Storage' },
  { name: 'Zapier', icon: '⚡', status: 'connected', category: 'Automation' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Monitor your AI automation ecosystem</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
          <FiRefreshCw size={16} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Workflows */}
        <div className="lg:col-span-2">
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">Recent Workflows</h2>
                <p className="text-sm text-gray-400">Your most active automation pipelines</p>
              </div>
              <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View all →</button>
            </div>
            <div className="divide-y divide-white/5">
              {recentWorkflows.map((workflow, idx) => (
                <WorkflowCard key={workflow.id} workflow={workflow} delay={idx * 0.05} />
              ))}
            </div>
          </div>
        </div>

        {/* Integrations & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <FiPlay className="text-cyan-400" size={16} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">Create New Workflow</p>
                  <p className="text-xs text-gray-400">Build an AI automation flow</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <FiMoreVertical className="text-violet-400" size={16} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">Connect Integration</p>
                  <p className="text-xs text-gray-400">Add new service or tool</p>
                </div>
              </button>
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Connected Integrations</h3>
              <span className="text-xs text-cyan-400">+ Add</span>
            </div>
            <div className="space-y-2">
              {integrations.map((integration, idx) => (
                <IntegrationCard key={integration.name} integration={integration} delay={idx * 0.05} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}