/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
// @mui
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import Chip from '@mui/material/Chip';
// types
import type { Quote } from 'src/types/quotes';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  row: Quote;
  customerName?: string;
  selected: boolean;
  onSelectRow: VoidFunction;
  onViewRow: VoidFunction;
  onEditRow?: VoidFunction;
  onSend?: VoidFunction;
  onAccept?: VoidFunction;
  onReject?: VoidFunction;
  onExpire?: VoidFunction;
  onClone?: VoidFunction;
  onConvertToInvoice?: VoidFunction;
  onViewInvoice?: VoidFunction;
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  expired: 'Vencida',
  converted: 'Convertida'
};

const STATUS_COLORS: Record<string, 'default' | 'info' | 'success' | 'error' | 'warning' | 'primary' | 'secondary'> = {
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  expired: 'warning',
  converted: 'primary'
};

// ----------------------------------------------------------------------

export default function QuotesTableRow({
  row,
  customerName,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onSend,
  onAccept,
  onReject,
  onExpire,
  onClone,
  onConvertToInvoice,
  onViewInvoice
}: Props) {
  const { quote_number, issue_date, expiration_date, status, total_amount, converted_to_invoice_id, id } = row;

  const popover = usePopover();

  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || 'default';

  const isExpired = isPast(new Date(expiration_date)) && status !== 'converted' && status !== 'expired';
  const isConverted = status === 'converted' || !!converted_to_invoice_id;

  const canEdit = status === 'draft';
  const canSend = status === 'draft';
  const canAccept = status === 'sent';
  const canReject = status === 'sent';
  const canExpire = status === 'sent';
  const canConvert = status === 'accepted';
  const canClone = true; // Cualquier estado permite clonar

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
            primary={(quote_number || id.substring(0, 8)).toUpperCase()}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 600 }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={customerName || 'Sin cliente'}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={format(new Date(issue_date), 'dd MMM yyyy', { locale: es })}
            primaryTypographyProps={{ typography: 'body2' }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={format(new Date(expiration_date), 'dd MMM yyyy', { locale: es })}
            secondary={isExpired ? 'Vencida' : undefined}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              typography: 'caption',
              color: 'error.main',
              fontWeight: 600
            }}
          />
        </TableCell>

        <TableCell>
          <Label variant="soft" color={statusColor}>
            {statusLabel}
          </Label>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={fCurrency(parseFloat(total_amount))}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 600 }}
          />
        </TableCell>

        <TableCell>
          <Chip
            label={isConverted ? 'Sí' : 'No'}
            size="small"
            color={isConverted ? 'success' : 'default'}
            variant="outlined"
          />
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 180 }}>
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Ver
        </MenuItem>

        {canEdit && onEditRow && (
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

        {canSend && onSend && (
          <MenuItem
            onClick={() => {
              onSend();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:paperclip-bold" />
            Enviar
          </MenuItem>
        )}

        {canAccept && onAccept && (
          <MenuItem
            onClick={() => {
              onAccept();
              popover.onClose();
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="solar:check-circle-bold" />
            Aceptar
          </MenuItem>
        )}

        {canReject && onReject && (
          <MenuItem
            onClick={() => {
              onReject();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:close-circle-bold" />
            Rechazar
          </MenuItem>
        )}

        {canExpire && onExpire && (
          <MenuItem
            onClick={() => {
              onExpire();
              popover.onClose();
            }}
            sx={{ color: 'warning.main' }}
          >
            <Iconify icon="solar:clock-circle-bold" />
            Expirar
          </MenuItem>
        )}

        {canConvert && onConvertToInvoice && (
          <MenuItem
            onClick={() => {
              onConvertToInvoice();
              popover.onClose();
            }}
            sx={{ color: 'primary.main' }}
          >
            <Iconify icon="solar:document-add-bold" />
            Convertir a Factura
          </MenuItem>
        )}

        {isConverted && onViewInvoice && (
          <MenuItem
            onClick={() => {
              onViewInvoice();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:bill-list-bold" />
            Ver Factura
          </MenuItem>
        )}

        {canClone && onClone && (
          <MenuItem
            onClick={() => {
              onClone();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:copy-bold" />
            Clonar
          </MenuItem>
        )}
      </CustomPopover>
    </>
  );
}
