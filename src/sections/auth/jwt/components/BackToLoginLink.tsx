import { Link } from '@mui/material';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import Iconify from 'src/components/iconify';

export default function BackToLoginLink() {
  return (
    <Link
      component={RouterLink}
      href={paths.auth.jwt.login}
      color="inherit"
      variant="subtitle2"
      sx={{
        alignItems: 'center',
        display: 'inline-flex'
      }}
    >
      <Iconify icon="eva:arrow-ios-back-fill" width={16} />
      Volver al inicio de sesión
    </Link>
  );
}
