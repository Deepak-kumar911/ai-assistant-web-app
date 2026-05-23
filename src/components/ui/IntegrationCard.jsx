// components/ui/IntegrationCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';


export default function IntegrationCard({ integration, delay = 0 }) {
  const isConnected = integration.status === 'connected';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <span className="text-lg">{integration.icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white">{integration.name}</p>
          <p className="text-xs text-gray-500">{integration.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isConnected ? (
          <FiCheckCircle size={14} className="text-emerald-400" />
        ) : (
          <FiAlertCircle size={14} className="text-yellow-400" />
        )}
        <span className={`text-xs ${isConnected ? 'text-emerald-400' : 'text-yellow-400'}`}>
          {integration.status}
        </span>
      </div>
    </motion.div>
  );
}