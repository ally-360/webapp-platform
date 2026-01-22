/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Chip,
  Stack,
  Typography,
  Skeleton,
  TableContainer,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { fNumber } from 'src/utils/format-number';
import type { InventoryMovement } from 'src/types/inventory-movements';

// ----------------------------------------------------------------------

type Props = {
  movements: InventoryMovement[];
  loading: boolean;
  onViewDetail: (movement: InventoryMovement) => void;
  onViewJournal: (movementId: string) => void;
};

export default function MovementsTable({ movements, loading, onViewDetail, onViewJournal }: Props) {
  if (loading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>PDV</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell>Referencia</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton width={60} />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
                <TableCell>
                  <Skeleton />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Scrollbar>
      <TableContainer sx={{ minWidth: 960 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>PDV</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell>Referencia</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id} hover>
                <TableCell>
                  <Stack>
                    <Typography variant="body2">
                      {format(new Date(movement.created_at), 'dd MMM yyyy', { locale: es })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(movement.created_at), 'HH:mm', { locale: es })}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={movement.movement_type}
                    color={movement.movement_type === 'IN' ? 'success' : 'error'}
                    icon={
                      <Iconify
                        icon={
                          movement.movement_type === 'IN'
                            ? 'eva:arrow-downward-fill'
                            : 'eva:arrow-upward-fill'
                        }
                      />
                    }
                  />
                </TableCell>

                <TableCell>
                  <Stack>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {movement.product_name}
                    </Typography>
                    {movement.product_sku && (
                      <Typography variant="caption" color="text.secondary">
                        SKU: {movement.product_sku}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                    {movement.pdv_name || '-'}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: movement.movement_type === 'IN' ? 'success.main' : 'error.main',
                    }}
                  >
                    {movement.movement_type === 'IN' ? '+' : '-'}
                    {fNumber(movement.quantity)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                    {movement.reference || '-'}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                    {movement.created_by_email || 'N/A'}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => onViewDetail(movement)}>
                    <Iconify icon="solar:eye-bold" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={!movement.journal_entry_id}
                    color={movement.journal_entry_id ? 'info' : 'default'}
                    sx={{ ml: 0.5 }}
                    onClick={() => onViewJournal(movement.id)}
                  >
                    <Iconify icon="solar:document-text-bold" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Scrollbar>
  );
}
