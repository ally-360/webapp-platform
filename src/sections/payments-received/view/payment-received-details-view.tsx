import { useCallback } from 'react';
import { useParams } from 'react-router';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// utils
import { fDate, fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
// redux
import { useGetPaymentByIdQuery, useDeletePaymentMutation } from 'src/redux/services/paymentsReceivedApi';
//
import VoidPaymentDialog from '../void-payment-dialog';
import SendEmailDialog from '../send-email-dialog';
import AllocatePaymentDialog from '../allocate-payment-dialog';

// ----------------------------------------------------------------------

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
  OTHER: 'Otro'
};

// ----------------------------------------------------------------------

export default function PaymentReceivedDetailsView() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const voidDialog = useBoolean();
  const emailDialog = useBoolean();
  const allocateDialog = useBoolean();
  const deleteConfirm = useBoolean();

  const { data: payment, isLoading } = useGetPaymentByIdQuery(id!, {
    skip: !id
  });

  const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMutation();

  const handleDelete = useCallback(async () => {
    try {
      await deletePayment(id!).unwrap();
      enqueueSnackbar('Pago eliminado exitosamente', { variant: 'success' });
      router.push(paths.dashboard.paymentsReceived.root);
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      enqueueSnackbar(error?.data?.detail || 'Error al eliminar el pago', { variant: 'error' });
    }
  }, [deletePayment, id, enqueueSnackbar, router]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!payment) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Typography variant="h6" sx={{ mt: 5 }}>
          Pago no encontrado
        </Typography>
      </Container>
    );
  }

  const isVoided = payment.is_voided;
  const isAdvance = !payment.invoice_id;
  const hasInvoice = !!payment.invoice_id;

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={payment.payment_number}
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Pagos Recibidos', href: paths.dashboard.paymentsReceived.root },
            { name: payment.payment_number }
          ]}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:printer-bold" />}
                onClick={handlePrint}
              >
                Imprimir
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:letter-bold" />}
                onClick={emailDialog.onTrue}
                disabled={isVoided}
              >
                Enviar Email
              </Button>
            </Stack>
          }
          sx={{
            mb: { xs: 3, md: 5 }
          }}
        />

        <Grid container spacing={3}>
          {/* Información Principal */}
          <Grid xs={12} md={8}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h5">Información del Pago</Typography>
                <Label variant="soft" color={payment.is_voided ? 'error' : 'success'}>
                  {payment.is_voided ? 'Anulado' : 'Activo'}
                </Label>
              </Stack>

              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Número de Pago:
                  </Typography>
                  <Typography variant="subtitle2">{payment.payment_number}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Pago:
                  </Typography>
                  <Typography variant="subtitle2">{fDate(payment.payment_date)}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Monto:
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {fCurrency(typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Método de Pago:
                  </Typography>
                  <Typography variant="subtitle2">{PAYMENT_METHOD_LABELS[payment.method] || payment.method}</Typography>
                </Stack>

                {payment.reference && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Referencia:
                    </Typography>
                    <Typography variant="subtitle2">{payment.reference}</Typography>
                  </Stack>
                )}

                {payment.bank_account_id && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Cuenta Bancaria:
                    </Typography>
                    <Typography variant="subtitle2">{payment.bank_account_id}</Typography>
                  </Stack>
                )}

                {payment.notes && (
                  <>
                    <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Notas:
                      </Typography>
                      <Typography variant="body2">{payment.notes}</Typography>
                    </Stack>
                  </>
                )}

                {payment.voided_at && (
                  <>
                    <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="error">
                        Anulado el: {fDateTime(payment.voided_at)}
                      </Typography>
                      {payment.void_reason && (
                        <Typography variant="caption" color="text.secondary">
                          Motivo: {payment.void_reason}
                        </Typography>
                      )}
                    </Stack>
                  </>
                )}
              </Stack>
            </Card>

            {/* Factura Asociada */}
            {hasInvoice && payment.invoice_id && (
              <Card>
                <Stack sx={{ p: 3, pb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Factura Asociada
                  </Typography>

                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Factura:
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        component={RouterLink}
                        href={paths.dashboard.sales.details(payment.invoice_id)}
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {payment.invoice_id}
                      </Typography>
                    </Stack>

                    <Chip label="Pago aplicado a esta factura" color="success" size="small" variant="soft" />
                  </Stack>
                </Stack>
              </Card>
            )}

            {/* Pago Anticipado */}
            {isAdvance && (
              <Card sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Iconify icon="solar:wallet-money-bold" width={32} color="primary.main" />
                  <Stack>
                    <Typography variant="h6">Pago Anticipado</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Este pago no está asociado a ninguna factura
                    </Typography>
                  </Stack>
                </Stack>

                {!isVoided && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Iconify icon="solar:link-bold" />}
                    onClick={allocateDialog.onTrue}
                  >
                    Aplicar a Facturas
                  </Button>
                )}
              </Card>
            )}
          </Grid>

          {/* Sidebar - Cliente y Acciones */}
          <Grid xs={12} md={4}>
            {/* Cliente */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Cliente
              </Typography>

              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:user-bold" width={20} />
                  <Typography variant="subtitle2">{payment.customer_name}</Typography>
                </Stack>

                {payment.customer_email && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:letter-bold" width={20} />
                    <Typography variant="body2" color="text.secondary">
                      {payment.customer_email}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Card>

            {/* Acciones */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Acciones
              </Typography>

              <Stack spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  component={RouterLink}
                  href={paths.dashboard.paymentsReceived.edit(id!)}
                  disabled={isVoided}
                >
                  Editar
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  startIcon={<Iconify icon="solar:close-circle-bold" />}
                  onClick={voidDialog.onTrue}
                  disabled={isVoided}
                >
                  Anular Pago
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={deleteConfirm.onTrue}
                >
                  Eliminar
                </Button>
              </Stack>

              <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Creado: {fDateTime(payment.created_at)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Actualizado: {fDateTime(payment.updated_at)}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Dialogs */}
      <VoidPaymentDialog open={voidDialog.value} onClose={voidDialog.onFalse} paymentId={id!} />

      <SendEmailDialog
        open={emailDialog.value}
        onClose={emailDialog.onFalse}
        paymentId={id!}
        customerEmail={payment.customer_email}
      />

      {isAdvance && (
        <AllocatePaymentDialog
          open={allocateDialog.value}
          onClose={allocateDialog.onFalse}
          paymentId={id!}
          customerId={payment.customer_id}
          availableAmount={payment.amount}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.value}
        onClose={deleteConfirm.onFalse}
        title="Eliminar Pago"
        content={
          <>
            ¿Está seguro de eliminar el pago <strong>{payment.payment_number}</strong>?
            <br />
            <br />
            <Typography variant="caption" color="error">
              Esta acción es irreversible y puede afectar el estado de las facturas asociadas.
            </Typography>
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete();
              deleteConfirm.onFalse();
            }}
            disabled={isDeleting}
          >
            Eliminar
          </Button>
        }
      />
    </>
  );
}
