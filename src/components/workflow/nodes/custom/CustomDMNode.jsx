import { useNodeForm } from "../../hooks/useNodeForm";
import NodeBase from "../NodeBase";

export default function DmNode({ id, data, selected }) {
  const { updateField } = useNodeForm(id);

  return (
    <NodeBase
      id={id}
      title="DM"
      icon="📩"
      data={data}
      selected={selected}
      disableDelete={false}
      handles={[
        { id: "in", type: "target", offset: 50 },
      ]}
    >
      <label className="node-label">DM Type</label>
      <select
        value={data.dmType}
        onChange={(e) => updateField("dmType", e.target.value)}
      >
        <option value="text">Text</option>
        <option value="template">Template</option>
      </select>

      {data.dmType === "text" && (
        <textarea
          rows={3}
          value={data.text || ""}
          onChange={(e) => updateField("text", e.target.value)}
          placeholder="Message..."
        />
      )}

      {data.dmType === "template" && (
        <>
          <label className="node-label">Template Name</label>
          <input
            value={data.templateName || ""}
            onChange={(e) =>
              updateField("templateName", e.target.value)
            }
          />
        </>
      )}
    </NodeBase>
  );
}
