import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7256/api", // backend URL
});

export default api;
