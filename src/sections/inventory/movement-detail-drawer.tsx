import { Drawer, Stack, Typography, IconButton, Divider, Box, Chip, Button, Tooltip, Alert } from '@mui/material';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { fCurrency } from 'src/utils/format-number';
import type { InventoryMovement } from 'src/types/inventory-movements';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  movement: InventoryMovement | null;
};

export default function MovementDetailDrawer({ open, onClose, movement }: Props) {
  if (!movement) return null;

  const isInflow = movement.movement_type === 'IN';

  const handleViewJournalEntry = () => {
    // TODO: Implement when GET /movements/{id}/journal-entry is ready
    console.log('View journal entry for movement:', movement.id);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: 1, sm: 480 } },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
        <Typography variant="h6">Detalle del Movimiento</Typography>
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <Divider />

      <Scrollbar sx={{ p: 2.5 }}>
        <Stack spacing={3}>
          {/* Movement Type Badge */}
          <Box>
            <Chip
              label={isInflow ? 'Entrada' : 'Salida'}
              color={isInflow ? 'success' : 'error'}
              icon={<Iconify icon={isInflow ? 'solar:arrow-down-bold' : 'solar:arrow-up-bold'} />}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {/* Product Info */}
          <Box>
            <Typography variant="overline" color="text.secondary" gutterBottom>
              Producto
            </Typography>
            <Typography variant="h6">{movement.product_name}</Typography>
            {movement.product_sku && (
              <Typography variant="body2" color="text.secondary">
                SKU: {movement.product_sku}
              </Typography>
            )}
          </Box>

          {/* PDV */}
          <Box>
            <Typography variant="overline" color="text.secondary" gutterBottom>
              Punto de Venta
            </Typography>
            <Typography variant="body1">{movement.pdv_name}</Typography>
          </Box>

          {/* Quantity */}
          <Box>
            <Typography variant="overline" color="text.secondary" gutterBottom>
              Cantidad
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: movement.quantity > 0 ? 'success.main' : 'error.main',
              }}
            >
              {movement.quantity > 0 ? '+' : ''}
              {movement.quantity}
            </Typography>
          </Box>

          <Divider />

          {/* Reference */}
          {movement.reference && (
            <Box>
              <Typography variant="overline" color="text.secondary" gutterBottom>
                Referencia
              </Typography>
              <Typography variant="body2">{movement.reference}</Typography>
            </Box>
          )}

          {/* Notes */}
          {movement.notes && (
            <Box>
              <Typography variant="overline" color="text.secondary" gutterBottom>
                Notas
              </Typography>
              <Typography variant="body2">{movement.notes}</Typography>
            </Box>
          )}

          <Divider />

          {/* Created By */}
          <Box>
            <Typography variant="overline" color="text.secondary" gutterBottom>
              Registrado por
            </Typography>
            <Typography variant="body2">
              {movement.created_by_email || movement.created_by || 'Sistema'}
            </Typography>
          </Box>

          {/* Created At */}
          <Box>
            <Typography variant="overline" color="text.secondary" gutterBottom>
              Fecha de Registro
            </Typography>
            <Typography variant="body2">
              {format(new Date(movement.created_at), 'dd MMMM yyyy, HH:mm', {
                locale: es,
              })}
            </Typography>
          </Box>

          {/* Technical IDs */}
          <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                ID: {movement.id}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Product ID: {movement.product_id}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PDV ID: {movement.pdv_id}
              </Typography>
              {movement.variant_id && (
                <Typography variant="caption" color="text.secondary">
                  Variant ID: {movement.variant_id}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Action: View Journal Entry (TODO) */}
          {movement.journal_entry ? (
            <>
              <Divider />
              <Box>
                <Typography variant="overline" color="text.secondary" gutterBottom>
                  Asiento Contable
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">{movement.journal_entry.number}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {movement.journal_entry.description}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Débito
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {fCurrency(Number(movement.journal_entry.total_debit))}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Crédito
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {fCurrency(Number(movement.journal_entry.total_credit))}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Fecha:{' '}
                      {format(new Date(movement.journal_entry.entry_date), 'dd MMM yyyy', {
                        locale: es,
                      })}
                    </Typography>
                  </Stack>
                </Alert>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Iconify icon="solar:document-text-bold" />}
                  onClick={handleViewJournalEntry}
                >
                  Ver Detalles del Asiento
                </Button>
              </Box>
            </>
          ) : (
            <Tooltip title="Este movimiento no tiene asiento contable asociado">
              <span>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Iconify icon="solar:document-text-bold" />}
                  onClick={handleViewJournalEntry}
                  disabled
                >
                  Ver Asiento Contable
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
