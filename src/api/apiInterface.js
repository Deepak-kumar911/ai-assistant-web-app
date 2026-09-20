import axios from "axios";
import { getToken, setToken, getRefreshToken, setRefreshToken, clearAuthTokens } from "../utils/helperFunction";
import { apiUrl } from "./baseUrl";
import { toast } from "react-toastify";
import { store } from "../stateManagement/store";
import { logout } from "../stateManagement/slices/authSlice";

axios.defaults.withCredentials = true;

// Queue mechanism for handling concurrent requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

let sessionExpiredToastShown = false;
export const handleSessionExpired = () => {
  clearAuthTokens();
  try {
    store.dispatch(logout());
  } catch (e) {
    console.warn("Could not dispatch logout:", e);
  }

  if (!sessionExpiredToastShown) {
    sessionExpiredToastShown = true;
    toast.error("Your session has expired. Please sign in again.");
    setTimeout(() => {
      sessionExpiredToastShown = false;
    }, 4000);
  }

  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;
  const isPublicPath = ['/sign-in', '/sign-up', '/oauth/callback', '/design-system'].includes(currentPath);

  if (!isPublicPath) {
    const fromDestination = encodeURIComponent(currentPath + currentSearch);
    window.location.href = `/sign-in?from=${fromDestination}`;
  }
};

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;
    const currentPath = window.location.pathname;
    const isPublicPath = ['/sign-in', '/sign-up', '/oauth/callback', '/design-system'].includes(currentPath);

    // Only intercept 401 Unauthorized errors
    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Do not attempt refresh on auth endpoints (login, signup, refresh itself, etc.)
    const requestUrl = originalRequest.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/signup") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/verify-otp") ||
      requestUrl.includes("/auth/refresh");

    if (isAuthEndpoint || originalRequest._retry) {
      if (!isPublicPath && !isAuthEndpoint) {
        handleSessionExpired();
      }
      return Promise.reject(error);
    }

    // If another refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          }
          return axios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt silent refresh via POST /api/v1/auth/refresh
      const currentRefreshToken = getRefreshToken();
      const refreshResponse = await axios.post(
        `${apiUrl}/api/v1/auth/refresh`,
        { refreshToken: currentRefreshToken },
        { withCredentials: true }
      );

      const newAccessToken = refreshResponse.data?.accessToken;
      const newRefreshToken = refreshResponse.data?.refreshToken;

      if (newAccessToken) {
        setToken(newAccessToken);
      }
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      processQueue(null, newAccessToken);

      if (originalRequest.headers) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      }
      return axios(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      if (!isPublicPath) {
        handleSessionExpired();
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export const getApiWithToken = (path) => {
  return axios.get(`${apiUrl}/api/v1/${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

export const postApiWithToken = (path, data, headers = {}) => {
  return axios.post(`${apiUrl}/api/v1/${path}`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...(headers ? headers : {}),
    },
  });
};

export const putApiWithToken = (path, data) => {
  return axios.put(`${apiUrl}/api/v1/${path}`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

export const deleteApiWithToken = (path, headers = {}) => {
  return axios.delete(`${apiUrl}/api/v1/${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...(headers ? headers : {}),
    },
  });
};

export const patchApiWithToken = (path, data) => {
  return axios.patch(`${apiUrl}/api/v1/${path}`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

export const downloadApiWithToken = (path) => {
  return axios.get(`${apiUrl}/api/v1/${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    responseType: "blob",
  });
};

export const getApiWithoutToken = (path) => {
  return axios.get(`${apiUrl}/api/v1/${path}`);
};

export const postApiWithoutToken = (path, data) => {
  return axios.post(`${apiUrl}/api/v1/${path}`, data);
};

export const putApiWithoutToken = (path, data) => {
  return axios.put(`${apiUrl}/api/v1/${path}`, data);
};