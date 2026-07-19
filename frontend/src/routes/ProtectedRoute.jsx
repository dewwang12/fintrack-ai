import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Feedback/Spinner';

/**
 * Route protection wrapper redirecting unauthenticated traffic to login path.
 */
export const ProtectedRoute = () => {
  const { auth, loading } = useAuth();

  // If application is determining session status, show full screen spinner to prevent visual flicker
  if (loading) {
    return <Spinner fullScreen />;
  }

  // If user session does not exist, redirect to login
  if (!auth.accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
