/**
 * 📚 **Auth API Hooks - Usage Examples**
 * 
 * Este archivo demuestra cómo VS Code muestra la documentación
 * detallada cuando haces hover sobre los hooks de authApi.
 */

import React from 'react';
import {
  useLoginMutation,
  useGetCurrentUserQuery,
  useCreateCompanyMutation,
  useSelectCompanyMutation,
  useGetAllPDVsQuery,
  useGetCurrentSubscriptionQuery
} from 'src/redux/services/authApi';

/**
 * 🎯 **Hover Test Component**
 * 
 * Posiciona tu cursor sobre cualquier hook para ver:
 * - ✅ HTTP Method y endpoint (ej: GET /auth/me)
 * - ✅ Descripción funcional
 * - ✅ Ejemplo de código completo
 * - ✅ Tipos de request/response
 */
export function AuthHooksDocumentationExample() {
  // 🔐 Hover aquí → Verás: "Login User - POST /auth/login"
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  // 👤 Hover aquí → Verás: "Get Current User - GET /auth/me"
  const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUserQuery();

  // 🏢 Hover aquí → Verás: "Create Company - POST /company/"
  const [createCompany] = useCreateCompanyMutation();

  // 🔄 Hover aquí → Verás: "Select Company Context - POST /auth/select-company"
  const [selectCompany] = useSelectCompanyMutation();

  // 🏪 Hover aquí → Verás: "Get All PDVs - GET /pdvs/"
  const { data: pdvsResponse } = useGetAllPDVsQuery();

  // 💳 Hover aquí → Verás: "Get Current Subscription - GET /subscriptions/current"
  const { data: subscription } = useGetCurrentSubscriptionQuery();

  const handleLogin = async () => {
    try {
      // Al hacer hover en 'login' también verás la documentación
      await login({
        email: 'user@example.com',
        password: 'password123'
      }).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <h2>Auth API Documentation Test</h2>
      <p>Hover over the hooks in this component to see the documentation!</p>
      
      {/* Ejemplos de información que puedes acceder */}
      <div>
        <h3>Current User:</h3>
        <p>Name: {currentUser?.profile.full_name}</p>
        <p>Email: {currentUser?.email}</p>
      </div>

      <div>
        <h3>PDVs:</h3>
        <p>Total: {pdvsResponse?.total}</p>
        {pdvsResponse?.pdvs.map(pdv => (
          <div key={pdv.id}>{pdv.name}</div>
        ))}
      </div>

      <div>
        <h3>Subscription:</h3>
        <p>Plan: {subscription?.plan_name}</p>
        <p>Days remaining: {subscription?.days_remaining}</p>
      </div>

      <button onClick={handleLogin} disabled={isLoggingIn}>
        {isLoggingIn ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}

/**
 * 📖 **Información visible al hacer hover:**
 * 
 * Cuando posiciones el cursor sobre `useGetCurrentUserQuery`, verás:
 * 
 * ```
 * **Get Current User**
 * 
 * `GET /auth/me`
 * 
 * Retrieves current authenticated user's profile and details
 * 
 * @example
 * const { data: user, isLoading } = useGetCurrentUserQuery();
 * console.log(user?.profile.first_name);
 * ```
 * 
 * ✨ **Beneficios:**
 * - No necesitas ir al archivo authApi.ts para ver endpoints
 * - Ejemplos de código directamente en el tooltip
 * - Información de tipos TypeScript incluida
 * - Documentación siempre actualizada
 * - IntelliSense mejorado
 */