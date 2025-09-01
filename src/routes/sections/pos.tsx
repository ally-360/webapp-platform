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

const PosListView = lazy(() => import('src/pages/pos/list'));
const PosContainerView = lazy(() => import('src/pages/pos/details'));
const PosSalesHistoryPage = lazy(() => import('src/pages/pos/history'));
// Nuevas páginas de Turnos POS
const PosShiftStatusPage = lazy(() => import('src/pages/pos/shift/status'));
const PosShiftHistoryPage = lazy(() => import('src/pages/pos/shift/history'));
const ShiftCloseViewLazy = lazy(() => import('src/sections/pos/view/shift-close-view'));
const PosShiftDetailPage = lazy(() => import('../../pages/pos/shift/detail'));
// Nuevas vistas POS
const PosReturnPage = lazy(() => import('src/pages/pos/return'));
const PosDailyReportPage = lazy(() => import('../../pages/pos/daily-report'));
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
    children: [
      { element: <PosContainerView />, index: true },
      { path: 'list', element: <PosListView /> },
      { path: 'history', element: <PosSalesHistoryPage /> },
      // Turnos POS
      { path: 'shift/status', element: <PosShiftStatusPage /> },
      { path: 'shift/open', element: <PosShiftStatusPage /> },
      { path: 'shift/history', element: <PosShiftHistoryPage /> },
      { path: 'shift/close', element: <ShiftCloseViewLazy /> },
      { path: 'shift/:id', element: <PosShiftDetailPage /> },
      // Otras vistas POS
      { path: 'return', element: <PosReturnPage /> },
      { path: 'daily-report', element: <PosDailyReportPage /> }
    ]
  }
];
