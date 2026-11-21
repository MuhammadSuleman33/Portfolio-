import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("portfolio_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginAdmin = async (username, password) => {
  const { data } = await api.post("/api/auth/login", { username, password });
  localStorage.setItem("portfolio_admin_token", data.access_token);
  return data;
};

export const logoutAdmin = () => {
  localStorage.removeItem("portfolio_admin_token");
};

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("portfolio_admin_token"));
};

export const fetchProjects = async () => {
  const { data } = await api.get("/api/projects/");
  return data;
};

export const uploadProject = async (formData) => {
  const { data } = await api.post("/api/projects/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteProject = async (projectId) => {
  await api.delete(`/api/projects/${projectId}`);
};

export default api;
