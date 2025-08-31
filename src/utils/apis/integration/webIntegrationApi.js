import { getApiWithToken, postApiWithToken } from "../apiInterface"

export const getWebIntegrationByIdApi = (id)=>{
    return  getApiWithToken(`ai-agent/integration/web/getDetailsById?agentId=${id}`)
}

export const updateWebIntegrationByIdApi = (payload)=>{
    return  postApiWithToken(`ai-agent/integration/web/updateDetailById`,payload)
}
