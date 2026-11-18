import { memo } from "react";
import { Handle } from "reactflow";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { getHandlePositions } from "../hooks/useHandlePosition";
import { getHandleStyle } from "../hooks/getHandleStyle";
import { useDeleteSubgraph } from "../hooks/useDeleteSubgraph";

function NodeBase({
  id,
  title,
  badge,
  icon,
  children,
  data,
  handles = [],
  actions = [],
  selected,
  disableDelete = true,
  style = {},
}) {
  const direction = data?.layoutDirection || "LR";
  const { source, target } = getHandlePositions(direction);
  const { deleteFromNode } = useDeleteSubgraph();

  const defaultActions = disableDelete
    ? []
    : [
        {
          id: "delete",
          className: "node-delete-btn",
          title: "Delete node",
          btnName: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
          onClick: () => deleteFromNode(id),
        },
      ];

  return (
    <motion.div
      className={`glass-node group ${selected ? "selected" : ""}`}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      style={style}
    >
      {/* Top ambient glow accent */}
      <div
        className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="node-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="node-icon shrink-0">{icon}</div>
          <div className="min-w-0">
            <h4 className="node-title truncate">{title}</h4>
            {badge && (
              <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 rounded-md">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className="node-actions shrink-0">
          {[...actions, ...defaultActions].map((action) => (
            <button
              key={action.id}
              type="button"
              className={`node-action-btn ${action.className || ""}`}
              title={action.title}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick?.();
              }}
            >
              {action.btnName}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="node-body">{children}</div>

      {/* Handles */}
      {handles.map((h) => (
        <Handle
          key={h.id}
          id={h.id}
          type={h.type}
          position={h.type === "source" ? source : target}
          style={getHandleStyle({
            direction,
            offset: h.offset,
          })}
        />
      ))}
    </motion.div>
  );
}

export default memo(NodeBase);
