import { Zap, Calendar, Clock } from "lucide-react";
import { useNodeForm } from "../../hooks/useNodeForm";
import NodeBase from "../NodeBase";

export default function ScheduleNode({ id, data, selected }) {
  const { updateField } = useNodeForm(id);
  const scheduleType = data.scheduleType || "instant";

  const handleTypeChange = (type) => {
    updateField("scheduleType", type);
    if (type === "future" && !data.scheduledDate && !data.date) {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      updateField("scheduledDate", tomorrow);
      updateField("date", tomorrow);
      if (!data.scheduledTime && !data.time) {
        updateField("scheduledTime", "10:00");
        updateField("time", "10:00");
      }
    }
  };

  return (
    <NodeBase
      id={id}
      title="Trigger: Schedule"
      badge="TRIGGER"
      icon={<Clock className="w-4 h-4 text-cyan-400" />}
      data={data}
      selected={selected}
      accentColor="cyan"
      handles={[
        { id: "schedule", type: "source", offset: 50 },
      ]}
    >
      <div className="space-y-3">
        {/* Instant vs Scheduled Segmented Buttons */}
        <div>
          <label className="node-label">Execution Mode</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#080C14]/90 border border-white/10">
            <button
              type="button"
              onClick={() => handleTypeChange("instant")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scheduleType === "instant"
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#080C14] shadow-md shadow-cyan-500/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Instant</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("future")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scheduleType === "future"
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#080C14] shadow-md shadow-cyan-500/20"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Scheduled</span>
            </button>
          </div>
        </div>

        {scheduleType === "instant" ? (
          <div className="p-3 rounded-xl bg-cyan-500/[0.07] border border-cyan-500/20 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Zap className="w-3 h-3" />
            </div>
            <div>
              <p className="text-xs font-semibold text-cyan-300">Publish Immediately</p>
              <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                Executes right after workflow activation with zero delay.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="node-label">Date</label>
              <input
                type="date"
                value={data.scheduledDate || data.date || ""}
                onChange={(e) => {
                  updateField("scheduledDate", e.target.value);
                  updateField("date", e.target.value);
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="node-label">Time</label>
              <input
                type="time"
                value={data.scheduledTime || data.time || "10:00"}
                onChange={(e) => {
                  updateField("scheduledTime", e.target.value);
                  updateField("time", e.target.value);
                }}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </NodeBase>
  );
}
