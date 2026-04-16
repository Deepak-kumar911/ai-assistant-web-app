// flow/FlowCanvas.jsx
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";

import { useCallback, useState } from "react";
import { nodeTypes } from "../types/nodeTypes";

import { initialNodes, initialEdges } from "../flowData";
import { useFlowLayout } from "../hooks/useFlowLayout.js";

import "../../../styles/reactflow-nodes.css";
import FlowLayoutSwitch from "../layout/FlowLayoutSwitch";

const snapGrid = [20, 20];
const defaultViewport = { x: 0, y: 0, zoom: 1.2 };

export default function FlowCanvas() {
  const [direction, setDirection] = useState("LR");

  /* ReactFlow state */
  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(
      initialEdges.map((e) => ({
        ...e,
        // type: "smoothstep",
      }))
    );
  
  console.log("edges",direction,edges)
  console.log("nodes",nodes)


  useFlowLayout({
    direction,
    nodes,
    edges,
    setNodes,
    setEdges,
  });

  /* 🔗 Connection logic (multi-handle safe) */
  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      const exists = eds.some(
        (e) =>
          e.source === params.source &&
          e.sourceHandle === params.sourceHandle &&
          e.target === params.target &&
          e.targetHandle === params.targetHandle
      );

      if (exists) return eds;

      return addEdge(
        {
          ...params,
          // type: "smoothstep",
          animated: true,
          label:
            params.sourceHandle ||
            params.targetHandle ||
            "",
        },
        eds
      );
    });
  }, []);

  const isValidConnection = (c) => {
    if (c.source === c.target) return false;
    return true;
  };

  return (
    <>
      {/* 🔘 Layout Direction Switch */}
    <div className="flow-canvas">
      <FlowLayoutSwitch
        direction={direction}
        onChange={setDirection}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        fitView
        snapToGrid
        snapGrid={snapGrid}
        defaultViewport={defaultViewport}
      >
        <Controls  position="top-right" />
        <Background gap={20} />
      </ReactFlow>
    </div>
    </>
  );
}
