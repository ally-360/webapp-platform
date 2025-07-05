import React, { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard, GuestGuard } from 'src/auth/guard';
// layouts
import AuthClassicLayout from 'src/layouts/auth/classic';
// components
import { SplashScreen } from 'src/components/loading-screen';
import AuthModernCompactLayout from 'src/layouts/auth/modern-compact';
import AuthClassicLayoutRegister from 'src/layouts/auth/classicRegister';

// ----------------------------------------------------------------------

// JWT
const JwtLoginPage = lazy(() => import('src/pages/auth/jwt/login'));
const JwtRegisterPage = lazy(() => import('src/pages/auth/jwt/register'));
const ForgotPasswordPage = lazy(() => import('src/pages/auth/jwt/forgot-password'));

// STEP BY STEP
const SetpBySetp = lazy(() => import('src/pages/authentication/StepByStep'));

// ----------------------------------------------------------------------

const authJwt = {
  path: 'jwt',
  element: (
    <GuestGuard>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </GuestGuard>
  ),
  children: [
    {
      path: 'login',
      element: (
        <AuthClassicLayout>
          <JwtLoginPage />
        </AuthClassicLayout>
      )
    },
    {
      path: 'register',
      element: (
        <AuthClassicLayoutRegister title="Sistema de Contabilidad y POS para impulsar tu negocio">
          <JwtRegisterPage />
        </AuthClassicLayoutRegister>
      )
    },
    {
      path: 'forgot-password',
      element: (
        <AuthModernCompactLayout>
          <ForgotPasswordPage />
        </AuthModernCompactLayout>
      )
    }
  ]
};

const stepByStep = {
  path: 'step-by-step',
  element: (
    <AuthGuard>
      <Suspense fallback={<SplashScreen />}>
        <SetpBySetp />
      </Suspense>
    </AuthGuard>
  )
};

export const authRoutes = [
  {
    path: 'auth',
    children: [authJwt, stepByStep]
  }
];
