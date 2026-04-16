import { useReactFlow } from "reactflow";

export function useNodeForm(nodeId) {
  const { setNodes } = useReactFlow();

  const updateField = (field, value) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                [field]: value,
              },
            }
          : n
      )
    );
  };

  return { updateField };
}
