import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
//
import InvoicePDF from './invoice-pdf';

// ----------------------------------------------------------------------

export default function InvoiceToolbar({ invoice, currentStatus, statusOptions, onChangeStatus, onAddPayment }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const view = useBoolean(false);
  const [isSending, setIsSending] = useState(false);

  const canAddPayment = invoice?.status === 'OPEN' && parseFloat(invoice?.balance_due || '0') > 0;

  const handleEdit = useCallback(() => {
    router.push(paths.dashboard.sales.edit(invoice.id));
  }, [invoice.id, router]);

  const handleDownloadPdf = useCallback(async () => {
    try {
      const blob = await pdf(<InvoicePDF invoice={invoice} currentStatus={currentStatus} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      enqueueSnackbar('PDF descargado exitosamente', { variant: 'success' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      enqueueSnackbar('Error al descargar el PDF', { variant: 'error' });
    }
  }, [invoice, currentStatus, enqueueSnackbar]);

  const handleSendEmail = useCallback(async () => {
    setIsSending(true);
    try {
      // Generar el PDF como blob
      const pdfBlob = await pdf(<InvoicePDF invoice={invoice} currentStatus={currentStatus} />).toBlob();

      // Crear FormData para enviar el PDF como adjunto
      const formData = new FormData();
      formData.append('to_email', invoice.customer?.email || '');
      formData.append('subject', `Factura ${invoice.number}`);
      formData.append('message', 'Estimado cliente, adjunto encontrará su factura. Gracias por su compra.');
      formData.append('pdf_file', pdfBlob, `factura-${invoice.number}.pdf`);

      // Usar fetch directamente para enviar FormData
      const token = localStorage.getItem('accessToken');
      const companyId = localStorage.getItem('companyId');

      const response = await fetch(`${HOST_API}/invoices/${invoice.id}/send-email`, {
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
  }, [invoice, currentStatus, enqueueSnackbar, setIsSending]);

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <Stack direction="row" spacing={1} flexGrow={1} sx={{ width: 1 }}>
          <Tooltip title="Edit">
            <IconButton onClick={handleEdit}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="View">
            <IconButton onClick={view.onTrue}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Descargar PDF">
            <IconButton onClick={handleDownloadPdf}>
              <Iconify icon="eva:cloud-download-fill" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Print">
            <IconButton>
              <Iconify icon="solar:printer-minimalistic-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Enviar por Email">
            <IconButton onClick={handleSendEmail} disabled={isSending || !invoice.customer?.email}>
              {isSending ? <CircularProgress size={24} color="inherit" /> : <Iconify icon="iconamoon:send-fill" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Share">
            <IconButton>
              <Iconify icon="solar:share-bold" />
            </IconButton>
          </Tooltip>

          {canAddPayment && (
            <Tooltip title="Registrar Pago">
              <IconButton onClick={onAddPayment} color="success">
                <Iconify icon="solar:wallet-money-bold" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {canAddPayment && (
          <Button
            variant="contained"
            color="success"
            startIcon={<Iconify icon="solar:wallet-money-bold" />}
            onClick={onAddPayment}
          >
            Registrar Pago
          </Button>
        )}

        <TextField
          fullWidth
          select
          label="Status"
          value={currentStatus}
          onChange={onChangeStatus}
          sx={{
            maxWidth: 160
          }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Dialog fullScreen open={view.value}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions
            sx={{
              p: 1.5
            }}
          >
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Close
            </Button>
          </DialogActions>

          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <InvoicePDF invoice={invoice} currentStatus={currentStatus} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

InvoiceToolbar.propTypes = {
  currentStatus: PropTypes.string,
  invoice: PropTypes.object,
  onChangeStatus: PropTypes.func,
  onAddPayment: PropTypes.func,
  statusOptions: PropTypes.array
};
