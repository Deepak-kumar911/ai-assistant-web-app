let token = "ai-assistant"

export const getToken =()=> localStorage.getItem(token)
export const setToken =(value)=> localStorage.setItem(token,value)
export const removeToken =()=> localStorage.removeItem(token)

export const getFilterQuery = (searchFilter = {}) => {
    if (typeof searchFilter !== "object") return ""
    const objectKeys =  Object.keys(searchFilter)
    
    let searchQuery = objectKeys?.map(key => {
      const valueType = typeof searchFilter[key]
      if (valueType == "string" || valueType == "number" || valueType ==="boolean") {
        if (key === "page" && objectKeys.includes("pageSize")) {
          return `${key}=${searchFilter[key] + 1 || ""}`
        } else if (key === "pageSize") {
          return `limit=${searchFilter[key] || ""}`
        }
        return `${key}=${searchFilter[key] || ""}`
      } else if (Array.isArray( searchFilter[key])) {
           return `${key}=${searchFilter[key] || ""}`
        } else if (valueType == "object") {
            return `${key}=${searchFilter?.[key]?.value || ""}`
        }
        return ""
    }).filter(Boolean).join("&")
    return searchQuery ? `?${searchQuery}` : ""
}