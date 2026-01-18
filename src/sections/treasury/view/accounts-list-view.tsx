import { useState } from 'react';
import { Container, Button, Stack, Alert, AlertTitle, Typography, Box } from '@mui/material';
import { Icon } from '@iconify/react';
import { useRouter } from 'src/routes/hook';

// Components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';

// RTK Query
import { useGetAccountsQuery } from 'src/redux/services/treasuryApi';

// Routes
import { paths } from 'src/routes/paths';

// Local components
import AccountTable from '../components/account-table';
import AccountForm from '../account/account-form';
import type { TreasuryAccount } from '../types';

// ----------------------------------------------------------------------

export default function AccountsListView() {
  const settings = useSettingsContext();
  const router = useRouter();

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TreasuryAccount | null>(null);

  // Fetch accounts
  const { data, isLoading, error, refetch } = useGetAccountsQuery();

  const accounts = data?.accounts || [];
  const isEmpty = accounts.length === 0;

  const handleCreateAccount = () => {
    setSelectedAccount(null);
    setOpenDialog(true);
  };

  const handleEditAccount = (account: TreasuryAccount) => {
    setSelectedAccount(account);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAccount(null);
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleViewAccount = (account: TreasuryAccount) => {
    router.push(paths.dashboard.treasury.accountDetails(account.id));
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Cuentas de Tesorería"
        icon="solar:wallet-bold-duotone"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Tesorería', href: paths.dashboard.treasury.root },
          { name: 'Cuentas' }
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Icon icon="mingcute:add-line" />}
            onClick={handleCreateAccount}
            data-treasury-create-btn
          >
            Nueva Cuenta
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Info card */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<Iconify icon="solar:info-circle-bold" />}>
        <AlertTitle>Cuentas de Tesorería (Cajas y Bancos)</AlertTitle>
        <Typography variant="body2">
          Administra las cuentas reales de dinero del sistema: cajas físicas, cuentas bancarias y terminales POS. Estas
          cuentas son las fuentes y destinos para pagos, ingresos, movimientos y conciliaciones bancarias.
        </Typography>
      </Alert>

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error al cargar cuentas</AlertTitle>
          Ocurrió un error al obtener las cuentas de tesorería. Por favor, intenta nuevamente.
        </Alert>
      )}

      {/* Empty state - first time */}
      {!isLoading && isEmpty && !error && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Stack spacing={3} alignItems="center">
            <Iconify icon="solar:wallet-bold-duotone" width={120} sx={{ color: 'text.disabled', opacity: 0.3 }} />
            <Stack spacing={1}>
              <Typography variant="h5" color="text.secondary">
                No hay cuentas de tesorería
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crea tu primera cuenta de tesorería para comenzar a gestionar tu efectivo y movimientos bancarios.
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleCreateAccount}
              size="large"
            >
              Crear Primera Cuenta
            </Button>
          </Stack>
        </Box>
      )}

      {/* Content */}
      {(!isEmpty || isLoading) && (
        <AccountTable accounts={accounts} isLoading={isLoading} onEdit={handleEditAccount} onView={handleViewAccount} />
      )}

      {/* Account Form Dialog */}
      <AccountForm open={openDialog} onClose={handleCloseDialog} onSuccess={handleSuccess} account={selectedAccount} />
    </Container>
  );
}
