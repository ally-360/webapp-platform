import PropTypes from 'prop-types';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
// auth
import { useAuthContext } from 'src/auth/hooks';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// theme
import { bgGradient } from 'src/theme/css';
// components
import Logo from 'src/components/logo';
import { styled } from '@mui/system';
import { Card } from '@mui/material';
import AuthModernLayout from 'src/layouts/auth/modern';

// ----------------------------------------------------------------------

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2)
}));

export default function AuthClassicLayoutRegister({ children, image, title }) {
  const theme = useTheme();

  const upMd = useResponsive('up', 'md');

  const renderLogo = (
    <Logo
      sx={{
        zIndex: 9,
        position: 'absolute',
        m: { xs: 2, md: 5 }
      }}
    />
  );

  const renderContent = (
    <Stack
      sx={{
        margin: 'auto',
        width: 1,
        mx: 'auto',
        maxWidth: 890,
        px: { xs: 2, md: 8 }
      }}
    >
      {children}
    </Stack>
  );

  const renderSection = (
    <SectionStyle>
      <Stack
        flexGrow={1}
        alignItems="center"
        justifyContent="center"
        spacing={10}
        sx={{
          ...bgGradient({
            color: alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.88 : 0.94),
            imgUrl: '/assets/background/overlay_2.jpg'
          })
        }}
      >
        <Typography variant="h3" sx={{ maxWidth: 390, textAlign: 'center' }}>
          {title || '¡Bienvenido!'}
        </Typography>

        <Box
          component="img"
          alt="auth"
          src={image || '/assets/illustrations/illustration_dashboard.png'}
          sx={{ maxWidth: 520, width: '100%', height: 'auto' }}
        />
      </Stack>
    </SectionStyle>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh'
      }}
    >
      {renderLogo}

      {upMd && renderSection}

      {renderContent}
    </Stack>
  );
}

AuthClassicLayoutRegister.propTypes = {
  children: PropTypes.node,
  image: PropTypes.string,
  title: PropTypes.string
};
