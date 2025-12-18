import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/auth',  
    headers: {
        'Content-Type': 'application/json',
    },
});

// adding a request interceptor to include auth token in headers
api.interceptors.request.use(
    (config) => {
        const tokensString = localStorage.getItem('authTokens');
        
        if (tokensString) {
            const tokens = JSON.parse(tokensString);
            if (tokens.access) {
                config.headers.Authorization = `Bearer ${tokens.access}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;