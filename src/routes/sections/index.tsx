import { Navigate, useRoutes } from 'react-router-dom';
// layouts
// config
//
import React from 'react';
import MainLayout from 'src/layouts/main';
import HomePage from 'src/pages/home';
import { mainRoutes } from './main';
import { authRoutes } from './auth';
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
      element: (
        <MainLayout>
          <HomePage />
        </MainLayout>
      )
    },

    // Auth routes
    ...authRoutes,

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
