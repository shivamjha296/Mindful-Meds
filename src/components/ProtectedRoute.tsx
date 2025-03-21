import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  redirectPath?: string;
  patientOnly?: boolean;
  dearOneOnly?: boolean;
}

const ProtectedRoute = ({ 
  redirectPath = '/auth',
  patientOnly = false,
  dearOneOnly = false
}: ProtectedRouteProps) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You could render a loading spinner here
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={redirectPath} replace />;
  }

  if (patientOnly && userProfile?.userType === 'dearOne') {
    toast.error('This page is only accessible to patients');
    return <Navigate to="/dear-ones-portal" replace />;
  }

  if (dearOneOnly && userProfile?.userType === 'patient') {
    toast.error('This page is only accessible to caregivers');
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 