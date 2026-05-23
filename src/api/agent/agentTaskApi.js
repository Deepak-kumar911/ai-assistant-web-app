import { deleteApiWithToken, getApiWithToken, postApiWithToken, putApiWithToken } from "../apiInterface"

// integration part
export const getAgentTaskListApi = ({agentId,page=1,limit=10,search="",type=""}) => {
    return getApiWithToken(`ai-agent/task/all?agentId=${agentId}&page=${page}&limit=${limit}&search=${search}&type=${type}`)
}

export const addOrUpdateAgentTaskApi = (payload) => {
    return postApiWithToken(`ai-agent/task/add_update`, payload)
}

export const removeAgentTaskApi = (taskId,agentId) => {
    return deleteApiWithToken(`ai-agent/task/remove/${taskId}/${agentId}`)
}