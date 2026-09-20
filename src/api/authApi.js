import { getApiWithToken, postApiWithToken, postApiWithoutToken, deleteApiWithToken } from "./apiInterface";

// Auth & Session endpoints (Task 35 & 36, TRD §2.1, §3.1)
export const loginApi = (payload) => {
    return postApiWithoutToken(`auth/login`, payload);
};

export const signupApi = (payload) => {
    return postApiWithoutToken(`auth/signup`, payload);
};

// Backward-compatibility alias
export const registerApi = signupApi;

export const verifyOtpApi = (payload) => {
    return postApiWithoutToken(`auth/verify-otp`, payload);
};

export const resendOtpApi = (payload) => {
    return postApiWithoutToken(`auth/resend-otp`, payload);
};

export const googleAuthApi = (payload) => {
    return postApiWithoutToken(`auth/google`, payload);
};

export const getMeApi = () => {
    return getApiWithToken(`auth/me`);
};

export const logoutApi = (payload = {}) => {
    return postApiWithToken(`auth/logout`, payload);
};

// AI Agent endpoints
export const getAllUserAIagentApi = () => {
    return getApiWithToken(`ai-agent/all`);
};

export const getAiAgentByIdApi = (id) => {
    return getApiWithToken(`ai-agent/getAiAgentById?_id=${id}`);
};

export const updateAgentInfoApi = (payload) => {
    return postApiWithToken(`ai-agent/updateAgentInfo`, payload);
};

export const updateAgentStatusApi = (payload) => {
    return postApiWithToken(`ai-agent/updateStatus`, payload);
};

export const deleteAiAgentApi = (agentId) => {
    return postApiWithToken(`ai-agent/updateStatus`, { agentId, status: "delete" });
};

export const createAiAgentApi = (payload) => {
    return postApiWithToken(`ai-agent/create`, payload);
};

export const getAccountUsageApi = () => {
    return getApiWithToken(`account/usage`);
};
