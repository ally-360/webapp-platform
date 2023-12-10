import React, { useState } from 'react';
// @mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// routes
// _mock
// components
import { useSettingsContext } from 'src/components/settings';
import { AppBar, Button, CardHeader, IconButton, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { Icon } from '@iconify/react';
import { Stack } from '@mui/system';
import PosWindowView from './pos-window-view';
//

// ----------------------------------------------------------------------

export default function PosContainerView() {
  const settings = useSettingsContext();

  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const [openDrawer, setOpenDrawer] = useState(true);

  const hiddenDrawer = () => {
    // hidden drawer
    setOpenDrawer(!openDrawer);
  };

  const [openTab, setOpenTab] = useState(0);

  const [optionsTabs, setOptionsTabs] = useState([
    {
      title: 'Venta 1',
      id: 0,
      icon: <Icon icon="mdi:cart" />,
      component: <PosWindowView hiddenDrawer={hiddenDrawer} openDrawer={openDrawer} />
    }
  ]);

  const handleChangeTab = (newValue) => {
    setOpenTab(newValue);
  };

  const handleAddTab = () => {
    setOptionsTabs([
      ...optionsTabs,
      {
        title: `Venta ${optionsTabs.length + 1}`,
        id: optionsTabs.length,
        icon: <Icon icon="mdi:cart" />,
        component: <PosWindowView hiddenDrawer={hiddenDrawer} openDrawer={openDrawer} />
      }
    ]);
    handleChangeTab(optionsTabs.length);
  };

  const changeNameTab = (newValue) => {
    const newOptionsTabs = optionsTabs.map((tab) => {
      if (tab.id === openTab) {
        return {
          ...tab,
          title: newValue
        };
      }
      return tab;
    });
    setOptionsTabs(newOptionsTabs);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {/* Header Bar */}
      <AppBar
        position="fixed"
        sx={{
          background: theme.palette.background.paper,
          left: 0,
          width:
            // eslint-disable-next-line no-nested-ternary
            openDrawer ? (isLargeScreen ? `calc(100% - ${drawerWidthLg})` : `calc(100% - ${drawerWidth})`) : '100%',
          // eslint-disable-next-line no-nested-ternary
          zIndex: 99999,
          transition: theme.transitions.create('width ', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        <CardHeader
          avatar={<img src="/logo/faviconBackgroundTransparent.svg" alt="logo" width="30" />}
          title={
            <Typography sx={{ color: theme.palette.text.primary }} variant="h6">
              Venta POS
              <Typography component="span" sx={{ color: 'text.secondary' }}>
                &nbsp;(PDV: Palmira)
              </Typography>
            </Typography>
          }
          sx={{ p: 2 }}
          action={
            <IconButton>
              <Icon icon="ic:round-settings" />
            </IconButton>
          }
        />
      </AppBar>
      <Grid container spacing={3}>
        {optionsTabs.map(
          (tab) => openTab === tab.id && <PosWindowView hiddenDrawer={hiddenDrawer} openDrawer={openDrawer} />
        )}

        <Grid xs={12} md={4}>
          {/* <OrderDetailsInfo
            customer={currentOrder.customer}
            delivery={currentOrder.delivery}
            payment={currentOrder.payment}
            shippingAddress={currentOrder.shippingAddress}
          /> */}
        </Grid>
        {/* Bottom container */}
        <AppBar
          position="fixed"
          sx={{
            background: theme.palette.background.paper,
            left: 0,
            bottom: 0,
            top: 'auto',
            width:
              // eslint-disable-next-line no-nested-ternary
              openDrawer ? (isLargeScreen ? `calc(100% - ${drawerWidthLg})` : `calc(100% - ${drawerWidth})`) : '100%',
            // eslint-disable-next-line no-nested-ternary
            zIndex: 99999,
            transition: theme.transitions.create('width ', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen
            })
          }}
        >
          <CardHeader
            title={
              <Stack flexDirection="row" alignItems="center" p={0} gap={2}>
                {optionsTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={openTab === tab.id ? 'contained' : 'outlined'}
                    startIcon={tab.icon}
                    onClick={() => handleChangeTab(tab.id)}
                  >
                    {tab.title}
                  </Button>
                ))}
                <IconButton onClick={handleAddTab}>
                  <Icon icon="mdi:plus" />
                </IconButton>
              </Stack>
            }
            sx={{ p: 1.5 }}
          />
          {/* add new window */}
        </AppBar>
      </Grid>
    </Container>
  );
}
