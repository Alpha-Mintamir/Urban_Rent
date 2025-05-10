import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://urban-rent.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to log headers
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to log response status
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response status:', response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
