import PropTypes from 'prop-types';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// auth
// routes
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// theme
// components
import { styled } from '@mui/system';
import { Card } from '@mui/material';

// ----------------------------------------------------------------------

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '60%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  borderRadius: 0
}));

export default function AuthClassicLayoutRegister({ children, image, title }) {
  const theme = useTheme();

  const upMd = useResponsive('up', 'md');

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
        alignItems="stretch"
        justifyContent="center"
        spacing={1}
        sx={{
          backgroundImage: `url('/logo/Background.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'left',
          paddingLeft: { xs: 0, md: '10%' }
        }}
      >
        <Box
          component="img"
          alt="auth"
          src={image || '/logo/logo-fondo-oscuro.svg'}
          sx={{ maxWidth: 320, width: '100%', height: 'auto' }}
        />
        <Typography variant="h5" sx={{ maxWidth: 390, textAlign: 'left', color: '#fff', opacity: 0.9 }}>
          {title || 'Accede al control total de tu empresa'}
        </Typography>
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
