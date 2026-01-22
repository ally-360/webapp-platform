import { Card, CardHeader, CardContent, Alert, AlertTitle, Stack, Typography, Button, Box } from '@mui/material';

import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  adjustmentEntryId?: string;
  balanceDifference: string;
  isBalanced: boolean;
  isCompleted: boolean;
  onViewEntry?: () => void;
};

// ----------------------------------------------------------------------

export default function AdjustmentInfoCard({
  adjustmentEntryId,
  balanceDifference,
  isBalanced,
  isCompleted,
  onViewEntry
}: Props) {
  const diff = parseFloat(balanceDifference);
  const hasDifference = Math.abs(diff) > 0.01;

  // No mostrar si está balanceado
  if (isBalanced || !hasDifference) {
    return null;
  }

  const hasEntry = !!adjustmentEntryId;

  return (
    <Card sx={{ bgcolor: 'warning.lighter', borderColor: 'warning.main' }}>
      <CardHeader
        avatar={<Iconify icon="solar:document-add-bold-duotone" width={24} sx={{ color: 'warning.dark' }} />}
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            {hasEntry ? 'Ajuste Contable Generado' : 'Ajuste Contable Requerido'}
          </Typography>
        }
      />
      <CardContent>
        <Stack spacing={2}>
          {hasEntry ? (
            <Alert severity="info" icon={<Iconify icon="eva:checkmark-circle-2-fill" width={24} />}>
              <AlertTitle>Ajuste Generado Automáticamente</AlertTitle>
              El sistema ha generado un asiento contable para cuadrar la diferencia de{' '}
              <strong>{fCurrency(Math.abs(diff))}</strong>
            </Alert>
          ) : (
            <Alert severity="warning" icon={<Iconify icon="eva:alert-triangle-fill" width={24} />}>
              <AlertTitle>Se Requiere Ajuste Contable</AlertTitle>
              Existe una diferencia de <strong>{fCurrency(Math.abs(diff))}</strong> entre el saldo bancario y el saldo
              en libros.
              {isCompleted &&
                ' Al completar la conciliación, se debió generar un asiento contable automático para registrar este ajuste.'}
            </Alert>
          )}

          {hasEntry && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.neutral',
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'warning.main'
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    ID del Asiento
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {adjustmentEntryId}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Monto del Ajuste
                  </Typography>
                  <Typography variant="subtitle2" color="warning.dark" fontWeight={700}>
                    {fCurrency(Math.abs(diff))}
                  </Typography>
                </Stack>

                {onViewEntry && (
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    fullWidth
                    startIcon={<Iconify icon="solar:eye-bold" />}
                    onClick={onViewEntry}
                  >
                    Ver Asiento Contable
                  </Button>
                )}
              </Stack>
            </Box>
          )}

          {!hasEntry && isCompleted && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Nota: Si el asiento no se generó automáticamente, puede ser necesario crearlo manualmente desde el módulo
              de contabilidad.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
