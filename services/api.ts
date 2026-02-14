import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "https://localhost:7256/api",
});

const refreshAuthToken = async () => {
  try {
    
    const refreshToken = localStorage.getItem("refreshToken");
    
    const response = await axios.post(
      "https://localhost:7256/api/Auth/refresh",
      { refreshToken },
    );

    const { accessToken } = response.data;

    const decoded: any = jwtDecode(accessToken);
    const expiryTime = decoded.exp * 1000;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("tokenExpiry", expiryTime.toString());

    return accessToken;
  } catch (error) {
    console.log("Refresh token failed");
    // localStorage.clear();
  }
};

// 2️⃣ REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 3️⃣ RESPONSE INTERCEPTOR (401 AUTO REFRESH)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshAuthToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

// 4️⃣ REFRESH TIMER
export const startRefreshTimer = () => {
  const expiry = localStorage.getItem("tokenExpiry");

  console.log(expiry,"expiryyyyyyyyyyyyyyyyyyyyyyyyyyyy");
  

  if (!expiry) return;

  const timeout = Number(expiry) - Date.now() - 60000;

  console.log(timeout,"timeoutttttttttttttttttttttttt");
  

  if (timeout > 0) {
    setTimeout(async () => {
      await refreshAuthToken();
      startRefreshTimer();
    }, timeout);
  }
};

export default api;
