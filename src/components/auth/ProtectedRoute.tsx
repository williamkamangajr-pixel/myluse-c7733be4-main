import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PasscodeLock } from './PasscodeLock';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isLocked } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLocked) {
    return <PasscodeLock />;
  }

  return <>{children}</>;
}
