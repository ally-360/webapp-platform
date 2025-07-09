import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// layouts
import MainLayout from 'src/layouts/main';
// components
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/components'));
// FOUNDATION
const ColorsPage = lazy(() => import('src/pages/components/foundation/colors'));
const TypographyPage = lazy(() => import('src/pages/components/foundation/typography'));
const ShadowsPage = lazy(() => import('src/pages/components/foundation/shadows'));
const GridPage = lazy(() => import('src/pages/components/foundation/grid'));
const IconsPage = lazy(() => import('src/pages/components/foundation/icons'));
// EXTRA COMPONENTS

// ----------------------------------------------------------------------

export const componentsRoutes = [
  {
    element: (
      <MainLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </MainLayout>
    ),
    children: [
      {
        path: 'components',
        children: [
          { element: <IndexPage />, index: true },
          {
            path: 'foundation',
            children: [
              { element: <Navigate to="/components/foundation/colors" replace />, index: true },
              { path: 'colors', element: <ColorsPage /> },
              { path: 'typography', element: <TypographyPage /> },
              { path: 'shadows', element: <ShadowsPage /> },
              { path: 'grid', element: <GridPage /> },
              { path: 'icons', element: <IconsPage /> }
            ]
          }
        ]
      }
    ]
  }
];
