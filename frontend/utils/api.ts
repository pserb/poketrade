import axios, { AxiosError, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const api = axios.create({
	baseURL: "http://localhost:8000",
});

// Request interceptor to add the auth token to requests
api.interceptors.request.use((config) => {
	const accessToken = Cookies.get("access_token");
	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`;
	}
	return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

		// If the error is 401 Unauthorized and it's not already a retry attempt
		if (error.response?.status === 401 && !originalRequest._retry && originalRequest) {
			originalRequest._retry = true;

			try {
				// Attempt to refresh the token
				const refreshToken = Cookies.get("refresh_token");

				if (refreshToken) {
					const response = await axios.post("http://localhost:8000/token/refresh/", {
						refresh: refreshToken
					});

					if (response.data.access) {
						// Save the new access token
						Cookies.set("access_token", response.data.access);

						// Update the authorization header
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
						} else {
							originalRequest.headers = { Authorization: `Bearer ${response.data.access}` };
						}

						// Retry the original request
						return api(originalRequest);
					}
				}

				// If refresh token is not available or refresh failed
				return Promise.reject(error);
			} catch (refreshError) {
				// If token refresh fails, reject the promise
				return Promise.reject(refreshError);
			}
		}

		// For other errors, just pass them through
		return Promise.reject(error);
	}
);

export default api;