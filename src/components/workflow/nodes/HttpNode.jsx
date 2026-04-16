// src/components/nodes/HttpNode.jsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe } from 'lucide-react';

export default function HttpNode({ data }) {
  return (
    <div className="bg-blue-100 border border-blue-400 rounded-xl p-3 w-56 relative shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Globe size={16} className="text-blue-600" />
        <h3 className="text-blue-700 font-semibold">{data.label || 'HTTP Node'}</h3>
      </div>
      <p className="text-xs text-blue-600">Make a network request</p>

      {/* Incoming connection */}
      <Handle type="target" position={Position.Top} className="bg-blue-500 w-3 h-3" />
      <Handle type="output" position={Position.Right} className="bg-blue-500 w-3 h-3" />

      {/* Two outgoing connections */}
      <Handle
        id="success"
        type="source"
        position={Position.Bottom}
        style={{ left: '30%' }}
        className="bg-green-500 w-3 h-3"
      />
      <Handle
        id="error"
        type="source"
        position={Position.Bottom}
        style={{ left: '70%' }}
        className="bg-red-500 w-3 h-3"
      />
    </div>
  );
}
