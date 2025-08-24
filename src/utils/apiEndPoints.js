import { getApiWithToken,postApiWithToken,postApiWithoutToken } from "./apiInterface"

export const loginApi = (payload)=>{
    return  postApiWithoutToken(`user/login`,payload)
}

export const registerApi = (payload)=>{
    return  postApiWithoutToken(`user/register`,payload)
}

export const getAllUserAIagentApi = (payload)=>{
    return  getApiWithToken(`user/ai-agent/all`,payload)
}

export const getAiAgentByIdApi = (id)=>{
    return  getApiWithToken(`user/ai-agent/getAiAgentById?_id=${id}`)
}

export const updateAgentWedgetApi = (payload)=>{
    return  postApiWithToken(`user/ai-agent/updateAgentWedget`,payload)
}

export const updateAgentInfoApi = (payload)=>{
    return  postApiWithToken(`user/ai-agent/updateAgentInfo`,payload)
}