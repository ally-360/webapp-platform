import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
// @mui
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { HOST_API } from 'src/config-global';
import CircularProgress from '@mui/material/CircularProgress';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
//
import InvoicePDF from './invoice-pdf';
import InvoicePaymentDialog from './invoice-payment-dialog';

// ----------------------------------------------------------------------

export default function InvoiceTableRow({ row, selected, onSelectRow, onViewRow, onEditRow, onDeleteRow }) {
  const {
    number,
    issue_date,
    due_date,
    status,
    customer_id,
    customer_email,
    customer_name,
    total_amount,
    paid_amount,
    balance_due
  } = row;

  const confirm = useBoolean(false);
  const paymentDialog = useBoolean(false);
  const popover = usePopover();
  const { enqueueSnackbar } = useSnackbar();
  const [isSending, setIsSending] = useState(false);

  const canAddPayment = status === 'OPEN' && parseFloat(balance_due || '0') > 0;

  const handleDownloadPdf = useCallback(async () => {
    try {
      const blob = await pdf(<InvoicePDF invoice={row} currentStatus={status} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      enqueueSnackbar('PDF descargado exitosamente', { variant: 'success' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      enqueueSnackbar('Error al descargar el PDF', { variant: 'error' });
    }
  }, [row, status, number, enqueueSnackbar]);

  const handleSendEmail = useCallback(async () => {
    setIsSending(true);
    try {
      const pdfBlob = await pdf(<InvoicePDF invoice={row} currentStatus={status} />).toBlob();

      const formData = new FormData();
      formData.append('to_email', customer_email || '');
      formData.append('subject', `Factura ${number}`);
      formData.append('message', 'Estimado cliente, adjunto encontrará su factura. Gracias por su compra.');
      formData.append('pdf_file', pdfBlob, `factura-${number}.pdf`);

      const token = localStorage.getItem('accessToken');
      const companyId = localStorage.getItem('companyId');

      const response = await fetch(`${HOST_API}/invoices/${row.id}/send-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Company-ID': companyId || ''
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al enviar el email');
      }

      enqueueSnackbar('Email con PDF enviado exitosamente', { variant: 'success' });
    } catch (error) {
      console.error('Error sending email:', error);
      enqueueSnackbar('Error al enviar el email con PDF', { variant: 'error' });
    } finally {
      setIsSending(false);
    }
  }, [row, status, customer_email, number, enqueueSnackbar, setIsSending]);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Typography
            onClick={onViewRow}
            sx={{
              cursor: 'pointer',
              color: 'text.primary',
              ':hover': { color: 'text.secondary', textDecoration: 'underline' }
            }}
            variant="body2"
            noWrap
          >
            {number}
          </Typography>
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={customer_name || 'Cliente'} sx={{ mr: 2 }}>
            {(customer_name || 'C').charAt(0).toUpperCase()}
          </Avatar>

          <ListItemText
            disableTypography
            primary={
              <Typography variant="body2" noWrap>
                {customer_name || 'Sin cliente'}
              </Typography>
            }
            secondary={
              <Link noWrap variant="body2" sx={{ color: 'text.disabled', cursor: 'pointer' }}>
                {customer_email || number}
              </Link>
            }
          />
        </TableCell>

        <TableCell>
          <ListItemText
            onClick={onViewRow}
            primary={format(new Date(issue_date), 'dd MMM yyyy')}
            secondary={format(new Date(issue_date), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption'
            }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={format(new Date(due_date), 'dd MMM yyyy')}
            secondary={format(new Date(due_date), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption'
            }}
          />
        </TableCell>

        <TableCell>{fCurrency(parseFloat(total_amount))}</TableCell>
        {/* Pagado */}
        <TableCell>{fCurrency(parseFloat(paid_amount))}</TableCell>
        {/* Por pagar */}
        <TableCell>{fCurrency(parseFloat(balance_due))}</TableCell>

        {/* <TableCell align="center">{sent}</TableCell> */}

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'PAID' && 'success') ||
              (status === 'OPEN' && 'info') ||
              (status === 'DRAFT' && 'warning') ||
              (status === 'VOID' && 'error') ||
              'default'
            }
          >
            {status === 'PAID' && 'Pagada'}
            {status === 'OPEN' && 'Abierta'}
            {status === 'DRAFT' && 'Borrador'}
            {status === 'VOID' && 'Cancelada'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
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

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Editar
        </MenuItem>

        {canAddPayment && (
          <MenuItem
            onClick={() => {
              paymentDialog.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:wallet-money-bold" />
            Registrar Pago
          </MenuItem>
        )}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            handleDownloadPdf();
            popover.onClose();
          }}
        >
          <Iconify icon="eva:cloud-download-fill" />
          Descargar PDF
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleSendEmail();
            popover.onClose();
          }}
          disabled={isSending || !customer_email}
        >
          {isSending ? <CircularProgress size={16} /> : <Iconify icon="iconamoon:send-fill" />}
          Enviar Email
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Cancelar
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Cancelar Factura"
        content={
          <>
            ¿Está seguro de que desea cancelar esta factura?
            <br />
            <br />
            Las facturas canceladas no se pueden revertir y cambiarán su estado a CANCELLED.
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Cancelar Factura
          </Button>
        }
      />

      <InvoicePaymentDialog open={paymentDialog.value} onClose={paymentDialog.onFalse} invoice={row} />
    </>
  );
}

InvoiceTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool
};
