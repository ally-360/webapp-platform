import PropTypes from 'prop-types';
import { useCallback } from 'react';
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
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
//
import BillPDF from './bill-pdf';

// ----------------------------------------------------------------------

export default function BillToolbar({ invoice, currentStatus, statusOptions, onChangeStatus, onAddPayment }) {
  const router = useRouter();

  const view = useBoolean(false);

  const handleEdit = useCallback(() => {
    router.push(paths.dashboard.bill.edit(invoice?.id));
  }, [invoice?.id, router]);

  const handleDownloadPdf = useCallback(async () => {
    try {
      const blob = await pdf(<BillPDF bill={invoice} currentStatus={currentStatus} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-compra-${invoice?.number || 'N/A'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error downloading PDF:', error);
    }
  }, [invoice, currentStatus]);

  const canAddPayment =
    (currentStatus === 'OPEN' || currentStatus === 'partial') && parseFloat(invoice?.balance_due || '0') > 0;

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <Stack direction="row" spacing={1} flexGrow={1} sx={{ width: 1 }}>
          <Tooltip title="Editar">
            <IconButton onClick={handleEdit}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Ver PDF">
            <IconButton onClick={view.onTrue}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Descargar PDF">
            <IconButton onClick={handleDownloadPdf}>
              <Iconify icon="eva:cloud-download-fill" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Imprimir">
            <IconButton onClick={view.onTrue}>
              <Iconify icon="solar:printer-minimalistic-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Enviar Email">
            <IconButton>
              <Iconify icon="iconamoon:send-fill" />
            </IconButton>
          </Tooltip>

          {canAddPayment && onAddPayment && (
            <Tooltip title="Registrar Pago">
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:wallet-money-bold" />}
                onClick={onAddPayment}
                sx={{ ml: 2 }}
              >
                Registrar Pago
              </Button>
            </Tooltip>
          )}
        </Stack>

        <TextField
          fullWidth
          select
          label="Estado"
          value={currentStatus}
          onChange={onChangeStatus}
          disabled
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
              Cerrar
            </Button>
          </DialogActions>

          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <BillPDF bill={invoice} currentStatus={currentStatus} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

BillToolbar.propTypes = {
  currentStatus: PropTypes.string,
  invoice: PropTypes.object,
  onChangeStatus: PropTypes.func,
  onAddPayment: PropTypes.func,
  statusOptions: PropTypes.array
};
