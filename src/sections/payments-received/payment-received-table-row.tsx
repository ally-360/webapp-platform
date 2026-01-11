/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format} from 'date-fns';
import { es } from 'date-fns/locale';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fCurrency } from 'src/utils/format-number';
// types
import { PaymentReceived } from 'src/types/payment-received';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: PaymentReceived;
  selected: boolean;
  onSelectRow: VoidFunction;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onVoidRow: VoidFunction;
  onSendEmail: VoidFunction;
  onPrint: VoidFunction;
};

export default function PaymentReceivedTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onVoidRow,
  onSendEmail,
  onPrint
}: Props) {
  const { id, payment_date, customer_name, amount, method, invoice_id, invoice_number, is_voided } = row;

  const confirm = useBoolean(false);
  const confirmVoid = useBoolean(false);
  const popover = usePopover();

  const isVoided = is_voided;
  const hasInvoice = !!invoice_id;
  const amountValue = typeof amount === 'string' ? parseFloat(amount) : amount;

  const getPaymentMethodLabel = (m: string) => {
    const labels = {
      CASH: 'Efectivo',
      TRANSFER: 'Transferencia',
      CARD: 'Tarjeta',
      OTHER: 'Otro'
    };
    return labels[m as keyof typeof labels] || m;
  };

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} disabled={isVoided} />
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={customer_name}
            sx={{ mr: 2, width: 40, height: 40, bgcolor: 'primary.lighter', color: 'primary.main' }}
          >
            {customer_name?.[0]?.toUpperCase()}
          </Avatar>

          <ListItemText
            primary={customer_name}
            secondary={id.slice(0, 8)}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled'
            }}
          />
        </Box>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={format(new Date(payment_date), 'dd MMM yyyy', { locale: es })}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={isVoided ? 'error' : 'success'}>
          {isVoided ? 'Anulado' : 'Activo'}
        </Label>
      </TableCell>

      <TableCell>{getPaymentMethodLabel(method)}</TableCell>

      <TableCell>{fCurrency(amountValue)}</TableCell>

      <TableCell>
        {hasInvoice ? (
          <Chip
            label={invoice_number || 'Factura'}
            size="small"
            color="info"
            variant="outlined"
            icon={<Iconify icon="solar:document-text-bold" />}
          />
        ) : (
          <Chip label="Pago libre" size="small" color="default" variant="outlined" />
        )}
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

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

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
          disabled={isVoided}
        >
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>

        <MenuItem
          onClick={() => {
            onPrint();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Imprimir
        </MenuItem>

        <MenuItem
          onClick={() => {
            onSendEmail();
            popover.onClose();
          }}
          disabled={isVoided}
        >
          <Iconify icon="fluent:mail-24-filled" />
          Enviar email
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirmVoid.onTrue();
            popover.onClose();
          }}
          disabled={isVoided}
          sx={{ color: 'warning.main' }}
        >
          <Iconify icon="solar:close-circle-bold" />
          Anular
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          disabled={isVoided}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Eliminar
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content="¿Está seguro de eliminar este pago recibido?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Eliminar
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmVoid.value}
        onClose={confirmVoid.onFalse}
        title="Anular pago"
        content="¿Está seguro de anular este pago recibido? Esta acción no se puede deshacer."
        action={
          <Button variant="contained" color="warning" onClick={onVoidRow}>
            Anular
          </Button>
        }
      />
    </>
  );
}
