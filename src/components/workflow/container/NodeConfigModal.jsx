// src/components/NodeConfigModal.jsx
import React from 'react';

export default function NodeConfigModal({ open, node, onClose, onSave }) {
  if (!open || !node) return null;

  const [config, setConfig] = React.useState(node.data.config || {});

  const handleSave = () => {
    onSave(node.id, config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[400px] p-5">
        <h2 className="text-lg font-semibold mb-4">{node.data.label} Configuration</h2>

        {/* Example Config Fields */}
        <label className="block mb-3">
          <span className="text-sm text-gray-700">Name</span>
          <input
            className="w-full mt-1 border rounded px-2 py-1"
            value={config.name || ''}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm text-gray-700">Description</span>
          <textarea
            className="w-full mt-1 border rounded px-2 py-1"
            value={config.desc || ''}
            onChange={(e) => setConfig({ ...config, desc: e.target.value })}
          />
        </label>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
