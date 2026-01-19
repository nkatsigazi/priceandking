import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Request Interceptor: Attach the token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh');

      if (refreshToken) {
        try {
          // Attempt to get a new access token
          const res = await axios.post('http://localhost:8000/api/token/refresh/', {
            refresh: refreshToken,
          });

          if (res.status === 200) {
            localStorage.setItem('access', res.data.access);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token is also expired, force logout
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;