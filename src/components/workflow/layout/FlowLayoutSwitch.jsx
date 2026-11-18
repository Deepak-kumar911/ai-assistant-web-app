import { ArrowRight, ArrowDown, Sparkles } from "lucide-react";
import "../../../styles/flowLayout.css";

export default function FlowLayoutSwitch({
  direction,
  onChange,
  onAutoLayout,
}) {
  return (
    <div className="layout-switch">
      <button
        type="button"
        onClick={() => onChange("LR")}
        className={`flex items-center gap-1.5 ${direction === "LR" ? "active" : ""}`}
        title="Arrange workflow nodes horizontally in a line"
      >
        <ArrowRight className="w-3 h-3" />
        <span>Line (LR)</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("TB")}
        className={`flex items-center gap-1.5 ${direction === "TB" ? "active" : ""}`}
        title="Arrange workflow nodes vertically"
      >
        <ArrowDown className="w-3 h-3" />
        <span>Vertical (TB)</span>
      </button>
      {onAutoLayout && (
        <button
          type="button"
          onClick={onAutoLayout}
          className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300"
          title="Auto-align and organize all nodes sequentially"
        >
          <Sparkles className="w-3 h-3" />
          <span>Auto Align</span>
        </button>
      )}
    </div>
  );
}
