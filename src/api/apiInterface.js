import axios from "axios";
import { getToken } from "../utils/helperFunction";
import { apiUrl } from "../utils/baseUrl";


axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized error, e.g., redirect to login
         window.location.href = '/sign-in';
        }
        return Promise.reject(error);
    }
)

export const getApiWithToken = (path)=>{
    return axios.get(`${apiUrl}/api/v1/${path}`,{
        headers:{
            "Authorization" :`Bearer ${getToken()}`,
            "Content-Type":"application/json"
        }
    })
}

export const postApiWithToken = (path,data,headers={})=>{
    return axios.post(`${apiUrl}/api/v1/${path}`,data,{
        headers:{
            "Authorization" :`Bearer ${getToken()}`,
            "Content-Type":"application/json",
            ...(headers ? headers :{} )
        }
    })
}

export const putApiWithToken = (path,data)=>{
    return axios.put(`${apiUrl}/api/v1/${path}`,data,{
        headers:{
            "Authorization" :`Bearer ${getToken()}`,
            "Content-Type":"application/json"
        }
    })
}

export const postApiWithoutToken = (path,data)=>{
    return axios.post(`${apiUrl}/api/v1/${path}`,data)
}

export const putApiWithoutToken = (path,data)=>{
    return axios.put(`${apiUrl}/api/v1/${path}`,data)
}