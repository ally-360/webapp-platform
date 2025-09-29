import PropTypes from 'prop-types';
// components
import { SplashScreen } from 'src/components/loading-screen';
import CompanyChangeLoading from 'src/components/loading-screen/CompanyChangeLoading';
//
import { AuthContext } from './auth-context';

// ----------------------------------------------------------------------

export function AuthConsumer({ children }) {
  return (
    <AuthContext.Consumer>
      {(auth) => {
        if (auth.loading) {
          return <SplashScreen />;
        }

        if (auth.changingCompany) {
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
