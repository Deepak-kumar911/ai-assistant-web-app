import { postApiWithToken } from "./apiInterface"

export const uploadMediaApi = (payload)=>{
    return  postApiWithToken(`upload/user/media`,payload,{ "Content-Type": "multipart/form-data" })
}