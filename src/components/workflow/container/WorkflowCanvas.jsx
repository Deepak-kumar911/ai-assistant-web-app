// src/components/WorkflowCanvas.jsx
import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import StartNode from '../nodes/StartNode.jsx';
import CustomEdge from '../edges/CustomEdge.jsx';
import NodeConfigModal from './NodeConfigModal.jsx';
import HttpNode from '../nodes/HttpNode.jsx';

const nodeTypes = { start: StartNode,http:HttpNode };
const edgeTypes = { custom: CustomEdge };

export default function WorkflowCanvas({ draggedNode }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const nodeData = event.dataTransfer.getData('application/node-type');
      if (!nodeData) return;

      const { type, label } = JSON.parse(nodeData);
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodeClick = (_, node) => setSelectedNode(node);

  const onSaveConfig = (nodeId, config) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, config } } : n))
    );
  };

  return (
    <div className="flex-1 h-full bg-gray-50 rounded-lg" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        onNodeClick={onNodeClick}
      />

      <NodeConfigModal
        open={!!selectedNode}
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSave={onSaveConfig}
      />
    </div>
  );
}
