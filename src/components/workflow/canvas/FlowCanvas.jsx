import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useCallback, useState, useEffect } from "react";
import { nodeTypes } from "../types/nodeTypes";
import { initialNodes, initialEdges } from "../flowData";
import { getLayoutedElements } from "../hooks/flowLayout";
import FlowLayoutSwitch from "../layout/FlowLayoutSwitch";
import "../../../styles/reactflow-nodes.css";

const snapGrid = [20, 20];
const defaultViewport = { x: 0, y: 0, zoom: 1 };

export default function FlowCanvas({
  nodes: externalNodes,
  edges: externalEdges,
  onNodesChange: externalOnNodesChange,
  onEdgesChange: externalOnEdgesChange,
}) {
  const [direction, setDirection] = useState("LR");

  // Determine starting nodes/edges
  const getInitialNodes = () => {
    const baseNodes = (externalNodes && externalNodes.length > 0) ? externalNodes : initialNodes;
    // Check if nodes are stacked on top of each other (e.g. all at 0,0)
    const allAtZero = baseNodes.every((n) => (!n.position?.x && !n.position?.y) || (n.position?.x === 0 && n.position?.y === 0));
    if (allAtZero) {
      const baseEdges = (externalEdges && externalEdges.length > 0) ? externalEdges : initialEdges;
      const { nodes: layouted } = getLayoutedElements(baseNodes, baseEdges, "LR");
      return layouted;
    }
    return baseNodes;
  };

  const [nodes, setNodes, onReactFlowNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onReactFlowEdgesChange] = useEdgesState(
    (externalEdges && externalEdges.length > 0) ? externalEdges : initialEdges
  );

  // Synchronize from externalNodes if updated from outside (e.g. fetched workflow)
  useEffect(() => {
    if (externalNodes && externalNodes.length > 0) {
      const allAtZero = externalNodes.every(
        (n) => (!n.position?.x && !n.position?.y) || (n.position?.x === 0 && n.position?.y === 0)
      );
      if (allAtZero) {
        const { nodes: layouted, edges: layoutedEdges } = getLayoutedElements(
          externalNodes,
          externalEdges || edges,
          direction
        );
        setNodes(layouted);
        if (layoutedEdges?.length) setEdges(layoutedEdges);
      } else {
        setNodes(externalNodes);
      }
    }
  }, [externalNodes]);

  useEffect(() => {
    if (externalEdges && externalEdges.length > 0) {
      setEdges(externalEdges);
    }
  }, [externalEdges]);

  // Layout reorganization
  const handleAutoLayout = (dir = direction) => {
    if (!nodes || nodes.length === 0) return;
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      dir
    );

    const updatedNodes = layoutedNodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        layoutDirection: dir,
      },
    }));

    setNodes(updatedNodes);
    setEdges(layoutedEdges);

    if (externalOnNodesChange) externalOnNodesChange(updatedNodes);
    if (externalOnEdgesChange) externalOnEdgesChange(layoutedEdges);
  };

  const handleDirectionChange = (newDir) => {
    setDirection(newDir);
    handleAutoLayout(newDir);
  };

  // Node changes relay
  const handleNodesChangeWrapper = useCallback(
    (changes) => {
      onReactFlowNodesChange(changes);
      if (externalOnNodesChange) {
        setNodes((currentNodes) => {
          externalOnNodesChange(currentNodes);
          return currentNodes;
        });
      }
    },
    [onReactFlowNodesChange, externalOnNodesChange, setNodes]
  );

  // Edge changes relay
  const handleEdgesChangeWrapper = useCallback(
    (changes) => {
      onReactFlowEdgesChange(changes);
      if (externalOnEdgesChange) {
        setEdges((currentEdges) => {
          externalOnEdgesChange(currentEdges);
          return currentEdges;
        });
      }
    },
    [onReactFlowEdgesChange, externalOnEdgesChange, setEdges]
  );

  // Connection logic
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const exists = eds.some(
          (e) =>
            e.source === params.source &&
            e.sourceHandle === params.sourceHandle &&
            e.target === params.target &&
            e.targetHandle === params.targetHandle
        );

        if (exists) return eds;

        const newEdges = addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#06B6D4", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#06B6D4",
            },
          },
          eds
        );

        if (externalOnEdgesChange) externalOnEdgesChange(newEdges);
        return newEdges;
      });
    },
    [externalOnEdgesChange, setEdges]
  );

  const isValidConnection = (c) => {
    if (c.source === c.target) return false;
    return true;
  };

  return (
    <div className="flow-canvas w-full h-full relative">
      {/* 🔘 Direction & Layout Controls */}
      <FlowLayoutSwitch
        direction={direction}
        onChange={handleDirectionChange}
        onAutoLayout={() => handleAutoLayout(direction)}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChangeWrapper}
        onEdgesChange={handleEdgesChangeWrapper}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        snapToGrid
        snapGrid={snapGrid}
        defaultViewport={defaultViewport}
      >
        <Controls position="bottom-right" className="!bg-[#0F172A] !border-white/10" />
        <Background color="#334155" gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}
