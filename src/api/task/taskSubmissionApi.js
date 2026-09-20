import {
  getApiWithToken,
  patchApiWithToken,
  downloadApiWithToken,
} from "../../api/apiInterface";

/**
 * Task Submission API interface for Task Response Center
 * Reference: TRD §4.5, §6.6; agenttask.md §8; AGENT_TASK_PLAN.md Task 30.
 */

export const getSubmissionsApi = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "" && val !== "all") {
      query.append(key, val);
    }
  });
  const queryString = query.toString();
  return getApiWithToken(`tasks/submissions${queryString ? `?${queryString}` : ""}`);
};

export const getSubmissionByIdApi = (id) => {
  return getApiWithToken(`tasks/submissions/${id}`);
};

export const updateSubmissionStatusApi = (id, data) => {
  return patchApiWithToken(`tasks/submissions/${id}`, data);
};

export const exportSubmissionsCsvApi = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "" && val !== "all") {
      query.append(key, val);
    }
  });
  const queryString = query.toString();
  const response = await downloadApiWithToken(`tasks/submissions/export${queryString ? `?${queryString}` : ""}`);
  
  // Create download link and trigger download
  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute("download", `task-submissions-${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};
