import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route guard component for authenticated pages.
 * Redirects unauthenticated visits to /sign-in while preserving
 * the intended destination path in router state and query string.
 * Reference: Task 37, D6.
 */
export default function ProtectedRoute({ children }) {
  const auth = useSelector((state) => state?.auth);
  const location = useLocation();

  const bootstrapped = Boolean(auth?.bootstrapped);
  const login = Boolean(auth?.login);

  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#06B6D4]/20 border-t-[#06B6D4] rounded-full animate-spin" />
          <span className="text-xs text-[#94A3B8] font-medium tracking-wide">
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  if (!login) {
    const destination = location.pathname + location.search;
    return (
      <Navigate
        to={`/sign-in?from=${encodeURIComponent(destination)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
