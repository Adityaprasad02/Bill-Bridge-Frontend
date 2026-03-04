import axios from "axios";

import useAuthStore from "@/features/auth/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL  || "http://localhost:8000",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL  || "http://localhost:8000" ,
  withCredentials: true,
});

const PUBLIC_ENDPOINTS = ["/login", "/user/create", "/refresh", "/logout"];

const isPublicEndpoint = (url = "") =>
  PUBLIC_ENDPOINTS.some((path) => url === path);

// Attach Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (!isPublicEndpoint(config.url) && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

const flushQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  queue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isPublicEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const res = await refreshClient.post("/refresh");
      const newToken = res.data?.accessToken;

      if (!newToken) throw new Error("No token from refresh");

      useAuthStore.getState().setAccessToken(newToken);
      flushQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (err) {
      flushQueue(err, null);
      useAuthStore.getState().clearSession();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;