// components/ui/WorkflowCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiMoreVertical, FiPause } from 'react-icons/fi';


export default function WorkflowCard({ workflow, delay = 0 }) {
  const isActive = workflow.status === 'active';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">
          {workflow.icon}
        </div>
        <div>
          <p className="font-medium text-white">{workflow.name}</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
              <span className="text-xs text-gray-400 capitalize">{workflow.status}</span>
            </div>
            <span className="text-xs text-gray-500">• {workflow.runs.toLocaleString()} runs</span>
            <span className="text-xs text-gray-500">• {workflow.lastRun}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-cyan-400">
          {isActive ? <FiPause size={14} /> : <FiPlay size={14} />}
        </button>
        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
          <FiMoreVertical size={14} />
        </button>
      </div>
    </motion.div>
  );
}