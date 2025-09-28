'use client';

import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/lib/auth';
import LoginForm from './LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      setIsAuth(auth);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthenticated = () => {
    setIsAuth(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!isAuth) {
    return <LoginForm onAuthenticated={handleAuthenticated} />;
  }

  return <>{children}</>;
}