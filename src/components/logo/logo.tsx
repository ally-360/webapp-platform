import React from 'react';
// @mui
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
// routes
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
// ----------------------------------------------------------------------

interface LogoProps {
  disabledLink?: boolean;
  dark?: boolean;
  sx?: object;
}

const Logo = ({ disabledLink = false, dark = false, sx }: LogoProps) => {
  // OR using local (public folder)
  // -------------------------------------------------------
  const logo = dark ? (
    <Box component="img" src="/logo/logo-fondo-oscuro.svg" sx={{ width: 240, cursor: 'pointer', ...sx }} />
  ) : (
    <Box component="img" src="/logo/logoFondoTransparentesvg.svg" sx={{ width: 190, cursor: 'pointer', ...sx }} />
  );

  if (disabledLink) {
    return logo;
  }

  return (
    <Link component={RouterLink} href={paths.dashboard.root} sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
};

export default Logo;
