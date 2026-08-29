import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    // Do not show double toast for report download cancellations
    if (error.config?.responseType !== 'blob') {
      console.error('[API Error Interceptor]:', message);
    }
    
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
