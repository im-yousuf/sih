/**
 * Route guard components.
 *
 * Usage:
 *   <RequireAuth>          — any logged-in user
 *   <RequireRole role="supervisor">  — specific role only
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../store/authStore';

/** Redirect to /login if not authenticated. */
export function RequireAuth() {
  const user     = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

/** Redirect to appropriate home if authenticated but wrong role. */
export function RequireRole({ role }: { role: UserRole }) {
  const user     = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    // Supervisor hitting an incharge route → send to supervisor dash
    // Incharge hitting supervisor route → send to their well
    const fallback =
      user.role === 'supervisor'
        ? '/supervisor'
        : `/well/${user.assignedWellId}/overview`;
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
