// src/components/WorkflowBuilder.jsx
import React from 'react';
import WorkflowCanvas from './WorkflowCanvas.jsx';
import NodeSidebar from './NodeSidebar.jsx';

export default function WorkflowBuilder() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <WorkflowCanvas />
      <NodeSidebar />
    </div>
  );
}
