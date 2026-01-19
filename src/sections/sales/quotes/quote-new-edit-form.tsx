import PropTypes from 'prop-types';
import { useMemo, useEffect } from 'react';
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
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import FormProvider from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
// api
import { useCreateQuoteMutation, useUpdateQuoteMutation } from 'src/redux/services/quotesApi';
import type { QuoteDetail, CreateQuoteRequest } from 'src/types/quotes';
//
import QuoteNewEditAddress from './quote-new-edit-address';
import QuoteNewEditDetails from './quote-new-edit-details';

// ----------------------------------------------------------------------

interface QuoteNewEditFormProps {
  currentQuote?: QuoteDetail;
}

export default function QuoteNewEditForm({ currentQuote }: QuoteNewEditFormProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const loadingSave = useBoolean(false);
  const loadingSend = useBoolean(false);

  // RTK Query mutations
  const [createQuote] = useCreateQuoteMutation();
  const [updateQuote] = useUpdateQuoteMutation();

  const QuoteSchema = Yup.object().shape({
    customer: Yup.mixed().nullable().required('Cliente es requerido'),
    pdv_id: Yup.string().required('PDV es requerido'),
    seller_id: Yup.string().required('Vendedor es requerido'),
    issue_date: Yup.date().required('Fecha de emisión es requerida'),
    expiration_date: Yup.date()
      .required('Fecha de vencimiento es requerida')
      .min(Yup.ref('issue_date'), 'La fecha de vencimiento debe ser posterior o igual a la fecha de emisión'),
    notes: Yup.string(),
    items: Yup.array()
      .of(
        Yup.object().shape({
          product_id: Yup.string().required('Producto es requerido'),
          description: Yup.string(),
          quantity: Yup.number().min(1, 'La cantidad debe ser mayor a 0').required('Cantidad es requerida'),
          unit_price: Yup.number().min(0, 'El precio debe ser mayor o igual a 0').required('Precio es requerido'),
          discount_percent: Yup.number()
            .min(0, 'El descuento debe ser mayor o igual a 0')
            .max(100, 'El descuento no puede ser mayor a 100%')
            .default(0)
        })
      )
      .min(1, 'Debe agregar al menos un producto')
  });

  const defaultValues = useMemo(
    () => ({
      quote_number: currentQuote?.quote_number || '',
      customer: currentQuote?.customer || null,
      pdv_id: currentQuote?.pdv_id || '',
      seller_id: currentQuote?.seller_id || '',
      issue_date: currentQuote?.issue_date ? new Date(currentQuote.issue_date) : new Date(),
      expiration_date: currentQuote?.expiration_date
        ? new Date(currentQuote.expiration_date)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
      notes: currentQuote?.notes || '',
      currency: 'COP', // Fija en COP
      status: currentQuote?.status || 'draft',
      items: currentQuote?.line_items?.map((item) => ({
        product_id: item.product_id,
        description: '',
        quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity,
        unit_price: parseFloat(item.unit_price),
        discount_percent: 0,
        total:
          (typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity) * parseFloat(item.unit_price)
      })) || [
        {
          product_id: '',
          description: '',
          quantity: 1,
          unit_price: 0,
          discount_percent: 0,
          total: 0
        }
      ]
    }),
    [currentQuote]
  );

  const methods = useForm({
    resolver: yupResolver(QuoteSchema) as any,
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    if (currentQuote) {
      reset(defaultValues);
    }
  }, [currentQuote, defaultValues, reset]);

  // Helper function to format dates for API
  const formatDateForAPI = (date: Date | string): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const validateFormData = (data: any) => {
    const errors: string[] = [];

    if (!data.customer?.id) {
      errors.push('Debe seleccionar un cliente');
    }

    if (!data.pdv_id) {
      errors.push('Debe seleccionar un punto de venta');
    }

    if (!data.seller_id) {
      errors.push('Debe seleccionar un vendedor');
    }

    if (!data.items || data.items.length === 0) {
      errors.push('Debe agregar al menos un producto');
    }

    // Verificar productos válidos
    const invalidItems = data.items?.filter(
      (item) =>
        !item.product_id || !item.quantity || item.quantity <= 0 || item.unit_price === undefined || item.unit_price < 0
    );

    if (invalidItems?.length > 0) {
      errors.push('Todos los productos deben tener producto, cantidad válida y precio válido');
    }

    return errors;
  };

  const transformFormDataToApi = (data: any): CreateQuoteRequest => {
    console.log('🔍 Form data before transformation:', data);

    // Validar datos antes de transformar
    const validationErrors = validateFormData(data);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('. '));
    }

    const transformedData: CreateQuoteRequest = {
      customer_id: data.customer?.id?.toString() || '',
      pdv_id: data.pdv_id,
      seller_id: data.seller_id,
      issue_date: formatDateForAPI(data.issue_date),
      expiration_date: formatDateForAPI(data.expiration_date),
      currency: 'COP',
      notes: data.notes || undefined,
      line_items:
        data.items?.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })) || []
    };

    console.log('🚀 Transformed data for API:', transformedData);

    return transformedData;
  };

  const handleSaveAsDraft = handleSubmit(async (data) => {
    console.log('💾 Saving quote as draft with data:', data);
    loadingSave.onTrue();

    try {
      const quoteData = transformFormDataToApi(data);

      console.log('📤 Sending quote data:', quoteData);

      if (currentQuote) {
        const result = await updateQuote({ id: currentQuote.id, quote: quoteData }).unwrap();
        console.log('✅ Updated quote result:', result);
        enqueueSnackbar('Cotización actualizada correctamente', { variant: 'success' });
      } else {
        const result = await createQuote(quoteData).unwrap();
        console.log('✅ Created quote result:', result);
        enqueueSnackbar('Cotización guardada como borrador', { variant: 'success' });
      }

      reset();
      loadingSave.onFalse();
      router.push(paths.dashboard.sales.quotes.root);
    } catch (error) {
      console.error('❌ Error saving quote:', error);
      loadingSave.onFalse();

      const errorMessage =
        error?.data?.message || error?.data?.detail || error?.message || 'Error al guardar la cotización';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });

  const handleSendQuote = handleSubmit(async (data) => {
    console.log('📧 Sending quote with data:', data);
    loadingSend.onTrue();

    try {
      const quoteData = transformFormDataToApi(data);

      console.log('📤 Sending quote data:', quoteData);

      if (currentQuote) {
        const result = await updateQuote({ id: currentQuote.id, quote: quoteData }).unwrap();
        console.log('✅ Updated and sent quote result:', result);
        enqueueSnackbar('Cotización actualizada y enviada correctamente', { variant: 'success' });
      } else {
        const result = await createQuote(quoteData).unwrap();
        console.log('✅ Created and sent quote result:', result);
        enqueueSnackbar('Cotización creada y enviada correctamente', { variant: 'success' });
      }

      reset();
      loadingSend.onFalse();
      router.push(paths.dashboard.sales.quotes.root);
    } catch (error) {
      console.error('❌ Error sending quote:', error);
      loadingSend.onFalse();

      const errorMessage =
        error?.data?.message || error?.data?.detail || error?.message || 'Error al enviar la cotización';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={handleSaveAsDraft}>
      <Card>
        <QuoteNewEditAddress />

        <QuoteNewEditDetails />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          color="inherit"
          size="large"
          variant="outlined"
          onClick={() => router.push(paths.dashboard.sales.quotes.root)}
        >
          Cancelar
        </LoadingButton>

        <LoadingButton
          size="large"
          variant="contained"
          loading={loadingSave.value || isSubmitting}
          onClick={handleSaveAsDraft}
        >
          {currentQuote ? 'Actualizar' : 'Guardar Borrador'}
        </LoadingButton>

        <LoadingButton
          size="large"
          variant="contained"
          loading={loadingSend.value || isSubmitting}
          onClick={handleSendQuote}
          color="primary"
        >
          {currentQuote ? 'Actualizar y Enviar' : 'Crear y Enviar'}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

QuoteNewEditForm.propTypes = {
  currentQuote: PropTypes.object
};
