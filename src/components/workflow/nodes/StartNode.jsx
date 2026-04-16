// src/components/nodes/StartNode.jsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function StartNode({ data }) {
  return (
    <div className="bg-green-100 border border-green-400 rounded-xl px-4 py-3 shadow-sm text-center w-40">
      <h3 className="text-green-700 font-semibold">{data.label}</h3>
      <p className="text-xs text-green-600 mt-1">Start workflow</p>

      <Handle type="source" position={Position.Bottom} isConnectable={true} className="bg-green-500 w-3 h-3" />
    </div>
  );
}
