import { nanoid } from "nanoid";
import { useReactFlow } from "reactflow";

export function useDuplicateSubgraph() {
  const {
    getNodes,
    getEdges,
    addNodes,
    addEdges,
  } = useReactFlow();

  const duplicateFromNode = (startNodeId) => {
    const nodes = getNodes();
    const edges = getEdges();

    const visited = new Set();
    const nodeMap = {}; // oldId → newId
    const nodesToClone = [];
    const edgesToClone = [];

    // 1️⃣ DFS traversal
    const dfs = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      nodesToClone.push(nodes.find((n) => n.id === nodeId));

      edges
        .filter((e) => e.source === nodeId)
        .forEach((e) => {
          edgesToClone.push(e);
          dfs(e.target);
        });
    };

    dfs(startNodeId);

    // remove root (we only clone downstream)
    const downstreamNodes = nodesToClone.slice(1);

    // 2️⃣ Create new nodes
    const clonedNodes = downstreamNodes.map((node, i) => {
      const newId = nanoid();
      nodeMap[node.id] = newId;

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 60,
          y: node.position.y + 140,
        },
        selected: false,
      };
    });

    // 3️⃣ Clone edges
    const clonedEdges = edgesToClone
      .filter((e) => e.source !== startNodeId)
      .map((e) => ({
        ...e,
        id: nanoid(),
        source: nodeMap[e.source],
        target: nodeMap[e.target],
      }));

    // 4️⃣ Connect root → cloned entry nodes
    edges
      .filter((e) => e.source === startNodeId)
      .forEach((e) => {
        clonedEdges.push({
          id: nanoid(),
          source: startNodeId,
          target: nodeMap[e.target],
          sourceHandle: e.sourceHandle,
        });
      });

    addNodes(clonedNodes);
    addEdges(clonedEdges);
  };

  return { duplicateFromNode };
}
