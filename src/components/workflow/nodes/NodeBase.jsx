import { memo } from "react";
import { Handle } from "reactflow";
import { motion } from "framer-motion";
import { getHandlePositions } from "../hooks/useHandlePosition";
import { getHandleStyle } from "../hooks/getHandleStyle";
import { useDeleteSubgraph } from "../hooks/useDeleteSubgraph";

function NodeBase({
  id,
  title,
  icon,
  children,
  data,
  handles = [],
  actions = [],
  selected,
  disableDelete=true,
  style
}) {
  const direction = data?.layoutDirection || "LR";
  const { source, target } = getHandlePositions(direction);
    const { deleteFromNode } = useDeleteSubgraph();

  const defaultActions = disableDelete
    ? []
    : [ {
        id: "delete",
        className: "node-delete-btn",
        title: "Delete",
        btnName: "🗑",
        onClick: () => deleteFromNode(id),
      },];

  return (
    <motion.div
      className={`glass-node ${selected ? "selected" : ""}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={style}
    >
      {/* Header */}
           <div className="node-header">
        <span className="node-icon">{icon}</span>
        <span className="node-title">{title}</span>

        <div className="node-actions">
          {[...actions, ...defaultActions].map((action) => (
            <button
              key={action.id}
              className={`node-action-btn ${action.className}`}
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
      {handles.map((h, i) => (
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
