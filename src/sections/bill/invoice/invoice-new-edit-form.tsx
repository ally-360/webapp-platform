import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import FormProvider from 'src/components/hook-form';
//
import { useNavigate } from 'react-router';
import { useCreateInvoiceMutation, useUpdateInvoiceMutation } from 'src/redux/services/invoicesApi';
import { enqueueSnackbar } from 'notistack';
import InvoiceNewEditDetails from './invoice-new-edit-details';
import InvoiceNewEditAddress from './invoice-new-edit-address';
import InvoiceNewEditStatusDate from './invoice-new-edit-status-date';
// ----------------------------------------------------------------------

export default function InvoiceNewEditForm({ currentInvoice }) {
  const router = useRouter();
  const navigate = useNavigate();
  const loadingSave = useBoolean(false);
  const loadingSend = useBoolean(false);

  const NewInvoiceSchema = Yup.object().shape({
    pdvId: Yup.string().required('El punto de venta es requerido'),
    invoiceNumber: Yup.string().required('El número de factura es requerido'),
    invoiceProvider: Yup.mixed().nullable().required('El cliente es requerido'),
    createDate: Yup.date().required('Fecha de creación es requerida'),
    dueDate: Yup.date().when('method', {
      is: 'Credito',
      then: (schema) => schema.required('La fecha de vencimiento es requerida'),
      otherwise: (schema) => schema.nullable()
    }),
    totalTaxes: Yup.number().default(0),
    status: Yup.string().default('draft'),
    method: Yup.string().default('Contado'),
    shipping: Yup.number().default(0),
    invoiceFrom: Yup.mixed().nullable(),
    totalAmount: Yup.number().default(0),
    paymentTerm: Yup.string().default(''),
    notes: Yup.string().default(''),
    items: Yup.array()
      .of(
        Yup.object().shape({
          title: Yup.object().required('El producto es requerido'),
          quantity: Yup.number().min(1, 'La cantidad debe ser mayor a 0').required('La cantidad es requerida'),
          price: Yup.number().min(0, 'El precio debe ser mayor o igual a 0').required('El precio es requerido')
        })
      )
      .min(1, 'Debe agregar al menos un producto')
  });

  const defaultValues = useMemo(
    () => ({
      pdvId: currentInvoice?.pdv_id || '',
      invoiceNumber: currentInvoice?.number || 'INV-1990',
      createDate: currentInvoice?.issue_date ? new Date(currentInvoice.issue_date) : new Date(),
      dueDate: currentInvoice?.due_date ? new Date(currentInvoice.due_date) : undefined,
      totalTaxes: currentInvoice?.taxes_total ? parseFloat(currentInvoice.taxes_total) : 0,
      shipping: 0,
      status: currentInvoice?.status || 'draft',
      method: 'Contado',
      paymentTerm: '',
      notes: currentInvoice?.notes || '',
      invoiceFrom: null,
      invoiceProvider: currentInvoice?.customer_id || null,
      items: currentInvoice?.items || [{ title: '', description: '', quantity: 1, price: 0, total: 0 }],
      totalAmount: currentInvoice?.total_amount ? parseFloat(currentInvoice.total_amount) : 0
    }),
    [currentInvoice]
  );

  const methods = useForm({
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  // RTK Query mutations
  const [createInvoice] = useCreateInvoiceMutation();
  const [updateInvoice] = useUpdateInvoiceMutation();

  // Helper function to transform form data to API format
  const transformFormDataToAPI = (data: any) => {
    const issueDate =
      data.createDate instanceof Date
        ? data.createDate.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    const dueDate = data.dueDate instanceof Date ? data.dueDate.toISOString().split('T')[0] : issueDate;

    return {
      pdv_id: data.pdvId,
      customer_id: data.invoiceProvider?.id || data.invoiceProvider,
      issue_date: issueDate,
      due_date: dueDate,
      notes: data.notes || '',
      status: data.status,
      items: data.items
        .filter((item: any) => item.title && item.title.id)
        .map((item: any) => ({
          product_id: item.title.id,
          quantity: item.quantity,
          unit_price: item.price
        }))
    };
  };

  const handleSaveAsDraft = handleSubmit(async (data) => {
    loadingSave.onTrue();

    try {
      const invoiceData = transformFormDataToAPI(data);
      invoiceData.status = 'draft';

      if (currentInvoice) {
        await updateInvoice({ id: currentInvoice.id, invoice: invoiceData }).unwrap();
        enqueueSnackbar('Factura actualizada exitosamente', { variant: 'success' });
      } else {
        await createInvoice(invoiceData).unwrap();
        enqueueSnackbar('Factura creada como borrador exitosamente', { variant: 'success' });
      }

      reset();
      loadingSave.onFalse();
      router.push(paths.dashboard.invoice.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error al guardar la factura', { variant: 'error' });
      loadingSave.onFalse();
    }
  });

  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();

    try {
      const invoiceData = transformFormDataToAPI(data);
      invoiceData.status = 'pending';

      if (currentInvoice) {
        await updateInvoice({ id: currentInvoice.id, invoice: invoiceData }).unwrap();
        enqueueSnackbar('Factura actualizada exitosamente', { variant: 'success' });
      } else {
        await createInvoice(invoiceData).unwrap();
        enqueueSnackbar('Factura creada exitosamente', { variant: 'success' });
      }

      reset();
      loadingSend.onFalse();
      router.push(paths.dashboard.invoice.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error al crear la factura', { variant: 'error' });
      loadingSend.onFalse();
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={handleCreateAndSend}>
      <Card>
        <InvoiceNewEditAddress />

        <InvoiceNewEditStatusDate />

        <InvoiceNewEditDetails />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          color="error"
          size="large"
          variant="outlined"
          onClick={() => {
            navigate(-1);
          }}
        >
          Cancelar
        </LoadingButton>
        <LoadingButton
          color="primary"
          size="large"
          variant="outlined"
          loading={loadingSave.value && isSubmitting}
          onClick={handleSaveAsDraft}
        >
          Guardar cotización
        </LoadingButton>

        <LoadingButton size="large" color="primary" variant="contained" loading={loadingSend.value && isSubmitting}>
          {currentInvoice ? 'Guardar' : 'Crear factura'}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

InvoiceNewEditForm.propTypes = {
  currentInvoice: PropTypes.object
};
