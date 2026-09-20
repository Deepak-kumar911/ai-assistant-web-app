import { getApiWithToken, patchApiWithToken } from "../apiInterface";

/**
 * Chat Inbox API
 * Reference: TRD §2.3, §5, §6.6; PRD §5.8; AGENT_TASK_PLAN.md Task 31.
 */

export const getThreadsApi = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "" && val !== "all") {
      query.append(key, val);
    }
  });
  const queryString = query.toString();
  return getApiWithToken(`inbox/threads${queryString ? `?${queryString}` : ""}`);
};

export const getThreadByIdApi = (id) => {
  return getApiWithToken(`inbox/threads/${id}`);
};

export const updateThreadStatusApi = (id, data) => {
  return patchApiWithToken(`inbox/threads/${id}`, data);
};
