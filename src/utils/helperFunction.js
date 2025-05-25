let token = "ai-assistant"

export const getToken =()=> localStorage.getItem(token)
export const setToken =(value)=> localStorage.setItem(token,value)
export const removeToken =()=> localStorage.removeItem(token)
