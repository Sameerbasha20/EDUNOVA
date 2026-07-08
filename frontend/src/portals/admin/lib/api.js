import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("edunova_admin_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("edunova_admin_refresh");
      if (!refresh) {
        localStorage.clear();
        window.location.href = "/admin/login";
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject, original });
        });
      }
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
        localStorage.setItem("edunova_admin_access", data.access);
        queue.forEach(({ resolve, original: o }) => {
          o.headers.Authorization = `Bearer ${data.access}`;
          resolve(api(o));
        });
        queue = [];
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (e) {
        localStorage.clear();
        window.location.href = "/admin/login";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
