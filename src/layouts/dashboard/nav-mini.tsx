// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// theme
import { hideScroll } from 'src/theme/css';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// components
import { NavSectionMini } from 'src/components/nav-section';
//
import { Link } from '@mui/material';
import MyAvatar from 'src/layouts/dashboard/MyAvatar';
import { Link as RouterLink } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import LogoMini from 'src/components/logo/logoMini';
import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import { NavToggleButton } from '../_common';

// ----------------------------------------------------------------------

export default function NavMini() {
  const { user } = useMockedUser();

  const navData = useNavData();

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI }
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_MINI - 12
        }}
      />

      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: 'fixed',
          width: NAV.W_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScroll.x
        }}
      >
        <LogoMini sx={{ mx: 'auto', my: 2.5 }} />
        <Link
          component={RouterLink}
          underline="none"
          to={paths.dashboard.user.account}
          sx={{ mx: 'auto', my: 1, mt: 0.5 }}
        >
          <MyAvatar />
        </Link>
        <NavSectionMini
          data={navData}
          config={{
            currentRole: user?.role || 'admin'
          }}
        />
      </Stack>
    </Box>
  );
}
