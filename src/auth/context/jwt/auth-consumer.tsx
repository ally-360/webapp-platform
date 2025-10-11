import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
// components
import { SplashScreen } from 'src/components/loading-screen';
import CompanyChangeLoading from 'src/components/loading-screen/CompanyChangeLoading';
//
import { AuthContext } from './auth-context';

// ----------------------------------------------------------------------

export function AuthConsumer({ children }) {
  const location = useLocation();

  // No mostrar CompanyChangeLoading en rutas de registro/autenticación
  const isAuthRoute =
    location.pathname.includes('/auth/') ||
    location.pathname.includes('/register') ||
    location.pathname.includes('/login');

  return (
    <AuthContext.Consumer>
      {(auth) => {
        // Solo mostrar splash screen cuando realmente está cargando datos iniciales
        // y no cuando el usuario no está autenticado
        if (auth.loading && auth.authenticated !== false) {
          return <SplashScreen />;
        }

        // Solo mostrar CompanyChangeLoading si no estamos en rutas de autenticación
        if (auth.changingCompany && !isAuthRoute) {
          return <CompanyChangeLoading open={auth.changingCompany} companyName={auth.company?.name} />;
        }

        return children;
      }}
    </AuthContext.Consumer>
  );
}

AuthConsumer.propTypes = {
  children: PropTypes.node
};
