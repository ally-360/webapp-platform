import { useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
//

// ----------------------------------------------------------------------

const loginPaths = {
  jwt: paths.auth.jwt.login,
  auth0: paths.auth.auth0.login,
  amplify: paths.auth.amplify.login,
  firebase: paths.auth.firebase.login
};

// ----------------------------------------------------------------------

export default function IndexGuard() {
  const router = useRouter();
  useEffect(() => {
    router.push(paths.dashboard.root);
  }, [router]);

  return null;
}
