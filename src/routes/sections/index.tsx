import { Navigate, useRoutes } from 'react-router-dom';
// layouts
// config
//
import { IndexGuard } from 'src/auth/guard';
import React from 'react';
import { mainRoutes } from './main';
import { authRoutes } from './auth';
import { authDemoRoutes } from './auth-demo';
import { dashboardRoutes } from './dashboard';
import { componentsRoutes } from './components';
import { posRoutes } from './pos';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    // SET INDEX PAGE WITH SKIP HOME PAGE
    // {
    //   path: '/',
    //   element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    // },

    // ----------------------------------------------------------------------

    // SET INDEX PAGE WITH HOME PAGE
    {
      path: '/',
      element: <IndexGuard />
    },

    // Auth routes
    ...authRoutes,
    ...authDemoRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Main routes
    ...mainRoutes,

    // Components routes
    ...componentsRoutes,

    // POS routes
    ...posRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
