import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { format } from 'date-fns';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// redux
import {
  useSendQuoteMutation,
  useAcceptQuoteMutation,
  useRejectQuoteMutation,
  useExpireQuoteMutation,
  useConvertToInvoiceMutation,
  useCloneQuoteMutation
} from 'src/redux/services/quotesApi';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function QuotesToolbar({ quote }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const popover = usePopover();

  const sendDialog = useBoolean(false);
  const acceptDialog = useBoolean(false);
  const rejectDialog = useBoolean(false);
  const expireDialog = useBoolean(false);
  const convertDialog = useBoolean(false);
  const cloneDialog = useBoolean(false);

  const [sendQuote, { isLoading: isSending }] = useSendQuoteMutation();
  const [acceptQuote, { isLoading: isAccepting }] = useAcceptQuoteMutation();
  const [rejectQuote, { isLoading: isRejecting }] = useRejectQuoteMutation();
  const [expireQuote, { isLoading: isExpiring }] = useExpireQuoteMutation();
  const [convertToInvoice, { isLoading: isConverting }] = useConvertToInvoiceMutation();
  const [cloneQuote, { isLoading: isCloning }] = useCloneQuoteMutation();

  const canEdit = quote.status === 'draft';
  const canSend = quote.status === 'draft';
  const canAccept = quote.status === 'sent';
  const canReject = quote.status === 'sent';
  const canExpire = quote.status === 'sent';
  const canConvert = (quote.status === 'sent' || quote.status === 'accepted') && !quote.converted_to_invoice_id;
  const canViewInvoice = !!quote.converted_to_invoice_id;

  const handleEdit = useCallback(() => {
    router.push(paths.dashboard.sales.quotes.edit(quote.id));
  }, [quote.id, router]);

  const handleSend = useCallback(async () => {
    try {
      await sendQuote(quote.id).unwrap();
      enqueueSnackbar('Cotización enviada', { variant: 'success' });
      sendDialog.onFalse();
    } catch (error) {
      console.error('Error sending quote:', error);
      const message = error?.data?.detail || 'Error al enviar cotización';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [quote.id, sendQuote, enqueueSnackbar, sendDialog]);

  const handleAccept = useCallback(async () => {
    try {
      await acceptQuote(quote.id).unwrap();
      enqueueSnackbar('Cotización aceptada', { variant: 'success' });
      acceptDialog.onFalse();
    } catch (error) {
      console.error('Error accepting quote:', error);
      const message = error?.data?.detail || 'Error al aceptar cotización';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [quote.id, acceptQuote, enqueueSnackbar, acceptDialog]);

  const handleReject = useCallback(async () => {
    try {
      await rejectQuote(quote.id).unwrap();
      enqueueSnackbar('Cotización rechazada', { variant: 'success' });
      rejectDialog.onFalse();
    } catch (error) {
      console.error('Error rejecting quote:', error);
      const message = error?.data?.detail || 'Error al rechazar cotización';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [quote.id, rejectQuote, enqueueSnackbar, rejectDialog]);

  const handleExpire = useCallback(async () => {
    try {
      await expireQuote(quote.id).unwrap();
      enqueueSnackbar('Cotización marcada como vencida', { variant: 'success' });
      expireDialog.onFalse();
    } catch (error) {
      console.error('Error expiring quote:', error);
      const message = error?.data?.detail || 'Error al marcar cotización como vencida';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [quote.id, expireQuote, enqueueSnackbar, expireDialog]);

  const handleConvert = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const result = await convertToInvoice({
        id: quote.id,
        body: {
          invoice_type: 'SALE',
          issue_date: today,
          due_date: today,
          notes: ''
        }
      }).unwrap();

      enqueueSnackbar('Cotización convertida a factura exitosamente', { variant: 'success' });
      convertDialog.onFalse();

      if (result?.id) {
        router.push(paths.dashboard.sales.details(result.id));
      }
    } catch (error) {
      console.error('Error converting quote:', error);
      const message = error?.data?.detail || 'Error al convertir cotización';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [quote.id, convertToInvoice, enqueueSnackbar, convertDialog, router]);

  const handleClone = useCallback(async () => {
    try {
      const result = await cloneQuote(quote.id).unwrap();
      enqueueSnackbar('Cotización clonada exitosamente', { variant: 'success' });
      cloneDialog.onFalse();

      if (result?.id) {
        router.push(paths.dashboard.sales.quotes.edit(result.id));
      }
    } catch (error) {
      console.error('Error cloning quote:', error);
      const message = error?.data?.detail || 'Error al clonar cotización';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [quote.id, cloneQuote, enqueueSnackbar, cloneDialog, router]);

  const handleViewInvoice = useCallback(() => {
    if (quote.converted_to_invoice_id) {
      router.push(paths.dashboard.sales.details(quote.converted_to_invoice_id));
    }
  }, [quote.converted_to_invoice_id, router]);

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      >
        <Stack direction="row" spacing={1} flexGrow={1} sx={{ width: 1 }}>
          <Tooltip title="Volver">
            <IconButton onClick={() => router.back()}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack
          flexShrink={0}
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          spacing={1}
          sx={{ width: { xs: 1, md: 'auto' } }}
        >
          {canEdit && (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={handleEdit}
            >
              Editar
            </Button>
          )}

          {canSend && (
            <Button
              color="primary"
              variant="contained"
              startIcon={<Iconify icon="solar:paperclip-bold" />}
              onClick={sendDialog.onTrue}
            >
              Enviar
            </Button>
          )}

          {canAccept && (
            <Button
              color="success"
              variant="contained"
              startIcon={<Iconify icon="solar:check-circle-bold" />}
              onClick={acceptDialog.onTrue}
            >
              Aceptar
            </Button>
          )}

          {canConvert && (
            <Button
              color="primary"
              variant="contained"
              startIcon={<Iconify icon="solar:document-add-bold" />}
              onClick={convertDialog.onTrue}
            >
              Convertir a Factura
            </Button>
          )}

          {canViewInvoice && (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<Iconify icon="solar:bill-list-bold" />}
              onClick={handleViewInvoice}
            >
              Ver Factura
            </Button>
          )}

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 180 }}>
        {canReject && (
          <MenuItem
            onClick={() => {
              popover.onClose();
              rejectDialog.onTrue();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:close-circle-bold" />
            Rechazar
          </MenuItem>
        )}

        {canExpire && (
          <MenuItem
            onClick={() => {
              popover.onClose();
              expireDialog.onTrue();
            }}
            sx={{ color: 'warning.main' }}
          >
            <Iconify icon="solar:clock-circle-bold" />
            Expirar
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            popover.onClose();
            cloneDialog.onTrue();
          }}
        >
          <Iconify icon="solar:copy-bold" />
          Clonar
        </MenuItem>
      </CustomPopover>

      {/* Send Dialog */}
      <ConfirmDialog
        open={sendDialog.value}
        onClose={sendDialog.onFalse}
        title="Enviar Cotización"
        content="¿Está seguro de enviar esta cotización al cliente?"
        action={
          <Button variant="contained" color="primary" onClick={handleSend} disabled={isSending}>
            {isSending ? 'Enviando...' : 'Enviar'}
          </Button>
        }
      />

      {/* Accept Dialog */}
      <ConfirmDialog
        open={acceptDialog.value}
        onClose={acceptDialog.onFalse}
        title="Aceptar Cotización"
        content="¿Confirma que esta cotización fue aceptada por el cliente?"
        action={
          <Button variant="contained" color="success" onClick={handleAccept} disabled={isAccepting}>
            {isAccepting ? 'Aceptando...' : 'Aceptar'}
          </Button>
        }
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        open={rejectDialog.value}
        onClose={rejectDialog.onFalse}
        title="Rechazar Cotización"
        content="¿Confirma que esta cotización fue rechazada por el cliente?"
        action={
          <Button variant="contained" color="error" onClick={handleReject} disabled={isRejecting}>
            {isRejecting ? 'Rechazando...' : 'Rechazar'}
          </Button>
        }
      />

      {/* Expire Dialog */}
      <ConfirmDialog
        open={expireDialog.value}
        onClose={expireDialog.onFalse}
        title="Expirar Cotización"
        content="¿Desea marcar esta cotización como vencida?"
        action={
          <Button variant="contained" color="warning" onClick={handleExpire} disabled={isExpiring}>
            {isExpiring ? 'Expirando...' : 'Expirar'}
          </Button>
        }
      />

      {/* Convert Dialog */}
      <ConfirmDialog
        open={convertDialog.value}
        onClose={convertDialog.onFalse}
        title="Convertir a Factura"
        content="¿Está seguro de convertir esta cotización en una factura? Esta acción no se puede deshacer."
        action={
          <Button variant="contained" color="primary" onClick={handleConvert} disabled={isConverting}>
            {isConverting ? 'Convirtiendo...' : 'Convertir'}
          </Button>
        }
      />

      {/* Clone Dialog */}
      <ConfirmDialog
        open={cloneDialog.value}
        onClose={cloneDialog.onFalse}
        title="Clonar Cotización"
        content="Se creará una copia de esta cotización en estado borrador. ¿Desea continuar?"
        action={
          <Button variant="contained" color="primary" onClick={handleClone} disabled={isCloning}>
            {isCloning ? 'Clonando...' : 'Clonar'}
          </Button>
        }
      />
    </>
  );
}

QuotesToolbar.propTypes = {
  quote: PropTypes.object
};
