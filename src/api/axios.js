import axios from 'axios';

// Create a central axios instance
const instance = axios.create({
    // Backend runs on port 3000
    baseURL: 'http://localhost:3000',
});

// Optional: Add a request interceptor to automatically add the token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
