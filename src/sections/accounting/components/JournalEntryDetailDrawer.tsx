import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format} from 'date-fns';
import { es } from 'date-fns/locale';
import { LoadingScreen } from 'src/components/loading-screen';
import { useGetJournalEntryByIdQuery } from 'src/redux/services/accountingApi';
import { fCurrency } from 'src/utils/format-number';
import type { JournalEntryType, JournalEntryStatus } from '../types';

interface JournalEntryDetailDrawerProps {
  entryId: string | null;
  open: boolean;
  onClose: () => void;
}

const entryTypeLabels: Record<JournalEntryType, string> = {
  invoice: 'Factura',
  payment: 'Pago',
  treasury: 'Tesorería',
  debit_note: 'Nota Débito',
  credit_note: 'Nota Crédito',
  adjustment: 'Ajuste',
  manual: 'Manual'
};

const entryTypeColors: Record<JournalEntryType, any> = {
  invoice: 'success',
  payment: 'info',
  treasury: 'warning',
  debit_note: 'error',
  credit_note: 'primary',
  adjustment: 'secondary',
  manual: 'default'
};

const statusLabels: Record<JournalEntryStatus, string> = {
  draft: 'Borrador',
  posted: 'Contabilizado',
  voided: 'Anulado'
};

const statusColors: Record<JournalEntryStatus, any> = {
  draft: 'warning',
  posted: 'success',
  voided: 'error'
};

export function JournalEntryDetailDrawer({ entryId, open, onClose }: JournalEntryDetailDrawerProps) {
  const { data: entry, isLoading } = useGetJournalEntryByIdQuery(entryId!, {
    skip: !entryId
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', md: 720 } }
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="h6">Detalle de Asiento Contable</Typography>
        <IconButton onClick={onClose} size="small">
          <Icon icon="solar:close-circle-bold" width={24} />
        </IconButton>
      </Stack>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {isLoading && <LoadingScreen />}

        {!isLoading && entry && (
          <Stack spacing={3}>
            {/* Cabecera del asiento */}
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h4">{entry.entry_number}</Typography>
                <Chip label={statusLabels[entry.status]} color={statusColors[entry.status]} size="small" />
              </Stack>

              <Stack spacing={1.5}>
                <Stack direction="row" spacing={2}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
                    Fecha:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {format(new Date(entry.entry_date), 'dd MMMM yyyy', { locale: es })}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
                    Tipo:
                  </Typography>
                  <Chip
                    label={entryTypeLabels[entry.entry_type]}
                    color={entryTypeColors[entry.entry_type]}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                {entry.reference_number && (
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
                      Referencia:
                    </Typography>
                    <Typography variant="body2">{entry.reference_number}</Typography>
                  </Stack>
                )}

                <Stack direction="row" spacing={2}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
                    Descripción:
                  </Typography>
                  <Typography variant="body2">{entry.description}</Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* Líneas contables */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Movimientos Contables
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cuenta</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Tercero</TableCell>
                      <TableCell align="right">Débito</TableCell>
                      <TableCell align="right">Crédito</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entry.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" fontWeight={600}>
                              {line.account_code}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {line.account_name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {line.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {line.third_party_name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={line.debit > 0 ? 600 : 400}
                            color={line.debit > 0 ? 'text.primary' : 'text.disabled'}
                          >
                            {line.debit > 0 ? fCurrency(line.debit) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={line.credit > 0 ? 600 : 400}
                            color={line.credit > 0 ? 'text.primary' : 'text.disabled'}
                          >
                            {line.credit > 0 ? fCurrency(line.credit) : '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Totales */}
                    <TableRow sx={{ bgcolor: 'background.neutral' }}>
                      <TableCell colSpan={3}>
                        <Typography variant="subtitle2">TOTALES</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" color="info.main">
                          {fCurrency(entry.total_debit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" color="success.main">
                          {fCurrency(entry.total_credit)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Validación de balance */}
              {entry.total_debit === entry.total_credit ? (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 2, p: 1.5, bgcolor: 'success.lighter', borderRadius: 1 }}
                >
                  <Icon icon="solar:check-circle-bold" width={20} color="success.main" />
                  <Typography variant="body2" color="success.darker">
                    Asiento balanceado correctamente
                  </Typography>
                </Stack>
              ) : (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 2, p: 1.5, bgcolor: 'error.lighter', borderRadius: 1 }}
                >
                  <Icon icon="solar:danger-circle-bold" width={20} color="error.main" />
                  <Typography variant="body2" color="error.darker">
                    Advertencia: El asiento no está balanceado
                  </Typography>
                </Stack>
              )}
            </Box>

            <Divider />

            {/* Información adicional */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Creado: {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
              </Typography>
            </Box>
          </Stack>
        )}

        {!isLoading && !entry && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No se pudo cargar la información del asiento
          </Typography>
        )}
      </Box>
    </Drawer>
  );
}
