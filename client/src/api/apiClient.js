import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s to accommodate Render free-tier cold-starts
});

// Interceptor with auto-retry for Render spin-up delays
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Retry once if Render returns 502/503/504 or network timeout on cold start
    if (
      originalRequest &&
      !originalRequest._retry &&
      (error.response?.status === 502 ||
        error.response?.status === 503 ||
        error.response?.status === 504 ||
        error.code === 'ECONNABORTED' ||
        error.message === 'Network Error')
    ) {
      originalRequest._retry = true;
      console.warn('[API Client]: Server waking up, retrying request in 3s...');
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return apiClient(originalRequest);
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    // Do not show double log for report download cancellations
    if (error.config?.responseType !== 'blob') {
      console.error('[API Error Interceptor]:', message);
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
