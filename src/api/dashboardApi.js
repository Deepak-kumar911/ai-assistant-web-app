import { getApiWithToken } from "./apiInterface";

/**
 * Main Dashboard Operational Summary API (Tasks 48 & 49)
 * Supports query params: agentId, period (today, yesterday, last_week, this_month, last_month, custom), startDate, endDate
 */
export const getDashboardSummaryApi = (params = {}) => {
  const query = new URLSearchParams();

  if (params.agentId && params.agentId !== "all") {
    query.set("agentId", params.agentId);
  }
  if (params.period && params.period !== "all") {
    query.set("period", params.period);
  }
  if (params.startDate) {
    query.set("startDate", params.startDate);
  }
  if (params.endDate) {
    query.set("endDate", params.endDate);
  }

  const qs = query.toString();
  return getApiWithToken(qs ? `dashboard/summary?${qs}` : "dashboard/summary");
};
