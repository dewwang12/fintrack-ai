import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Public API client instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Private API client instance (requires JWT access token in header)
export const apiPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Enables cookies to be exchanged for cross-origin refresh requests
});

// Setup interceptors dynamically inside a custom hook (useAxiosPrivate) to access Auth Context state.
