import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { mainRoutes } from './main';
import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';
import { posRoutes } from './pos';

// Email verification page
const EmailVerificationPage = lazy(() => import('src/pages/auth/email-verification'));

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    // SET INDEX PAGE WITH SKIP HOME PAGE
    {
      path: '/',
      element: <Navigate to={PATH_AFTER_LOGIN} replace />
    },

    // ----------------------------------------------------------------------

    // Email verification route (outside auth guard)
    {
      path: 'verify-email',
      element: <EmailVerificationPage />
    },

    // Auth routes
    ...authRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Main routes
    ...mainRoutes,

    // POS routes
    ...posRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
