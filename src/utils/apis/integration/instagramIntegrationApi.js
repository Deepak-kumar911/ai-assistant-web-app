import { getApiWithToken, postApiWithToken } from "../apiInterface"

export const connectInstagramApi = ()=>{
    return  getApiWithToken(`integration/instagram/connectInstagram`)
}

export const getInstagramAccessTokenApi = ({code="",aiAgentId="",categoryId=""})=>{
    return  getApiWithToken(`integration/instagram/auth/access-token/${aiAgentId}/${categoryId}?code=${code}`)
}

export const createInstaMediaContainerApi = (payload)=>{
    return  postApiWithToken(`integration/instagram/media/createContainer`,payload)
}

export const publishMediaContainerApi = (payload)=>{
    return  postApiWithToken(`integration/instagram/media/publishMediaContainer`,payload)
}