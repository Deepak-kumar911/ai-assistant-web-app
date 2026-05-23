import { deleteApiWithToken, getApiWithToken, postApiWithToken, putApiWithToken } from "../apiInterface"

// integration part
export const getAgentKnowledgeListApi = ({agentId,sourceType}) => {
    return getApiWithToken(`ai-agent/knowledge/all?agentId=${agentId}&sourceType=${sourceType}`)
}

export const addAgentKnowledgeApi = (payload) => {
    return postApiWithToken(`ai-agent/knowledge/add`, payload)
}

export const removeAgentKnowledgeApi = (documentId) => {
    return deleteApiWithToken(`ai-agent/knowledge/remove/${documentId}`)
}

export const updateAgentKnowledgeApi = (documentId,payload) => {
    return putApiWithToken(`ai-agent/knowledge/update/${documentId}`, payload)
}
