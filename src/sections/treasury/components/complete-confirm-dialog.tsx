import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert,
  AlertTitle,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import { fCurrency } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import type { BankReconciliation } from 'src/sections/treasury/types';

interface CompleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reconciliation: BankReconciliation;
  hasUnreconciledLines: boolean;
  isLoading?: boolean;
}

export default function CompleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  reconciliation,
  hasUnreconciledLines,
  isLoading = false
}: CompleteConfirmDialogProps) {
  const { reconciliation_percentage, balance_difference, is_balanced, unreconciled_lines, bank_account } =
    reconciliation;

  const percentage = parseFloat(reconciliation_percentage?.toString() || '0');
  const balanceDiff = parseFloat(balance_difference?.toString() || '0');
  const hasDifference = Math.abs(balanceDiff) > 0.01;
  const willCreateAdjustment = hasDifference && !is_balanced;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:check-circle-bold-duotone" width={28} sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Completar Conciliación</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Warning if there are unreconciled lines */}
          {hasUnreconciledLines && (
            <Alert severity="warning" icon={<Iconify icon="eva:alert-triangle-fill" width={24} />}>
              <AlertTitle sx={{ fontWeight: 600 }}>Atención: Líneas pendientes</AlertTitle>
              <Typography variant="body2">
                Aún tienes{' '}
                <strong>
                  {unreconciled_lines} línea{unreconciled_lines !== 1 ? 's' : ''}
                </strong>{' '}
                sin conciliar. Al completar ahora, estas líneas quedarán marcadas como no conciliadas.
              </Typography>
            </Alert>
          )}

          {/* Adjustment warning */}
          {willCreateAdjustment && (
            <Alert severity="info" icon={<Iconify icon="solar:document-add-bold-duotone" width={24} />}>
              <AlertTitle sx={{ fontWeight: 600 }}>Se generará ajuste contable</AlertTitle>
              <Typography variant="body2">
                Existe una diferencia de <strong>{fCurrency(Math.abs(balanceDiff))}</strong>. Se creará automáticamente
                un asiento de ajuste para cuadrar los saldos.
              </Typography>
            </Alert>
          )}

          {/* Summary */}
          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'background.neutral' }}>
            <Typography variant="subtitle2" gutterBottom>
              Resumen de Conciliación
            </Typography>
            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Cuenta bancaria:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {bank_account?.name || 'N/A'}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Progreso:
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={percentage === 100 ? 'success.main' : 'warning.main'}
                  >
                    {percentage.toFixed(0)}%
                  </Typography>
                  {percentage === 100 && (
                    <Iconify icon="eva:checkmark-circle-2-fill" width={18} sx={{ color: 'success.main' }} />
                  )}
                </Stack>
              </Stack>

              {hasUnreconciledLines && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Líneas pendientes:
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    {unreconciled_lines}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Balance:
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {is_balanced ? (
                    <>
                      <Iconify icon="eva:checkmark-circle-2-fill" width={16} sx={{ color: 'success.main' }} />
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        Balanceado
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Iconify icon="eva:alert-triangle-fill" width={16} sx={{ color: 'warning.main' }} />
                      <Typography variant="body2" fontWeight={600} color="warning.main">
                        Diferencia: {fCurrency(Math.abs(balanceDiff))}
                      </Typography>
                    </>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Box>

          {/* Confirmation message */}
          <Alert severity="success" icon={<Iconify icon="eva:info-fill" width={24} />}>
            <Typography variant="body2">
              Al confirmar, la conciliación cambiará a estado <strong>Completada</strong> y no podrá modificarse. Solo
              podrá ser revertida si es necesario.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:checkmark-circle-2-fill" />
          }
        >
          {isLoading ? 'Completando...' : 'Completar Conciliación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
