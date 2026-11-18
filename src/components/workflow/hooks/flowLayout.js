import dagre from "dagre";

const defaultNodeWidth = 320;
const defaultNodeHeight = 320;

export function getLayoutedElements(
  nodes = [],
  edges = [],
  direction = "LR"
) {
  if (!nodes || nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const isHorizontal = direction === "LR";

  // If there are no edges, lay nodes out sequentially in a neat line
  if (!edges || edges.length === 0) {
    const layoutedNodes = nodes.map((node, idx) => ({
      ...node,
      position: isHorizontal
        ? { x: 50 + idx * 370, y: 120 }
        : { x: 120, y: 50 + idx * 340 },
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
    }));

    return { nodes: layoutedNodes, edges: edges || [] };
  }

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 90,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    // Dynamic height estimate based on node content
    const width = defaultNodeWidth;
    const height = node.type === "instagram" ? 380 : 260;
    dagreGraph.setNode(node.id, {
      width,
      height,
    });
  });

  edges.forEach((edge) => {
    if (edge?.source && edge?.target) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  try {
    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node, idx) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const width = defaultNodeWidth;
      const height = node.type === "instagram" ? 380 : 260;

      // Fallback if dagre didn't place node
      const posX = nodeWithPosition
        ? Math.round(nodeWithPosition.x - width / 2)
        : (isHorizontal ? 50 + idx * 370 : 120);
      const posY = nodeWithPosition
        ? Math.round(nodeWithPosition.y - height / 2)
        : (isHorizontal ? 120 : 50 + idx * 340);

      return {
        ...node,
        position: { x: Math.max(20, posX), y: Math.max(20, posY) },
        targetPosition: isHorizontal ? "left" : "top",
        sourcePosition: isHorizontal ? "right" : "bottom",
      };
    });

    return {
      nodes: layoutedNodes,
      edges,
    };
  } catch (err) {
    console.warn("Dagre layout error, falling back to sequential grid:", err);
    const layoutedNodes = nodes.map((node, idx) => ({
      ...node,
      position: isHorizontal
        ? { x: 50 + idx * 370, y: 120 }
        : { x: 120, y: 50 + idx * 340 },
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
    }));
    return { nodes: layoutedNodes, edges };
  }
}
