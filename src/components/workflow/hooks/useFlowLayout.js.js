import { useEffect } from "react";
import { getLayoutedElements } from "../hooks/flowLayout";

export function useFlowLayout({
  direction,
  nodes,
  edges,
  setNodes,
  setEdges,
}) {
  useEffect(() => {
    if (!nodes.length) return;

    const { nodes: layoutedNodes, edges: layoutedEdges } =
      getLayoutedElements(nodes, edges, direction);

    setNodes(
      layoutedNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          layoutDirection: direction,
        },
      }))
    );

    setEdges(
      layoutedEdges.map((edge) => ({
        ...edge,
        // type: "smoothstep",
      }))
    );
  }, [direction]);
}
