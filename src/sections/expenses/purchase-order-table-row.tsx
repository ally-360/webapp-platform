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
  pdvName?: string;
  selected: boolean;
  onSelectRow: VoidFunction;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onConvertRow: VoidFunction;
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

export default function PurchaseOrderTableRow({
  row,
  pdvName,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onConvertRow,
  onVoidRow
}: Props) {
  const { issue_date, expected_delivery_date, supplier_name, supplier, total_amount, status, id, order_number, pdv_id } = row;

  const popover = usePopover();

  const supplierDisplay = supplier_name || supplier?.name || 'Sin proveedor';
  const pdvDisplay = pdvName || row.pdv?.name || pdv_id || 'N/A';
  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || 'default';

  const canEdit = status === 'draft' || status === 'sent';
  const canConvert = status === 'sent' || status === 'approved';
  const canVoid = status !== 'void' && status !== 'closed';

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell
          onClick={onViewRow}
          sx={{ cursor: 'pointer', '&:hover .MuiTypography-root': { textDecoration: 'underline' } }}
        >
          <ListItemText
            primary={(order_number || id.substring(0, 8)).toUpperCase()}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 600 }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={format(new Date(issue_date), 'dd MMM yyyy', { locale: es })}
            secondary={
              expected_delivery_date
                ? `Entrega: ${format(new Date(expected_delivery_date), 'dd MMM yyyy', { locale: es })}`
                : undefined
            }
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ typography: 'caption', color: 'text.secondary', noWrap: true }}
          />
        </TableCell>

        <TableCell>
          <ListItemText primary={supplierDisplay} primaryTypographyProps={{ typography: 'body2', noWrap: true }} />
        </TableCell>

        <TableCell>
          <ListItemText primary={pdvDisplay} primaryTypographyProps={{ typography: 'body2', noWrap: true }} />
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

        {canConvert && (
          <MenuItem
            onClick={() => {
              onConvertRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:document-add-bold" />
            Convertir a Factura
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
