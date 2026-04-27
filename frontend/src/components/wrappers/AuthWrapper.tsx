import api from "@/lib/api";
import { API_BASE_URL } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthWrapper() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth state once on mount - don't subscribe to changes
    const { token, user } = useAuthStore.getState();

    if (!token || !user) {
      setAuthenticated(false);
      return;
    }

    // Set up interceptors using getState() so they always read fresh token
    const requestInterceptor = api.interceptors.request.use((config) => {
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        config.headers["Authorization"] = `Bearer ${currentToken}`;
      }
      return config;
    });

    let isRefreshing = false;

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (isRefreshing) return Promise.reject(error);
          isRefreshing = true;

          try {
            const response = await axios.post(API_BASE_URL + "/refresh", {}, { withCredentials: true });
            const { token: newToken, user: newUser } = response.data;

            // Update store without triggering re-render of this component
            useAuthStore.getState().setToken(newToken);
            useAuthStore.getState().setUser(newUser);

            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            useAuthStore.getState().logout();
            setAuthenticated(false);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    setAuthenticated(true);

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
