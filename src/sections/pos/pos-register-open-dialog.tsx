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
  Card,
  Alert,
  Chip
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
}

const SUGGESTED_AMOUNTS = [50000, 100000, 200000, 500000];

export default function PosRegisterOpenDialog({ open, onClose, onConfirm }: Props) {
  const [pdvName, setPdvName] = useState('');
  const [openingAmount, setOpeningAmount] = useState(0);
  const [openingDate, setOpeningDate] = useState<Date>(new Date());
  const [operatorName, setOperatorName] = useState('');
  const [notes, setNotes] = useState('');

  // Initialize values when dialog opens
  React.useEffect(() => {
    if (open) {
      // Reset form
      setPdvName(`PDV-${Date.now().toString().slice(-4)}`);
      setOpeningAmount(0);
      setOpeningDate(new Date());
      setOperatorName('');
      setNotes('');
    }
  }, [open]);

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
            borderRadius: 3,
            minHeight: '60vh'
          }
        }}
      >
        {/* Enhanced Header */}
        <DialogTitle
          sx={{
            pb: 2,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            color: 'success.contrastText',
            '& .MuiTypography-root': {
              color: 'inherit'
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Icon icon="mdi:cash-register" width={32} height={32} />
            <Box>
              <Typography variant="h5" component="div">
                Apertura de Caja
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Configuración inicial del punto de venta
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Apertura de Caja:</strong> Este proceso debe realizarse al inicio del día o cuando se inicia
              operaciones en un nuevo punto de venta. Registre el dinero inicial en la caja registradora.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {/* Left Column - Basic Info */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* PDV Name */}
                <Card sx={{ p: 2.5, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="mdi:point-of-sale" />
                    Punto de Venta (PDV)
                  </Typography>
                  <TextField
                    fullWidth
                    label="Nombre del PDV"
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
                </Card>

                {/* Operator Info */}
                <Card sx={{ p: 2.5, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="mdi:account-tie" />
                    Operador Responsable
                  </Typography>
                  <TextField
                    fullWidth
                    label="Nombre del Operador"
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
                </Card>

                {/* Opening Date */}
                <Card sx={{ p: 2.5, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="mdi:calendar-clock" />
                    Fecha y Hora de Apertura
                  </Typography>
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
                </Card>
              </Stack>
            </Grid>

            {/* Right Column - Opening Amount */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* Opening Amount */}
                <Card sx={{ p: 2.5, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="mdi:cash-multiple" />
                    Dinero Inicial en Caja
                  </Typography>

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

                  {/* Suggested Amounts */}
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
                </Card>

                {/* Current Amount Display */}
                <Card
                  sx={{
                    p: 3,
                    border: '2px solid',
                    borderColor: 'success.main',
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.success.light} 100%)`
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="success.main"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Icon icon="mdi:cash" />
                    Monto de Apertura
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {formatCurrency(openingAmount)}
                  </Typography>
                  {openingAmount === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Ingrese el dinero inicial disponible en la caja
                    </Typography>
                  )}
                </Card>

                {/* Notes */}
                <Card sx={{ p: 2.5, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="mdi:note-text" />
                    Observaciones
                  </Typography>
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
                </Card>
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

        <DialogActions sx={{ p: 3, bgcolor: 'background.neutral', gap: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            size="large"
            startIcon={<Icon icon="mdi:close" />}
            sx={{ minWidth: 120 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!canConfirm}
            size="large"
            startIcon={<Icon icon="mdi:check" />}
            sx={{
              minWidth: 160,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              '&:hover': {
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`
              }
            }}
          >
            Abrir Caja
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
