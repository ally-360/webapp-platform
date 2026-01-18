/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format} from 'date-fns';
import { es } from 'date-fns/locale';
// @mui
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// types
import type { PurchaseOrder } from 'src/redux/services/billsApi';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  row: PurchaseOrder;
  selected: boolean;
  onSelectRow: VoidFunction;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onVoidRow: VoidFunction;
};

const STATUS_LABELS = {
  draft: 'Borrador',
  sent: 'Enviada',
  approved: 'Aprobada',
  closed: 'Cerrada',
  void: 'Anulada'
};

const STATUS_COLORS = {
  draft: 'default',
  sent: 'info',
  approved: 'success',
  closed: 'warning',
  void: 'error'
} as const;

// ----------------------------------------------------------------------

export default function PurchaseOrderTableRow({ row, selected, onSelectRow, onViewRow, onEditRow, onVoidRow }: Props) {
  const { issue_date, supplier, total_amount, status, id, order_number } = row;

  const popover = usePopover();

  const supplierDisplay = supplier?.name || 'Sin proveedor';
  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || 'default';

  const canEdit = status === 'draft' || status === 'sent';
  const canVoid = status !== 'void' && status !== 'closed';

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={(order_number || id.substring(0, 8)).toUpperCase()}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 600 }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={format(new Date(issue_date), 'dd MMM yyyy', { locale: es })}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        <TableCell>
          <ListItemText primary={supplierDisplay} primaryTypographyProps={{ typography: 'body2', noWrap: true }} />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={fCurrency(parseFloat(total_amount))}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 600 }}
          />
        </TableCell>

        <TableCell>
          <Label variant="soft" color={statusColor}>
            {statusLabel}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 160 }}>
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Ver
        </MenuItem>

        {canEdit && (
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        )}

        {canVoid && (
          <MenuItem
            onClick={() => {
              onVoidRow();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Anular
          </MenuItem>
        )}
      </CustomPopover>
    </>
  );
}
