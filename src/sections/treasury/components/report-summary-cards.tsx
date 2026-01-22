import { Card, CardHeader, CardContent, Grid, Stack, Typography, Box, Chip } from '@mui/material';

import Iconify from 'src/components/iconify';
import { fCurrency, fPercent } from 'src/utils/format-number';

import type { ReconciliationReportSummary } from '../types';

// ----------------------------------------------------------------------

type Props = {
  summary: ReconciliationReportSummary;
};

// ----------------------------------------------------------------------

export default function ReportSummaryCards({ summary }: Props) {
  const {
    total_statement_lines,
    reconciled_lines,
    unreconciled_lines,
    reconciliation_percentage,
    balance_difference,
    is_balanced,
    reconciled_amount,
    unreconciled_amount
  } = summary;

  const balanceDiff = parseFloat(balance_difference);
  const hasAmount = reconciled_amount !== undefined && unreconciled_amount !== undefined;

  return (
    <Grid container spacing={3}>
      {/* Totales de Líneas */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Líneas Procesadas" />
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:document-text-bold-duotone" width={20} sx={{ color: 'info.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Extracto
                  </Typography>
                </Stack>
                <Typography variant="h6">{total_statement_lines}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="eva:checkmark-circle-2-fill" width={20} sx={{ color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Conciliadas
                  </Typography>
                </Stack>
                <Typography variant="h6" color="success.main">
                  {reconciled_lines}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="eva:alert-triangle-fill" width={20} sx={{ color: 'warning.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Sin Conciliar
                  </Typography>
                </Stack>
                <Typography variant="h6" color="warning.main">
                  {unreconciled_lines}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Progreso de Conciliación */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Progreso" />
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `conic-gradient(
                      ${
                        reconciliation_percentage === 100
                          ? '#00AB55'
                          : reconciliation_percentage >= 75
                          ? '#5E35B1'
                          : reconciliation_percentage >= 50
                          ? '#00B8D9'
                          : reconciliation_percentage >= 25
                          ? '#FFAB00'
                          : '#FF5630'
                      } ${reconciliation_percentage * 3.6}deg,
                      #F4F6F8 0deg
                    )`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h4" fontWeight={700}>
                      {fPercent(reconciliation_percentage)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                {reconciliation_percentage === 100
                  ? '¡Conciliación completa!'
                  : `${reconciled_lines} de ${total_statement_lines} líneas conciliadas`}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Diferencia de Saldos */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Diferencia de Saldos" />
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <Chip
                label={is_balanced ? 'Cuadrado' : 'Diferencia'}
                color={is_balanced ? 'success' : 'warning'}
                icon={
                  <Iconify icon={is_balanced ? 'eva:checkmark-circle-2-fill' : 'eva:alert-triangle-fill'} width={18} />
                }
                sx={{ fontWeight: 600 }}
              />

              <Typography variant="h3" color={is_balanced ? 'success.main' : 'warning.main'} fontWeight={700}>
                {fCurrency(Math.abs(balanceDiff))}
              </Typography>

              {!is_balanced && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Esta diferencia requiere un ajuste contable
                </Typography>
              )}

              {is_balanced && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  El saldo bancario coincide con el saldo contable
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Montos Conciliados vs No Conciliados (si disponible) */}
      {hasAmount && (
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Resumen de Montos" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        Monto Conciliado
                      </Typography>
                      <Typography variant="h5" color="success.main" fontWeight={600}>
                        {fCurrency(parseFloat(reconciled_amount!))}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.disabled">
                      {reconciled_lines} {reconciled_lines === 1 ? 'línea' : 'líneas'}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        Monto Sin Conciliar
                      </Typography>
                      <Typography variant="h5" color="warning.main" fontWeight={600}>
                        {fCurrency(parseFloat(unreconciled_amount!))}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.disabled">
                      {unreconciled_lines} {unreconciled_lines === 1 ? 'línea' : 'líneas'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
