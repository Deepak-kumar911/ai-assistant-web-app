import { getApiWithToken,postApiWithToken,postApiWithoutToken } from "./apiInterface"

export const loginApi = (payload)=>{
    return  postApiWithoutToken(`user/login`,payload)
}

export const registerApi = (payload)=>{
    return  postApiWithoutToken(`user/register`,payload)
}

export const getAllUserAIagentApi = ()=>{
    return  getApiWithToken(`ai-agent/all`)
}

export const getAiAgentByIdApi = (id)=>{
    return  getApiWithToken(`ai-agent/getAiAgentById?_id=${id}`)
}

export const updateAgentInfoApi = (payload)=>{
    return  postApiWithToken(`ai-agent/updateAgentInfo`,payload)
}


