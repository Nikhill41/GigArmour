import axios from "axios";

// Get API URL from environment variable or use localhost as fallback
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: baseURL,
  timeout: 15000 // 15 second timeout for production
});

console.log("[API Client] Using baseURL:", baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
