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