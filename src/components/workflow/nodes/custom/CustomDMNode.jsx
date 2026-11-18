import { Send, FileText, AlignLeft } from "lucide-react";
import { useNodeForm } from "../../hooks/useNodeForm";
import NodeBase from "../NodeBase";

export default function DmNode({ id, data, selected }) {
  const { updateField } = useNodeForm(id);
  const dmType = data.dmType || "text";

  return (
    <NodeBase
      id={id}
      title="Direct Message"
      badge="ACTION"
      icon={<Send className="w-4 h-4 text-violet-400" />}
      data={data}
      selected={selected}
      disableDelete={false}
      handles={[
        { id: "in", type: "target", offset: 50 },
      ]}
    >
      <div className="space-y-3">
        <div>
          <label className="node-label">Message Format</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#080C14]/90 border border-white/10">
            <button
              type="button"
              onClick={() => updateField("dmType", "text")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                dmType === "text"
                  ? "bg-gradient-to-r from-violet-500 to-purple-400 text-white shadow-md shadow-violet-500/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Custom Text</span>
            </button>
            <button
              type="button"
              onClick={() => updateField("dmType", "template")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                dmType === "template"
                  ? "bg-gradient-to-r from-violet-500 to-purple-400 text-white shadow-md shadow-violet-500/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Template</span>
            </button>
          </div>
        </div>

        {dmType === "text" ? (
          <div>
            <label className="node-label">Direct Message Content</label>
            <textarea
              rows={3}
              value={data.text || ""}
              onChange={(e) => updateField("text", e.target.value)}
              placeholder="Hi there! Thanks for your comment. Here is the special link you requested: https://..."
            />
          </div>
        ) : (
          <div>
            <label className="node-label">Pre-configured Template</label>
            <input
              value={data.templateName || ""}
              onChange={(e) => updateField("templateName", e.target.value)}
              placeholder="e.g. welcome_lead_discount"
            />
          </div>
        )}
      </div>
    </NodeBase>
  );
}
