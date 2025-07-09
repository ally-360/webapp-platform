import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// _mock
import { _addressBooks } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import FormProvider from 'src/components/hook-form';
//
import { useNavigate } from 'react-router';
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
    invoiceProvider: Yup.mixed().nullable().required('El proveedor es requerido'),
    createDate: Yup.mixed().nullable().required('Fecha de creación es requerida '),
    dueDate: Yup.mixed().required('La fecha de vencimiento es requerida'),
    // not required
    totalTaxes: Yup.number(),
    status: Yup.string(),
    method: Yup.string(),
    shipping: Yup.number(),
    invoiceFrom: Yup.mixed(),
    totalAmount: Yup.number(),
    invoiceNumber: Yup.string(),

    paymentTerm: Yup.string().optional(),
    items: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required('El título es requerido'),
        description: Yup.string().required('La descripción es requerida'),
        quantity: Yup.number().required('La cantidad es requerida'),
        price: Yup.number().required('El precio es requerido'),
        total: Yup.number().required('El total es requerido'),
        tax: Yup.number().required('El impuesto es requerido')
      })
    )
  });

  const defaultValues = useMemo(
    () => ({
      invoiceNumber: currentInvoice?.invoiceNumber || 'INV-1990',
      createDate: currentInvoice?.createDate || new Date(),
      dueDate: currentInvoice?.dueDate || null,
      totalTaxes: currentInvoice?.totalTaxes || 0,
      shipping: currentInvoice?.shipping || 0,
      status: currentInvoice?.status || 'draft',
      method: currentInvoice?.method || 'Contado',
      paymentTerm: currentInvoice?.paymentTerm || '',
      invoiceFrom: currentInvoice?.invoiceFrom || _addressBooks[0],
      invoiceProvider: currentInvoice?.invoiceTo || null,
      items: currentInvoice?.items || [{ title: '', description: '', service: '', quantity: 1, price: 0, total: 0 }],
      totalAmount: currentInvoice?.totalAmount || 0
    }),
    [currentInvoice]
  );

  const methods = useForm({
    resolver: yupResolver(NewInvoiceSchema),
    defaultValues
  });

  const {
    reset,

    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const handleSaveAsDraft = handleSubmit(async (data) => {
    loadingSave.onTrue();

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      loadingSave.onFalse();
      router.push(paths.dashboard.invoice.root);
      console.info('DATA', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      loadingSave.onFalse();
    }
  });

  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      loadingSend.onFalse();
      router.push(paths.dashboard.invoice.root);
      console.info('DATA', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
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
