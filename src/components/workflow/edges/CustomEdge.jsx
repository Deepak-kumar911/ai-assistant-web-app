// src/components/edges/CustomEdge.jsx
import React from 'react';
import { BaseEdge, getBezierPath } from '@xyflow/react';

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd }) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        ...style,
        stroke: '#2563eb',
        strokeWidth: 2,
      }}
      markerEnd={markerEnd}
    />
  );
}
