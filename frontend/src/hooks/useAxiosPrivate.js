import { useEffect } from 'react';
import { apiPrivate } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook providing an Axios instance equipped with automatic token-refresh interceptors.
 */
export const useAxiosPrivate = () => {
  const { auth, refresh } = useAuth();

  useEffect(() => {
    // Request Interceptor: Attach access token to headers
    const requestIntercept = apiPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization'] && auth.accessToken) {
          config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle token expiration and automatic retry
    const responseIntercept = apiPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        
        // Check if error status is 401 and request hasn't been retried yet
        if (error?.response?.status === 401 && !prevRequest?._retry) {
          prevRequest._retry = true; // Mark to avoid infinite loop
          
          try {
            // Attempt to get a new access token
            const newAccessToken = await refresh();
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            
            // Retry the original request with the new token
            return apiPrivate(prevRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Eject interceptors on cleanup
    return () => {
      apiPrivate.interceptors.request.eject(requestIntercept);
      apiPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]);

  return apiPrivate;
};
