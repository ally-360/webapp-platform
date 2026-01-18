import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// @mui
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  IconButton
} from '@mui/material';

// Components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

// Redux
import { useGetAccountByIdQuery, useGetMovementsQuery } from 'src/redux/services/treasuryApi';

// Utils
import { fCurrency } from 'src/utils/format-number';
import { fDate, fDateTime } from 'src/utils/format-time';

// Routes
import { paths } from 'src/routes/paths';

// Components
import AccountForm from './account-form';
import MovementForm from '../components/movement-form';

// ----------------------------------------------------------------------

export default function AccountDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const settings = useSettingsContext();

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openMovementDialog, setOpenMovementDialog] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Fetch account details
  const {
    data: account,
    isLoading,
    error
  } = useGetAccountByIdQuery(id || '', {
    skip: !id
  });

  // Fetch recent movements (last 10)
  const { data: movementsData, isLoading: isLoadingMovements } = useGetMovementsQuery(
    {
      treasury_account_id: id,
      page: 1,
      size: 10
    },
    {
      skip: !id
    }
  );

  const handleEdit = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEdit = () => {
    setOpenEditDialog(false);
  };

  const handleEditSuccess = () => {
    setOpenEditDialog(false);
    // Data will auto-refresh due to RTK Query cache invalidation
  };

  const handleNewMovement = () => {
    setOpenMovementDialog(true);
  };

  const handleCloseMovement = () => {
    setOpenMovementDialog(false);
  };

  const handleMovementSuccess = () => {
    setOpenMovementDialog(false);
    // Data will auto-refresh due to RTK Query cache invalidation
  };

  const handleViewAllMovements = () => {
    navigate(`${paths.dashboard.treasury.movements}?account=${id}`);
  };

  // Helper functions
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return 'solar:wallet-money-bold-duotone';
      case 'bank':
        return 'solar:bank-bold-duotone';
      case 'card':
        return 'solar:card-bold-duotone';
      case 'pos':
        return 'solar:pos-terminal-bold-duotone';
      default:
        return 'solar:wallet-bold-duotone';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cash':
        return 'Caja';
      case 'bank':
        return 'Banco';
      case 'card':
        return 'Tarjeta de crédito';
      case 'pos':
        return 'POS';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cash':
        return 'success';
      case 'bank':
        return 'primary';
      case 'card':
        return 'warning';
      case 'pos':
        return 'info';
      default:
        return 'default';
    }
  };

  const getMovementIcon = (type: string) => (type === 'inflow' ? 'eva:arrow-downward-fill' : 'eva:arrow-upward-fill');

  const getMovementColor = (type: string) => (type === 'inflow' ? 'success' : 'error');

  const getMovementLabel = (type: string) => (type === 'inflow' ? 'Entrada' : 'Salida');

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          icon="solar:wallet-bold-duotone"
          heading="Detalle de cuenta"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Tesorería', href: paths.dashboard.treasury.root },
            { name: 'Cargando...' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={300} />
        </Stack>
      </Container>
    );
  }

  // Error state
  if (error || !account) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          icon="solar:wallet-bold-duotone"
          heading="Error"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Tesorería', href: paths.dashboard.treasury.root },
            { name: 'Error' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Alert severity="error" icon={<Iconify icon="solar:danger-triangle-bold" />}>
          <Typography variant="h6">No se pudo cargar la cuenta</Typography>
          <Typography variant="body2">La cuenta no existe o no tienes permisos para verla.</Typography>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate(paths.dashboard.treasury.root)}
            sx={{ mt: 2 }}
          >
            Volver a Tesorería
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xl">
        <CustomBreadcrumbs
          icon="solar:wallet-bold-duotone"
          heading={account.name}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Tesorería', href: paths.dashboard.treasury.root },
            { name: account.name }
          ]}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={handleNewMovement}
              >
                Registrar movimiento
              </Button>
              <Button variant="outlined" startIcon={<Iconify icon="solar:pen-bold" />} onClick={handleEdit}>
                Editar
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Stack spacing={3}>
          {/* Header Card - Account Summary */}
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                {/* Account Name and Type */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'background.neutral',
                          display: 'flex'
                        }}
                      >
                        <Iconify icon={getTypeIcon(account.type)} width={32} />
                      </Box>
                      <Stack>
                        <Typography variant="h4">{account.name}</Typography>
                        <Chip
                          label={getTypeLabel(account.type)}
                          color={getTypeColor(account.type) as any}
                          size="small"
                          sx={{ width: 'fit-content' }}
                        />
                      </Stack>
                    </Stack>

                    {account.code && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:tag-bold-duotone" width={20} />
                        <Typography variant="body2" color="text.secondary">
                          Código: <strong>{account.code}</strong>
                        </Typography>
                      </Stack>
                    )}

                    {account.account_number && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:card-bold-duotone" width={20} />
                        <Typography variant="body2" color="text.secondary">
                          Número de cuenta: <strong>{account.account_number}</strong>
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Grid>

                {/* Current Balance */}
                <Grid item xs={12} md={6}>
                  <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                    <Typography variant="overline" color="text.secondary">
                      Saldo Actual
                    </Typography>
                    <Typography variant="h3" color="primary.main">
                      {fCurrency(parseFloat(account.current_balance || '0'))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {account.currency || 'COP'}
                    </Typography>
                    <Chip
                      label={account.is_active ? 'Activa' : 'Inactiva'}
                      color={account.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </Stack>
                </Grid>

                {/* Last Updated */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Última actualización: {fDateTime(account.updated_at, undefined)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Configuration Card */}
          <Card>
            <CardHeader
              title="Configuración"
              action={
                <IconButton onClick={() => setShowConfig(!showConfig)}>
                  <Iconify icon={showConfig ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'} />
                </IconButton>
              }
            />
            <CardContent>
              {showConfig ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:dollar-bold-duotone" width={20} />
                        <Typography variant="body2" color="text.secondary">
                          Moneda:
                        </Typography>
                        <Typography variant="body2">
                          <strong>{account.currency || 'COP'}</strong>
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:clock-circle-bold-duotone" width={20} />
                        <Typography variant="body2" color="text.secondary">
                          Requiere sesión:
                        </Typography>
                        <Chip
                          label={account.requires_session ? 'Sí' : 'No'}
                          color={account.requires_session ? 'info' : 'default'}
                          size="small"
                        />
                      </Stack>

                      {account.pos_terminal_id && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify icon="solar:pos-terminal-bold-duotone" width={20} />
                          <Typography variant="body2" color="text.secondary">
                            Terminal POS:
                          </Typography>
                          <Typography variant="body2">
                            <strong>{account.pos_terminal_id}</strong>
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1.5}>
                      {account.accounting_account_id && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify icon="solar:document-text-bold-duotone" width={20} />
                          <Typography variant="body2" color="text.secondary">
                            Cuenta contable asociada
                          </Typography>
                        </Stack>
                      )}

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:calendar-bold-duotone" width={20} />
                        <Typography variant="body2" color="text.secondary">
                          Creada:
                        </Typography>
                        <Typography variant="body2">{fDate(account.created_at, undefined)}</Typography>
                      </Stack>
                    </Stack>
                  </Grid>

                  {account.description && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Descripción:
                      </Typography>
                      <Typography variant="body2">{account.description}</Typography>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Haz clic para ver la configuración completa
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Recent Movements Card */}
          <Card>
            <CardHeader
              title="Últimos movimientos"
              subheader={`${movementsData?.total || 0} movimientos en total`}
              action={
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                  onClick={handleViewAllMovements}
                >
                  Ver todos
                </Button>
              }
            />
            <CardContent sx={{ p: 0 }}>
              {isLoadingMovements && (
                <Stack spacing={2} sx={{ p: 3 }}>
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} variant="rectangular" height={60} />
                  ))}
                </Stack>
              )}

              {!isLoadingMovements && movementsData && movementsData.movements.length > 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell>Origen</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {movementsData.movements.map((movement) => {
                        const isInflow = movement.movement_type === 'inflow';
                        const colorValue = isInflow ? 'success.main' : 'error.main';

                        return (
                          <TableRow key={movement.id} hover>
                            <TableCell>
                              <Typography variant="body2">{fDate(movement.movement_date, undefined)}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {fDateTime(movement.created_at, undefined).split(' ')[1]}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Iconify icon={getMovementIcon(movement.movement_type)} sx={{ color: colorValue }} />
                                <Chip
                                  label={getMovementLabel(movement.movement_type)}
                                  color={getMovementColor(movement.movement_type) as any}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{movement.description || 'Sin descripción'}</Typography>
                              {movement.source_reference && (
                                <Typography variant="caption" color="text.secondary">
                                  Ref: {movement.source_reference}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" color={colorValue}>
                                {isInflow ? '+' : '-'}
                                {fCurrency(parseFloat(movement.amount))}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={movement.source_module} size="small" variant="outlined" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {!isLoadingMovements && (!movementsData || movementsData.movements.length === 0) && (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
                  <Iconify icon="solar:inbox-line-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No hay movimientos registrados
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>

      {/* Edit Dialog */}
      <AccountForm open={openEditDialog} onClose={handleCloseEdit} onSuccess={handleEditSuccess} account={account} />

      {/* Movement Dialog */}
      <MovementForm
        open={openMovementDialog}
        onClose={handleCloseMovement}
        onSuccess={handleMovementSuccess}
        account={account}
      />
    </>
  );
}
