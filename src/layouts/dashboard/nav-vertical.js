import PropTypes from 'prop-types';
import { useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { Link as RouterLink, useLocation } from 'react-router-dom';

// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// components
import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';
import { usePathname } from 'src/routes/hook';
import { NavSectionVertical } from 'src/components/nav-section';
//
import styled from '@emotion/styled';
import { Link, Avatar, Typography, useTheme } from '@mui/material';
import { paths } from 'src/routes/paths';
import Paper from 'src/theme/overrides/components/paper';
import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import { NavToggleButton, NavUpgrade } from '../_common';

// ----------------------------------------------------------------------

const AccountStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center'
  // padding: theme.spacing(1.4, 1.5),
  // borderRadius: theme.shape.borderRadiusSm,
  // backgroundColor: theme.palette.grey[200]
}));

export default function NavVertical({ openNav, onCloseNav }) {
  const { user } = useMockedUser();

  const theme = useTheme();

  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Logo sx={{ mt: 3, ml: 4, mb: 1 }} />

      <Link component={RouterLink} underline="none" to={paths.dashboard.user.account}>
        <AccountStyle
          style={{
            padding: theme.spacing(1.4, 1.5),
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.grey[500_16],
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2)
          }}
        >
          {/* <Paper theme={theme}> */}
          <Avatar
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
            alt={user.displayName}
            // color={user.profile?.photo ? 'default' : createAvatar(user.displayName).color}
            // {...other}
          >
            {/* {createAvatar(user.displayName).name} */}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', textDecoration: 'none !important' }}>
              {user.displayName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
              Daniel SAS
            </Typography>
          </Box>
          {/* </Paper> */}
        </AccountStyle>
      </Link>

      <NavSectionVertical
        data={navData}
        config={{
          currentRole: user?.role || 'admin'
        }}
      />

      <Box sx={{ flexGrow: 1 }} />

      <NavUpgrade />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL }
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL
            }
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

NavVertical.propTypes = {
  onCloseNav: PropTypes.func,
  openNav: PropTypes.bool
};
