import axios from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
});

// Attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401s centrally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      // The ProtectedRoute component or an effect somewhere should handle redirect to /login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
