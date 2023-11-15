import PropTypes from 'prop-types';
import { useEffect, useCallback, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
//
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

const loginPaths = {
  jwt: paths.auth.jwt.login,
  auth0: paths.auth.auth0.login,
  amplify: paths.auth.amplify.login,
  firebase: paths.auth.firebase.login
};

// ----------------------------------------------------------------------

export default function IndexGuard({ children }) {
  const router = useRouter();
  useEffect(() => {
    router.push(paths.dashboard.root);
  }, [router]);
}

IndexGuard.propTypes = {
  children: PropTypes.node
};
