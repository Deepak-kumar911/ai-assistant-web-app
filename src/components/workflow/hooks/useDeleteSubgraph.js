import { useReactFlow } from "reactflow";

export function useDeleteSubgraph() {
  const {
    getNodes,
    getEdges,
    setNodes,
    setEdges,
  } = useReactFlow();

  const deleteFromNode = (startNodeId) => {
    const nodes = getNodes();
    const edges = getEdges();

    const visited = new Set();

    // 1️⃣ DFS to collect downstream nodes
    const dfs = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      edges
        .filter((e) => e.source === nodeId)
        .forEach((e) => dfs(e.target));
    };

    dfs(startNodeId);

    // 2️⃣ Remove nodes
    setNodes((nds) =>
      nds.filter((n) => !visited.has(n.id))
    );

    // 3️⃣ Remove edges
    setEdges((eds) =>
      eds.filter(
        (e) =>
          !visited.has(e.source) &&
          !visited.has(e.target)
      )
    );
  };

  return { deleteFromNode };
}
