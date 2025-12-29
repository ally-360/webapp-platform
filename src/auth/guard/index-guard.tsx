import { useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
//

// ----------------------------------------------------------------------

const _loginPaths = {
  jwt: paths.auth.jwt.login
};

// ----------------------------------------------------------------------

export default function IndexGuard() {
  const router = useRouter();
  useEffect(() => {
    router.push(paths.dashboard.root);
  }, [router]);

  return null;
}
