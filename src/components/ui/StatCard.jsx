// components/ui/StatCard.tsx
import React from 'react';
import { motion } from 'framer-motion';



const colorClasses = {
  cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400',
  violet: 'from-violet-500/20 to-violet-500/5 text-violet-400',
  emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400',
  blue: 'from-blue-500/20 to-blue-500/5 text-blue-400',
};

export default function StatCard({ label, value, change, icon: Icon, color }) {
  const isPositive = change.startsWith('+');
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-[#0F0F12] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${colorClasses[color]} border border-white/10`}>
          <Icon size={18} />
        </div>
        <span className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'} bg-white/5 px-2 py-0.5 rounded-full`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}