import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7256/api",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
