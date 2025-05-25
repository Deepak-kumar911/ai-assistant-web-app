import axios from "axios";
import { getToken } from "./helperFunction";
import { apiUrl } from "./baseUrl";

export const getApiWithToken = (path)=>{
    return axios.get(`${apiUrl}/api/${path}`,{
        headers:{
            "Authorization" :`Bearer ${getToken()}`,
            "Content-Type":"application/json"
        }
    })
}

export const postApiWithToken = (path,data)=>{
    return axios.post(`${apiUrl}/api/${path}`,data,{
        headers:{
            "Authorization" :`Bearer ${getToken()}`,
            "Content-Type":"application/json"
        }
    })
}

export const putApiWithToken = (path,data)=>{
    return axios.put(`${apiUrl}/api/${path}`,data,{
        headers:{
            "Authorization" :`Bearer ${getToken()}`,
            "Content-Type":"application/json"
        }
    })
}

export const postApiWithoutToken = (path,data)=>{
    return axios.post(`${apiUrl}/api/${path}`,data)
}

export const putApiWithoutToken = (path,data)=>{
    return axios.put(`${apiUrl}/api/${path}`,data)
}