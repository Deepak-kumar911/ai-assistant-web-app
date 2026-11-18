import { useEffect } from "react";
import { getLayoutedElements } from "./flowLayout";

export function useFlowLayout({
  direction = "LR",
  nodes = [],
  edges = [],
  setNodes,
  setEdges,
  initialLayout = false,
}) {
  const applyLayout = (dir = direction) => {
    if (!nodes || !nodes.length) return;

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      dir
    );

    setNodes(
      layoutedNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          layoutDirection: dir,
        },
      }))
    );

    if (setEdges) {
      setEdges(layoutedEdges);
    }
  };

  useEffect(() => {
    applyLayout(direction);
  }, [direction]);

  return { applyLayout };
}
