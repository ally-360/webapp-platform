import { useState } from 'react';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Alert,
  TextField,
  Box,
  Divider,
  Chip,
  alpha
} from '@mui/material';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { BankStatementLine, UnmatchedMovement } from '../types';

// ----------------------------------------------------------------------

interface MatchComposerProps {
  selectedLine: BankStatementLine | null;
  selectedMovement: UnmatchedMovement | null;
  onCreateMatch: (note?: string) => void;
  isCreating?: boolean;
  readOnly?: boolean;
}

export default function MatchComposer({
  selectedLine,
  selectedMovement,
  onCreateMatch,
  isCreating = false,
  readOnly = false,
}: MatchComposerProps) {
  const [note, setNote] = useState('');

  const canCreate = selectedLine && selectedMovement && !readOnly;
  const lineAmount = selectedLine
    ? parseFloat(selectedLine.debit) || -parseFloat(selectedLine.credit) || 0
    : 0;
  const movementAmount = selectedMovement ? parseFloat(selectedMovement.amount) : 0;
  const difference = canCreate ? Math.abs(lineAmount - movementAmount) : 0;
  const hasDifference = difference > 0.01; // Tolerancia de 1 centavo

  const handleCreate = () => {
    if (canCreate) {
      onCreateMatch(note || undefined);
      setNote(''); // Limpiar nota después de crear
    }
  };

  // Si no hay selección
  if (!selectedLine && !selectedMovement) {
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `2px dashed ${theme.palette.divider}`,
        }}
      >
        <CardContent>
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', maxWidth: 400 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify
                icon="solar:link-circle-bold-duotone"
                width={48}
                sx={{ color: 'primary.main' }}
              />
            </Box>
            <Typography variant="h6" color="text.secondary">
              Crea una Conciliación Manual
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona una línea del <strong>extracto bancario</strong> (izquierda) y un
              <strong> movimiento de libros</strong> (derecha) para crear una conciliación manual.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'info.main',
                  }}
                />
                <Typography variant="caption">Extracto</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="caption">Libros</Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Si solo hay una selección
  if (!selectedLine || !selectedMovement) {
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette.warning[500], 0.08),
          border: (theme) => `2px dashed ${theme.palette.warning.main}`,
        }}
      >
        <CardContent>
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
            <Iconify
              icon="solar:link-minimalistic-bold-duotone"
              width={64}
              sx={{ color: 'warning.main' }}
            />
            <Typography variant="h6">
              {selectedLine ? 'Selecciona un movimiento' : 'Selecciona una línea del extracto'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedLine
                ? 'Ahora selecciona un movimiento de libros (columna derecha) para crear la conciliación.'
                : 'Ahora selecciona una línea del extracto bancario (columna izquierda) para crear la conciliación.'}
            </Typography>

            {/* Mostrar la selección actual */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                width: '100%',
              }}
            >
              {selectedLine && (
                <Stack spacing={1}>
                  <Chip
                    label="Extracto seleccionado"
                    size="small"
                    color="info"
                    icon={<Iconify icon="solar:document-text-bold" width={16} />}
                  />
                  <Typography variant="subtitle2">{selectedLine.description}</Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(selectedLine.statement_date), 'dd MMM yyyy', { locale: es })}
                    </Typography>
                    <Typography variant="subtitle2" color="primary.main">
                      {fCurrency(lineAmount)}
                    </Typography>
                  </Stack>
                </Stack>
              )}

              {selectedMovement && (
                <Stack spacing={1}>
                  <Chip
                    label="Movimiento seleccionado"
                    size="small"
                    color="success"
                    icon={<Iconify icon="solar:book-bold" width={16} />}
                  />
                  <Typography variant="subtitle2">
                    {selectedMovement.reference || selectedMovement.description}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(selectedMovement.movement_date), 'dd MMM yyyy', {
                        locale: es,
                      })}
                    </Typography>
                    <Typography variant="subtitle2" color="success.main">
                      {fCurrency(parseFloat(selectedMovement.amount))}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Ambos seleccionados - Mostrar compositor de match
  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        border: (theme) => `2px solid ${theme.palette.primary.main}`,
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:link-circle-bold" width={28} sx={{ color: 'white' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">Match Propuesto</Typography>
              <Typography variant="caption" color="text.secondary">
                Revisa los detalles antes de conciliar
              </Typography>
            </Box>
          </Stack>

          <Divider />

          {/* Extracto */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Iconify
                icon="solar:document-text-bold-duotone"
                width={20}
                sx={{ color: 'info.main' }}
              />
              <Typography variant="subtitle2" color="info.main">
                Extracto Bancario
              </Typography>
            </Stack>
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" gutterBottom>
                {selectedLine.description}
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(selectedLine.statement_date), 'dd MMM yyyy', { locale: es })}
                </Typography>
                <Typography variant="h6" color="info.main">
                  {fCurrency(lineAmount)}
                </Typography>
              </Stack>
              {selectedLine.reference && (
                <Typography variant="caption" color="text.secondary">
                  Ref: {selectedLine.reference}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Conector visual */}
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify
                icon="solar:transfer-vertical-bold"
                width={24}
                sx={{ color: 'primary.main' }}
              />
            </Box>
          </Stack>

          {/* Libros */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Iconify icon="solar:book-bold-duotone" width={20} sx={{ color: 'success.main' }} />
              <Typography variant="subtitle2" color="success.main">
                Libros Contables
              </Typography>
            </Stack>
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" gutterBottom>
                {selectedMovement.reference || selectedMovement.description}
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(selectedMovement.movement_date), 'dd MMM yyyy', { locale: es })}
                </Typography>
                <Typography variant="h6" color="success.main">
                  {fCurrency(parseFloat(selectedMovement.amount))}
                </Typography>
              </Stack>
              {selectedMovement.source_module && (
                <Chip label={selectedMovement.source_module} size="small" sx={{ mt: 0.5 }} />
              )}
            </Box>
          </Box>

          <Divider />

          {/* Diferencia */}
          {hasDifference && (
            <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold-duotone" />}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Diferencia de monto detectada</Typography>
                <Typography variant="body2">
                  Hay una diferencia de <strong>{fCurrency(difference)}</strong> entre ambos
                  registros. Puedes conciliar de todas formas si es correcto.
                </Typography>
              </Stack>
            </Alert>
          )}

          {/* Nota opcional */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Nota (opcional)"
            placeholder="Agrega una nota sobre esta conciliación..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={readOnly}
          />

          {/* Botón de acción */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:check-circle-bold" />}
            onClick={handleCreate}
            disabled={!canCreate || isCreating}
            sx={{ py: 1.5 }}
          >
            {isCreating ? 'Conciliando...' : 'Conciliar Manualmente'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
