import { getApiWithToken, postApiWithToken } from "./apiInterface"

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

export const getPlatformIntegrationApi = ({type=""})=>{
    return  getApiWithToken(`ai-agent/integration/platform/${type}`)
}