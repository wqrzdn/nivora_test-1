import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  requiredUserType?: 'owner' | 'tenant' | 'service-provider';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredUserType }) => {
  const { user, isAuthenticated, isLoading, authInitialized } = useAuth();
  const location = useLocation();

  // If still loading auth state or auth is not initialized, show loading spinner
  if (isLoading || !authInitialized) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific user type is required and user type doesn't match, redirect
  if (requiredUserType && user?.userType !== requiredUserType) {
    // Redirect based on user type
    let redirectPath = '/properties';
    
    if (user?.userType === 'owner') {
      redirectPath = '/owner';
    } else if (user?.userType === 'service-provider') {
      redirectPath = '/service-provider';
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  // If user is authenticated (and has correct user type if specified), render children
  return <Outlet />;
};

export default ProtectedRoute;