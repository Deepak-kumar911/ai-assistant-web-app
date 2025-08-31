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


// integration part
export const getAllIntegrationCategoryApi = ()=>{
    return  getApiWithToken(`ai-agent/integration/categories`)
}

export const addIntegrationApi = (payload)=>{
    return  postApiWithToken(`ai-agent/integration/add`,payload)
}

export const getAllActiveIntegrationApi = ()=>{
    return  getApiWithToken(`ai-agent/integration/active`)
}