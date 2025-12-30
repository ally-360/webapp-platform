import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
// @mui
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
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
import { Tooltip } from '@mui/material';
import BillPDF from './bill-pdf';
import BillPaymentDialog from './bill-payment-dialog';

// ----------------------------------------------------------------------

export default function BillTableRow({ row, selected, onSelectRow, onViewRow, onEditRow, onDeleteRow }) {
  const { number, issue_date, due_date, status, supplier, total_amount, paid_amount } = row;

  // Calculate balance due
  const balance_due = parseFloat(total_amount || '0') - parseFloat(paid_amount || '0');

  const confirm = useBoolean(false);
  const paymentDialog = useBoolean(false);
  const popover = usePopover();
  const { enqueueSnackbar } = useSnackbar();
  const [isSending, setIsSending] = useState(false);

  const canAddPayment = (status === 'OPEN' || status === 'PARTIAL') && balance_due > 0;

  const handleDownloadPdf = useCallback(async () => {
    try {
      const blob = await pdf(<BillPDF bill={row} currentStatus={status} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-compra-${number}.pdf`;
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
      // Generar el PDF como blob
      const pdfBlob = await pdf(<BillPDF bill={row} currentStatus={status} />).toBlob();

      const formData = new FormData();
      formData.append('to_email', supplier?.email || '');
      formData.append('subject', `Factura de Compra ${number}`);
      formData.append('message', 'Estimado proveedor, adjunto encontrará la factura de compra. Gracias.');
      formData.append('pdf_file', pdfBlob, `factura-compra-${number}.pdf`);

      // Usar fetch directamente para enviar FormData
      const token = localStorage.getItem('accessToken');
      const companyId = localStorage.getItem('companyId');

      const response = await fetch(`${HOST_API}/bills/${row.id}/send-email`, {
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
  }, [row, status, supplier?.email, number, enqueueSnackbar]);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        {/* mostrar al hacer hover el texto completo */}
        <TableCell>
          <Tooltip title={number}>
            <Typography
              sx={{
                maxWidth: 100,
                // dejar el texto en una linea pero mostrar ..
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'default',
                userSelect: 'none'
              }}
              variant="body2"
            >
              {number}
            </Typography>
          </Tooltip>
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          {/* <Avatar alt={supplier?.name || 'Proveedor'} sx={{ mr: 2 }}>
            {(supplier?.name || 'P').charAt(0).toUpperCase()}
          </Avatar> */}

          <ListItemText
            disableTypography
            primary={
              <Typography variant="body2" noWrap>
                {supplier?.name || 'Sin proveedor'}
              </Typography>
            }
            secondary={
              <Link noWrap variant="body2" onClick={onViewRow} sx={{ color: 'text.disabled', cursor: 'pointer' }}>
                {supplier?.email || number}
              </Link>
            }
          />
        </TableCell>

        <TableCell>
          <ListItemText
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
        <TableCell>{fCurrency(parseFloat(String(balance_due)))}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'paid' && 'success') ||
              (status === 'open' && 'info') ||
              (status === 'draft' && 'warning') ||
              (status === 'void' && 'error') ||
              'default'
            }
          >
            {status === 'paid' && 'Pagada'}
            {status === 'open' && 'Abierta'}
            {status === 'draft' && 'Borrador'}
            {status === 'void' && 'Anulada'}
            {status === 'partial' && 'Parcial'}
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
          disabled={isSending || !supplier?.email}
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
          Anular
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Anular Factura"
        content={
          <>
            ¿Está seguro de que desea anular esta factura?
            <br />
            <br />
            Las facturas anuladas no se pueden revertir y cambiarán su estado a VOID.
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Anular Factura
          </Button>
        }
      />

      <BillPaymentDialog open={paymentDialog.value} onClose={paymentDialog.onFalse} bill={row} />
    </>
  );
}

BillTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool
};
