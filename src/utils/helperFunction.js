let token = "ai-assistant";
let refreshTokenKey = "ai-assistant-refresh";

export const getToken = () => localStorage.getItem(token);
export const setToken = (value) => localStorage.setItem(token, value);
export const removeToken = () => localStorage.removeItem(token);

export const getRefreshToken = () => localStorage.getItem(refreshTokenKey);
export const setRefreshToken = (value) => localStorage.setItem(refreshTokenKey, value);
export const removeRefreshToken = () => localStorage.removeItem(refreshTokenKey);

export const clearAuthTokens = () => {
    localStorage.removeItem(token);
    localStorage.removeItem(refreshTokenKey);
};

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