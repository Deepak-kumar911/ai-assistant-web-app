import { getApiWithToken,postApiWithToken,putApiWithToken,postApiWithoutToken,putApiWithoutToken } from "./apiInterface"

export const loginApi = (payload)=>{
    return  postApiWithoutToken(`user/login`,payload)
}

export const registerApi = (payload)=>{
    return  postApiWithoutToken(`user/register`,payload)
}