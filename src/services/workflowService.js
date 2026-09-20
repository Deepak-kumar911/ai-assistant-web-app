// services/workflowService.js
import {
  getApiWithToken,
  postApiWithToken,
  putApiWithToken,
  deleteApiWithToken,
} from '../api/apiInterface';

/**
 * Frontend Workflow Service connecting Canvas and Scheduler to /api/v1/workflows
 * Reference: TRD §2.4, §6.5; AGENT_TASK_PLAN.md Task 25.
 */
export const workflowService = {
  // Fetch all workflows
  getAllWorkflows: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = query ? `workflows?${query}` : 'workflows';
    const response = await getApiWithToken(path);
    return response.data?.data || [];
  },

  // Fetch single workflow
  getWorkflow: async (id) => {
    const response = await getApiWithToken(`workflows/${id}`);
    return response.data?.data || response.data;
  },

  // Create new workflow
  createWorkflow: async (workflowData) => {
    const response = await postApiWithToken('workflows', workflowData);
    return response.data?.data || response.data;
  },

  // Update workflow
  updateWorkflow: async (id, workflowData) => {
    const response = await putApiWithToken(`workflows/${id}`, workflowData);
    return response.data?.data || response.data;
  },

  // Delete workflow
  deleteWorkflow: async (id) => {
    const response = await deleteApiWithToken(`workflows/${id}`);
    return response.data;
  },

  // Duplicate workflow
  duplicateWorkflow: async (id) => {
    const response = await postApiWithToken(`workflows/${id}/duplicate`, {});
    return response.data?.data || response.data;
  },

  // Validate workflow before saving
  validateWorkflow: async (nodes, edges) => {
    const response = await postApiWithToken('workflows/validate', { nodes, edges });
    return response.data?.data || response.data;
  },

  // Activate workflow (triggers schedule/execution)
  activateWorkflow: async (id) => {
    const response = await postApiWithToken(`workflows/${id}/activate`, {});
    return response.data?.data || response.data;
  },

  // Quick Schedule Post: Auto-generates a canonical 2-node WorkflowDefinition
  // (trigger.schedule -> action.instagram_publish_post) and activates it.
  // Reference: PRD REQ-WF-06, TRD §2.4; AGENT_TASK_PLAN.md Task 29.
  quickSchedulePost: async ({
    mediaUrl,
    caption = "",
    mediaType = "IMAGE",
    scheduleDate = null,
    name = null,
  }) => {
    if (!mediaUrl) {
      throw new Error("mediaUrl is required to schedule an Instagram post");
    }

    const isScheduled = Boolean(scheduleDate);
    const scheduleIso = isScheduled
      ? new Date(scheduleDate).toISOString()
      : new Date().toISOString();

    const postName =
      name ||
      (caption
        ? `Post: ${caption.slice(0, 30)}${caption.length > 30 ? "..." : ""}`
        : `Instagram ${mediaType} ${isScheduled ? "Scheduled" : "Publish"}`);

    const workflowPayload = {
      name: postName,
      description: isScheduled
        ? `Quick scheduled for ${new Date(scheduleDate).toLocaleString()}`
        : "Quick published Instagram post",
      nodes: [
        {
          nodeId: "trigger_schedule",
          type: "trigger.schedule",
          position: { x: 100, y: 150 },
          config: isScheduled
            ? { scheduleTime: scheduleIso }
            : { scheduleTime: scheduleIso, delayMs: 0 },
        },
        {
          nodeId: "action_publish_post",
          type: "action.instagram_publish_post",
          position: { x: 400, y: 150 },
          config: {
            mediaUrl,
            caption,
            mediaType: String(mediaType).toUpperCase(),
          },
        },
      ],
      edges: [
        {
          edgeId: "e_sched_to_publish",
          from: "trigger_schedule",
          to: "action_publish_post",
        },
      ],
    };

    // 1. Create the WorkflowDefinition
    const createdWorkflow = await workflowService.createWorkflow(workflowPayload);

    // 2. Activate the workflow to schedule or execute it immediately via BullMQ
    const activationResult = await workflowService.activateWorkflow(createdWorkflow._id);

    return {
      workflow: createdWorkflow,
      activation: activationResult,
    };
  },
};