// // flow/nodes/ScheduleNode.jsx
// import { Handle } from "reactflow";
// import { getHandlePositions } from "../../hooks/useHandlePosition";

import { useNodeForm } from "../../hooks/useNodeForm";
import NodeBase from "../NodeBase";

// export default function CustomScheduleNode({ data }) {
//   const { source } = getHandlePositions(data.layoutDirection);

//   return (
//     <div className="node">
//       <strong>Schedule</strong>

//       <select
//         value={data.interval}
//         onChange={(e) => data.onChange("interval", e.target.value)}
//       >
//         <option value="one-time">One Time</option>
//         <option value="weekday">Weekday</option>
//         <option value="weekend">Weekend</option>
//       </select>

//       <input
//         type="time"
//         value={data.time}
//         onChange={(e) => data.onChange("time", e.target.value)}
//       />

//       <Handle type="source" position={source} />
//     </div>
//   );
// }

export default function ScheduleNode({ id, data, selected }) {
  const { updateField } = useNodeForm(id);

  return (
    <NodeBase
      id={id}
      title="Schedule"
      icon="⏰"
      data={data}
      selected={selected}
      style={{ "--node-gradient": "linear-gradient(135deg, #8EC5FC, #E0C3FC)" }}
      handles={[
        { id: "schedule", type: "source", offset: 50 },
      ]}>
      <label className="node-label">Date</label>
      <input
        type="date"
        value={data.date}
        onChange={(e) => updateField("date", e.target.value)}
      />

      <label className="node-label">Time</label>
      <input
        type="time"
        value={data.time}
        onChange={(e) => updateField("time", e.target.value)}
      />
    </NodeBase>
  );
}
