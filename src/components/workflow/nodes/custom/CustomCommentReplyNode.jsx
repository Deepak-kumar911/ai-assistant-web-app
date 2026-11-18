import { MessageSquare, Sparkles, KeyRound } from "lucide-react";
import { useNodeForm } from "../../hooks/useNodeForm";
import NodeBase from "../NodeBase";

export default function CommentReplyNode({ id, data, selected }) {
  const { updateField } = useNodeForm(id);
  const mode = data.mode || "keyword";

  return (
    <NodeBase
      id={id}
      title="Comment Automation"
      badge="ACTION"
      icon={<MessageSquare className="w-4 h-4 text-amber-400" />}
      data={data}
      selected={selected}
      disableDelete={false}
      handles={[
        { id: "keyword", type: "target", offset: 50 },
        { id: "reply", type: "source", offset: 50 },
      ]}
    >
      <div className="space-y-3">
        <div>
          <label className="node-label">Reply Mode</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#080C14]/90 border border-white/10">
            <button
              type="button"
              onClick={() => updateField("mode", "keyword")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === "keyword"
                  ? "bg-gradient-to-r from-amber-500 to-amber-400 text-[#080C14] shadow-md shadow-amber-500/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Keyword</span>
            </button>
            <button
              type="button"
              onClick={() => updateField("mode", "ai")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === "ai"
                  ? "bg-gradient-to-r from-amber-500 to-amber-400 text-[#080C14] shadow-md shadow-amber-500/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Reply</span>
            </button>
          </div>
        </div>

        {mode === "keyword" ? (
          <>
            <div>
              <label className="node-label">Trigger Keyword</label>
              <input
                value={data.keyword || ""}
                onChange={(e) => updateField("keyword", e.target.value)}
                placeholder="e.g. price, link, demo"
              />
            </div>

            <div>
              <label className="node-label">Public Reply</label>
              <textarea
                rows={2}
                value={data.reply || ""}
                onChange={(e) => updateField("reply", e.target.value)}
                placeholder="Sent you a DM with details! Check your inbox 🚀"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="node-label">AI Generation Prompt</label>
            <textarea
              rows={3}
              value={data.prompt || ""}
              onChange={(e) => updateField("prompt", e.target.value)}
              placeholder="e.g. Answer questions helpfully and politely invite them to DM us for a discount..."
            />
          </div>
        )}
      </div>
    </NodeBase>
  );
}
