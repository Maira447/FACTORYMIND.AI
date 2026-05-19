import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  (error) => {
    console.log(
      'API error',
      error.config?.method,
      error.config?.url,
      error.response?.status,
      error.response?.data
    );

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.detail?.error ||
      error.response?.data?.detail ||
      error.message ||
      'An unknown error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
