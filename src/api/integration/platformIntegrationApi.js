import { getApiWithToken, postApiWithToken } from "../apiInterface"



export const getAllPlatformIntegrationApi = () => {
    return getApiWithToken(`ai-agent/integration/platform/all`)
}

export const getPlatformIntegrationApi = ({ type = "" }) => {
    return getApiWithToken(`ai-agent/integration/platform/${type}`)
}

export const connectPlatformApi = (type) => {
    return getApiWithToken(`ai-agent/integration/platform/connect/${type}`)
}

export const oauthIntegratePlatformApi = ({platform,agentId,code}) => {
    return getApiWithToken(`ai-agent/integration/platform/auth/${platform}/${agentId}?code=${code}`)
}

export const getInstagramStatusApi = (params = {}) => {
    let platformId = "";
    if (typeof params === "string") {
        platformId = params;
    } else if (params && typeof params === "object") {
        platformId = params.platformId || params.agentId || "";
    }
    const query = platformId ? `?platformId=${platformId}` : "";
    return getApiWithToken(`integration/instagram/status${query}`);
}

export const reconnectInstagramApi = (params = {}) => {
    let platformId = "";
    let agentId = "";
    if (typeof params === "string") {
        platformId = params;
    } else if (params && typeof params === "object") {
        platformId = params.platformId || params.agentId || "";
        agentId = params.agentId || "";
    }
    const query = platformId ? `?platformId=${platformId}` : "";
    return postApiWithToken(`integration/instagram/reconnect${query}`, {
        platformId,
        ...(agentId ? { agentId } : {})
    });
}