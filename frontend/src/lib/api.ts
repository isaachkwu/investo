import axios from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
} from "../state/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pending: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  pending.forEach((cb) => cb(token));
  pending = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // Check for token expiration using error.response.data.code or status
    if (
      (error.response?.data?.code === "token_expired" ||
        error.response?.status === 401) &&
      !original._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pending.push((token) => {
            original.headers = original.headers || {};
            original.headers["Authorization"] = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");
        const resp = await axios.post(
          (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000") +
            "/auth/refresh",
            {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );
        const tokens = resp.data as {
          accessToken: string;
        };
        setAccessToken(tokens.accessToken);
        onRefreshed(tokens.accessToken);
        original.headers = original.headers || {};
        original.headers["Authorization"] = `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch (e) {
        clearTokens();
        // window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    console.log(error.response);
    return Promise.reject(error);
  }
);

export default api;
