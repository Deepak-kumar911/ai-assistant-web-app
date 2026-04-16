import { useNodeForm } from "../../hooks/useNodeForm";
import NodeBase from "../NodeBase";


export default function CommentReplyNode({ id, data, selected }) {
  const { updateField } = useNodeForm(id);

  return (
    <NodeBase
      id={id}
      title="Comment Reply"
      icon="💬"
      data={data}
      selected={selected}
      disableDelete={false}
      handles={[
        { id: "keyword", type: "target", offset: 50 },
        // { id: "ai", type: "target", offset: 70 },
        { id: "reply", type: "source", offset: 50 },
      ]}
    >
      <label className="node-label">Reply Mode</label>
      <select
        value={data.mode}
        onChange={(e) => updateField("mode", e.target.value)}
      >
        <option value="keyword">Keyword</option>
        <option value="ai">AI</option>
      </select>

      {data.mode === "keyword" && (
        <>
          <label className="node-label">Keyword</label>
          <input
            value={data.keyword || ""}
            onChange={(e) => updateField("keyword", e.target.value)}
            placeholder="eg: price"
          />

          <label className="node-label">Reply</label>
          <textarea
            rows={2}
            value={data.reply || ""}
            onChange={(e) => updateField("reply", e.target.value)}
          />
        </>
      )}

      {data.mode === "ai" && (
        <>
          <label className="node-label">AI Prompt</label>
          <textarea
            rows={2}
            value={data.prompt || ""}
            onChange={(e) => updateField("prompt", e.target.value)}
            placeholder="How should AI reply?"
          />
        </>
      )}
    </NodeBase>
  );
}
