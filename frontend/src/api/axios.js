import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
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

``` found while debugging:-```
// adding a response interceptor to handle authentication errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If we get a 401/403 and haven't tried to refresh yet
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            const tokensString = localStorage.getItem('authTokens');
            if (tokensString) {
                const tokens = JSON.parse(tokensString);
                
                // Try to refresh the token
                if (tokens.refresh) {
                    try {
                        const response = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
                            refresh: tokens.refresh
                        });
                        
                        const newTokens = response.data;
                        localStorage.setItem('authTokens', JSON.stringify({
                            ...tokens,
                            ...newTokens
                        }));
                        
                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
                        return api(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, clear tokens and redirect to login
                        localStorage.removeItem('authTokens');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;