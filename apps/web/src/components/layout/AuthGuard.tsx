import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Role } from '@orixa/shared';
import { LoadingPage } from '../ui/spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <LoadingPage />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === Role.SUPER_ADMIN) {
      return <Navigate to="/sa" replace />;
    } else if (user.role === Role.COMPANY_ADMIN) {
      return <Navigate to="/admin" replace />;
    } else if (user.role === Role.CASHIER) {
      return <Navigate to="/pos" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
