import React, { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import PosLayout from 'src/layouts/auth/pos/poslayout';
// components
import { LoadingScreen } from 'src/components/loading-screen';
import StepGuard from 'src/auth/guard/step-guard';

// ----------------------------------------------------------------------

// POS

const PosListView = lazy(() => import('src/pages/dashboard/pos/list'));
const PosContainerView = lazy(() => import('src/pages/dashboard/pos/details'));
// ----------------------------------------------------------------------

export const posRoutes = [
  {
    path: '/pos',
    element: (
      <AuthGuard>
        <StepGuard>
          <PosLayout>
            <Suspense fallback={<LoadingScreen />}>
              <Outlet />
            </Suspense>
          </PosLayout>
        </StepGuard>
      </AuthGuard>
    ),
    children: [{ element: <PosContainerView />, index: true }]
  }
];
