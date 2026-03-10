import axios from "axios";
import { toast } from "react-toastify";
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

  // fix for multipart uploads — let browser set Content-Type with boundary
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
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
    const status = error.response?.status;

    // Treat 401, 403, or 500 wrapping auth errors as token failures
    const responseText = JSON.stringify(error.response?.data ?? "");
    const hasAuthMessage = /invalid.*jws|expired|jwt|token/i.test(responseText);
    const isAuthError =
      status === 401 ||
      ((status === 403 || status === 500) && hasAuthMessage);

    if (
      !isAuthError ||
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
  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const res = await refreshClient.post(
    "/refresh",
    {},
    {
      headers: {
        "X-REFRESH-TOKEN": refreshToken,
      },
      withCredentials: true,
    }
  );

  const newAccessToken = res.data?.accessToken;
  const newRefreshToken = res.data?.refreshToken;

  if (!newAccessToken || !newRefreshToken) {
    throw new Error("Invalid refresh response");
  }

  // update zustand store
  const store = useAuthStore.getState();
  store.setAccessToken(newAccessToken);
  store.setRefreshToken(newRefreshToken);
  if (res.data?.user) store.setUser(res.data.user);

  // success toast
  toast.success("Session refreshed");

  // resolve queued requests
  flushQueue(null, newAccessToken);

  // retry original request
  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

  return api(originalRequest);

} catch (err) {

  flushQueue(err, null);

  // logout user if refresh fails
  toast.error("Session expired. Please log in again.");
  useAuthStore.getState().clearSession();
  window.location.href = "/login";

  return Promise.reject(err);

} finally {
  isRefreshing = false;
}
  }
);

export default api;