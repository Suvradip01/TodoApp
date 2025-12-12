import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a "Request Interceptor" to our Axios instance.
// This works like a middleware but on the FRONTEND.
// Before any request leaves the browser:
api.interceptors.request.use(
    (config) => {
        // 1. Look for a token in Local Storage
        const token = localStorage.getItem('token');

        // 2. If valid, attach it to the Headers
        // Authorization: Bearer <token>
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config; // 3. Let the request proceed to the server
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
