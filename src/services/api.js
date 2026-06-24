import axios from 'axios';

// Create API instance pointing to backend REST service
const api = axios.create({
  baseURL: 'https://bloodlink-gg10.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional response interceptor to unify error structures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // extract message from typical Express error bodies
    const message = error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred';
    return Promise.reject({ ...error, message });
  }
);

export default api;
