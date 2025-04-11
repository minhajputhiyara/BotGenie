'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const auth = useAuth();
  const router = useRouter();

  if (auth.isLoading) {
    // Optional: Render a loading spinner or skeleton screen
    return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Loading...</p> {/* Replace with a proper loading component if desired */}
        </div>
    );
  }

  if (!auth.token) {
    // If not loading and no token, redirect to login
    // Using useEffect to avoid rendering issues during redirect
    React.useEffect(() => {
      router.push('/login');
    }, [router]);
    return null; // Render nothing while redirecting
  }

  // If loading is finished and token exists, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
