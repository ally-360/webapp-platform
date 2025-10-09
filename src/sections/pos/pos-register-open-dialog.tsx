import React, { useEffect, useState } from 'react';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
  Grid,
  Stack,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { Icon } from '@iconify/react';

// utils
import { formatCurrency } from 'src/redux/pos/posUtils';

// hooks
import { useCashRegister } from './hooks';
import CreateSellerDialog from './create-seller-dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (registerData: {
    pdv_id: string;
    pdv_name: string;
    opening_amount: number;
    seller_id?: string;
    seller_name?: string;
    notes?: string;
  }) => void;
  // New optional default values to prefill the dialog when opened (mock data for now)
  defaultValues?: {
    pdv_name?: string;
    opening_amount?: number;
    seller_id?: string;
    notes?: string;
  };
}

const SUGGESTED_AMOUNTS = [50000, 100000, 200000, 500000];

export default function PosRegisterOpenDialog({ open, onClose, onConfirm, defaultValues }: Props) {
  const [selectedPDV, setSelectedPDV] = useState<{
    id: string;
    name: string;
    is_active: boolean;
  } | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<{
    id: string;
    name: string;
    email?: string;
  } | null>(null);
  const [openingAmount, setOpeningAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [createSellerDialogOpen, setCreateSellerDialogOpen] = useState(false);

  const { availablePDVs, isLoadingPDVs, availableSellers, isLoadingSellers } = useCashRegister();

  useEffect(() => {
    if (open) {
      // Reset form with defaults if provided
      setSelectedPDV(null); // Se seleccionará desde el dropdown
      setSelectedSeller(null); // Se seleccionará desde el dropdown
      setOpeningAmount(defaultValues?.opening_amount ?? 0);
      setNotes(defaultValues?.notes ?? '');
    }
  }, [open, defaultValues]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedPDV) return;

    onConfirm({
      pdv_id: selectedPDV.id,
      pdv_name: selectedPDV.name,
      opening_amount: openingAmount,
      seller_id: selectedSeller?.id,
      seller_name: selectedSeller?.name,
      notes: notes || undefined
    });
    handleClose();
  };

  const canConfirm = selectedPDV && openingAmount >= 0;

  const handleOpenCreateSeller = () => {
    setCreateSellerDialogOpen(true);
  };

  const handleCloseCreateSeller = () => {
    setCreateSellerDialogOpen(false);
  };

  const handleSellerCreated = (newSeller: { id: string; name: string; email?: string }) => {
    setSelectedSeller(newSeller);
    setCreateSellerDialogOpen(false);
  };

  const sellersWithCreateOption = React.useMemo(() => {
    if (availableSellers.length === 0 && !isLoadingSellers) {
      return [
        {
          id: '__create_new__',
          name: '+ Crear nuevo vendedor',
          email: undefined,
          isCreateOption: true
        }
      ];
    }
    return availableSellers;
  }, [availableSellers, isLoadingSellers]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3
        }
      }}
    >
      <DialogTitle
        sx={{
          pb: 2
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Icon icon="mdi:cash-register" width={32} height={32} />
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5" component="div">
                Apertura de Caja
              </Typography>
              <Tooltip
                arrow
                title={
                  <Box>
                    <Typography variant="subtitle2">
                      <strong>Apertura de Caja:</strong>
                    </Typography>
                    <Typography variant="body2" component="div">
                      Este proceso debe realizarse al inicio del día o cuando se inicia operaciones en un nuevo punto de
                      venta.
                    </Typography>
                    <Typography variant="body2" component="div">
                      Registre el dinero inicial en la caja registradora.
                    </Typography>
                  </Box>
                }
              >
                <IconButton size="small" color="info" aria-label="Información de apertura de caja" sx={{ p: 0.5 }}>
                  <Icon icon="mdi:information-outline" width={18} height={18} />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Configuración inicial del punto de venta
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} mb={4} md={12}>
            {/* Dividir en 2 columnas */}
            <Grid mt={0.1} pl={0.5} container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Monto de Apertura"
                  type="number"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(parseFloat(e.target.value) || 0)}
                  sx={{ bgcolor: 'background.paper', mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="mdi:currency-usd" />
                      </InputAdornment>
                    )
                  }}
                  inputProps={{
                    min: 0,
                    step: 1000
                  }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Montos sugeridos:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {SUGGESTED_AMOUNTS.map((amount) => (
                      <Chip
                        key={amount}
                        label={formatCurrency(amount)}
                        variant={openingAmount === amount ? 'filled' : 'outlined'}
                        onClick={() => setOpeningAmount(amount)}
                        color={openingAmount === amount ? 'primary' : 'default'}
                        size="small"
                        icon={<Icon icon="mdi:currency-usd" />}
                      />
                    ))}
                  </Stack>
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                display="flex"
                flexDirection="column"
                flex={1}
                alignItems="center"
                justifyContent="center"
                sx={{
                  padding: '0px !important'
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  Monto de Apertura
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {formatCurrency(openingAmount)}
                </Typography>
                {openingAmount === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Ingrese el dinero inicial disponible en la caja
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Autocomplete
                fullWidth
                options={availablePDVs}
                getOptionLabel={(option) => option.name}
                value={selectedPDV}
                onChange={(_, newValue) => setSelectedPDV(newValue)}
                loading={isLoadingPDVs}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Punto de venta"
                    placeholder="Seleccione un PDV"
                    sx={{ bgcolor: 'background.paper' }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon="mdi:store" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {isLoadingPDVs ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                      <Icon icon="mdi:store" />
                      <Typography variant="body1">{option.name}</Typography>
                      {option.is_active ? (
                        <Chip size="small" label="Activo" color="success" />
                      ) : (
                        <Chip size="small" label="Inactivo" color="default" />
                      )}
                    </Stack>
                  </Box>
                )}
              />

              <Autocomplete
                fullWidth
                options={sellersWithCreateOption}
                getOptionLabel={(option) => option.name}
                value={selectedSeller}
                onChange={(_, newValue) => {
                  if (newValue && 'isCreateOption' in newValue && newValue.isCreateOption) {
                    handleOpenCreateSeller();
                  } else {
                    setSelectedSeller(newValue);
                  }
                }}
                loading={isLoadingSellers}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Vendedor"
                    placeholder="Seleccione un vendedor"
                    sx={{ bgcolor: 'background.paper' }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon="mdi:account" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {isLoadingSellers ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  if ('isCreateOption' in option && option.isCreateOption) {
                    return (
                      <Box
                        component="li"
                        {...props}
                        key={option.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.lighter'
                          },
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'background.neutral'
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{
                            width: '100%',
                            py: 0.5,
                            color: 'primary.main',
                            fontWeight: 600
                          }}
                        >
                          <Icon icon="mdi:account-plus" width={20} height={20} />
                          <Typography variant="body2" color="primary.main" fontWeight={600}>
                            {option.name}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  }

                  return (
                    <Box component="li" {...props} key={option.id}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                        <Icon icon="mdi:account-circle" />
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          {option.email && (
                            <Typography variant="caption" color="text.secondary">
                              {option.email}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  );
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas sobre la apertura de caja, denominaciones de billetes, etc..."
                variant="outlined"
                sx={{ bgcolor: 'background.paper' }}
              />
            </Stack>
          </Grid>
        </Grid>

        {/* Warning if no opening amount */}
        {openingAmount === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Advertencia:</strong> Está configurando una apertura sin dinero inicial. Esto puede ser válido
              para algunos tipos de operación, pero generalmente se recomienda tener un monto inicial para dar cambio.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={handleClose} variant="outlined" size="large" startIcon={<Icon icon="mdi:close" />}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!canConfirm}
          size="large"
          startIcon={<Icon icon="mdi:check" />}
        >
          Abrir Caja
        </Button>
      </DialogActions>

      {/* Modal para crear vendedor */}
      <CreateSellerDialog
        open={createSellerDialogOpen}
        onClose={handleCloseCreateSeller}
        onSuccess={handleSellerCreated}
      />
    </Dialog>
  );
}
