import React, { useState } from 'react';
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
  IconButton
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Icon } from '@iconify/react';

// utils
import { formatCurrency } from 'src/redux/pos/posUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (registerData: {
    pdv_name: string;
    opening_amount: number;
    opening_date: Date;
    operator_name: string;
    notes?: string;
  }) => void;
  // New optional default values to prefill the dialog when opened (mock data for now)
  defaultValues?: {
    pdv_name?: string;
    opening_amount?: number;
    opening_date?: Date;
    operator_name?: string;
    notes?: string;
  };
}

const SUGGESTED_AMOUNTS = [50000, 100000, 200000, 500000];

export default function PosRegisterOpenDialog({ open, onClose, onConfirm, defaultValues }: Props) {
  const [pdvName, setPdvName] = useState('');
  const [openingAmount, setOpeningAmount] = useState(0);
  const [openingDate, setOpeningDate] = useState<Date>(new Date());
  const [operatorName, setOperatorName] = useState('');
  const [notes, setNotes] = useState('');

  // Initialize values when dialog opens
  React.useEffect(() => {
    if (open) {
      // Reset form with defaults if provided
      setPdvName(defaultValues?.pdv_name ?? `PDV-${Date.now().toString().slice(-4)}`);
      setOpeningAmount(defaultValues?.opening_amount ?? 0);
      setOpeningDate(defaultValues?.opening_date ?? new Date());
      setOperatorName(defaultValues?.operator_name ?? '');
      setNotes(defaultValues?.notes ?? '');
    }
  }, [open, defaultValues]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm({
      pdv_name: pdvName,
      opening_amount: openingAmount,
      opening_date: openingDate,
      operator_name: operatorName,
      notes: notes || undefined
    });
    handleClose();
  };

  const canConfirm = pdvName && openingAmount >= 0 && operatorName && openingDate;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
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
              {/* Title with tooltip info icon */}
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
                        Este proceso debe realizarse al inicio del día o cuando se inicia operaciones en un nuevo punto
                        de venta.
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
                <TextField
                  fullWidth
                  label="Punto de venta"
                  value={pdvName}
                  onChange={(e) => setPdvName(e.target.value)}
                  placeholder="Ej: PDV-001, Caja Principal, etc."
                  sx={{ bgcolor: 'background.paper' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="mdi:store" />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label="Nombre del vendedor"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="Nombre completo del cajero/operador"
                  sx={{ bgcolor: 'background.paper' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="mdi:account" />
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* Notes */}

                <DateTimePicker
                  label="Fecha y Hora de Apertura"
                  value={openingDate}
                  onChange={(newValue) => setOpeningDate(newValue || new Date())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: { bgcolor: 'background.paper' },
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="mdi:calendar" />
                          </InputAdornment>
                        )
                      }
                    }
                  }}
                />
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
      </Dialog>
    </LocalizationProvider>
  );
}
