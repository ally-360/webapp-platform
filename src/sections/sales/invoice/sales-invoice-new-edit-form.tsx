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
import { useAuthContext } from 'src/auth/hooks';
// components
import FormProvider from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
// api
import {
  useCreateSalesInvoiceMutation,
  useUpdateSalesInvoiceMutation,
  CreateSalesInvoiceRequest
} from 'src/redux/services/salesInvoicesApi';
import { useGetPDVsQuery } from 'src/redux/services/pdvsApi';
//
import { useNavigate } from 'react-router';
import SalesInvoiceNewEditDetails from './sales-invoice-new-edit-details';
import SalesInvoiceNewEditAddress from './sales-invoice-new-edit-address';
import SalesInvoiceNewEditStatusDate from './sales-invoice-new-edit-status-date';

// ----------------------------------------------------------------------

export default function SalesInvoiceNewEditForm({ currentInvoice }) {
  const router = useRouter();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { company } = useAuthContext();
  const { data: pdvs = [] } = useGetPDVsQuery();

  const loadingSave = useBoolean(false);
  const loadingSend = useBoolean(false);

  // RTK Query mutations
  const [createSalesInvoice] = useCreateSalesInvoiceMutation();
  const [updateSalesInvoice] = useUpdateSalesInvoiceMutation();

  const NewInvoiceSchema = Yup.object().shape({
    invoiceNumber: Yup.string(), // Optional ya que el backend puede generarlo
    invoiceTo: Yup.mixed().nullable().required('Cliente es requerido'),
    createDate: Yup.date().required('Fecha de creación es requerida'),
    dueDate: Yup.date()
      .required('Fecha de vencimiento es requerida')
      .min(Yup.ref('createDate'), 'La fecha de vencimiento debe ser posterior a la fecha de creación'),
    taxes: Yup.number().default(0),
    status: Yup.string().default('borrador'),
    method: Yup.string(),
    paymentMethod: Yup.string(),
    paymentTerm: Yup.string(),
    discount: Yup.number().default(0),
    shipping: Yup.number().default(0),
    invoiceFrom: Yup.mixed().required('Información de la empresa es requerida'),
    totalAmount: Yup.number(),
    pdv_id: Yup.string(),
    global_pdv_id: Yup.string(), // Para el PDV global
    notes: Yup.string(),
    cost_center_id: Yup.string().nullable(),
    items: Yup.array()
      .of(
        Yup.object().shape({
          title: Yup.string().required('Título es requerido'),
          description: Yup.string().required('Descripción es requerida'),
          quantity: Yup.number().min(1, 'La cantidad debe ser mayor a 0').required('Cantidad es requerida'),
          price: Yup.number().min(0, 'El precio debe ser mayor o igual a 0').required('Precio es requerido'),
          product_id: Yup.string(), // ID del producto
          pdv_id: Yup.string() // PDV individual del producto
        })
      )
      .min(1, 'Debe agregar al menos un producto')
  });

  const defaultValues = useMemo(
    () => ({
      invoiceNumber: currentInvoice?.number || '', // Puede estar vacío para nuevas facturas
      createDate: currentInvoice?.issue_date ? new Date(currentInvoice.issue_date) : new Date(),
      dueDate: currentInvoice?.due_date ? new Date(currentInvoice.due_date) : new Date(),
      taxes: currentInvoice?.taxes || 0,
      shipping: currentInvoice?.shipping || 0,
      discount: currentInvoice?.discount || 0,
      status: currentInvoice?.status || 'borrador',
      method: currentInvoice?.method || 'Contado',
      paymentMethod: currentInvoice?.payment_method || '',
      paymentTerm: currentInvoice?.payment_term || '',
      invoiceFrom: currentInvoice?.invoiceFrom || company,
      invoiceTo: currentInvoice?.customer || null,
      totalAmount: currentInvoice?.total_amount || 0,
      pdv_id: currentInvoice?.pdv_id || '',
      global_pdv_id: '', // Para el PDV global
      notes: currentInvoice?.notes || '',
      cost_center_id: '',
      items: currentInvoice?.line_items?.map((item) => ({
        title: item.name,
        description: item.description || item.name,
        reference: item.sku,
        quantity: parseInt(item.quantity, 10),
        price: parseFloat(item.unit_price),
        total: parseInt(item.quantity, 10) * parseFloat(item.unit_price),
        taxes: 0,
        product_id: item.product_id,
        pdv_id: item.pdv_id || '' // PDV individual del producto
      })) || [
        {
          title: '',
          description: '',
          reference: '',
          quantity: 1,
          price: 0,
          total: 0,
          taxes: 0,
          product_id: '',
          pdv_id: ''
        }
      ]
    }),
    [currentInvoice, company]
  );

  const methods = useForm({
    resolver: yupResolver(NewInvoiceSchema) as any, // Type assertion to avoid resolver type mismatch
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    if (currentInvoice) {
      reset(defaultValues);
    }
  }, [currentInvoice, defaultValues, reset]);

  // Helper function to format dates for API
  const formatDateForAPI = (date: Date | string): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Helper function to get status for API
  const getStatusForAPI = (status: string): 'DRAFT' | 'OPEN' | undefined => {
    if (status === 'borrador') return 'DRAFT';
    if (status === 'enviada' || status === 'pagada' || status === 'vencida') return 'OPEN';
    return 'DRAFT';
  };

  const validateFormData = (data: any) => {
    const errors: string[] = [];

    if (!data.invoiceTo?.id) {
      errors.push('Debe seleccionar un cliente');
    }

    if (!data.items || data.items.length === 0) {
      errors.push('Debe agregar al menos un producto');
    }

    // Verificar PDV - Si solo hay un PDV, no es necesario validar selección
    const hasGlobalPDV = data.global_pdv_id;
    const hasIndividualPDVs = data.items?.some((item) => item.pdv_id);
    const hasOnlyOnePDV = pdvs.length === 1;

    if (!hasOnlyOnePDV && !hasGlobalPDV && !hasIndividualPDVs) {
      errors.push('Debe seleccionar un punto de venta');
    }

    // Verificar productos válidos
    const invalidItems = data.items?.filter(
      (item) => !item.title || !item.quantity || item.quantity <= 0 || !item.price || item.price < 0
    );

    if (invalidItems?.length > 0) {
      errors.push('Todos los productos deben tener título, cantidad válida y precio válido');
    }

    return errors;
  };

  const transformFormDataToApi = (data: any): CreateSalesInvoiceRequest => {
    console.log('🔍 Form data before transformation:', data);

    // Validar datos antes de transformar
    const validationErrors = validateFormData(data);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('. '));
    }

    const transformedData = {
      customer_id: data.invoiceTo?.id?.toString() || '',
      pdv_id: data.global_pdv_id || data.items?.[0]?.pdv_id || (pdvs.length === 1 ? pdvs[0].id : ''),
      type: 'SALE' as const,
      issue_date: formatDateForAPI(data.createDate),
      due_date: formatDateForAPI(data.dueDate),
      status: getStatusForAPI(data.status),
      currency: 'COP', // Default currency for Colombia
      notes: data.notes || '',
      ...(data.cost_center_id ? { cost_center_id: data.cost_center_id } : {}),
      items:
        data.items?.map((item) => ({
          product_id: item.product_id || '',
          name: item.title,
          sku: item.reference || 'N/A',
          quantity: item.quantity.toString(),
          unit_price: item.price.toString()
        })) || []
    };

    console.log('🚀 Transformed data for API:', transformedData);

    return transformedData;
  };

  const handleSaveAsDraft = handleSubmit(
    async (data) => {
      console.log('💾 Saving as draft with data:', data);
      loadingSave.onTrue();

      try {
        const invoiceData = transformFormDataToApi(data);
        invoiceData.status = 'DRAFT';

        console.log('📤 Sending draft invoice data:', invoiceData);

        if (currentInvoice) {
          const result = await updateSalesInvoice({ id: currentInvoice.id, ...invoiceData }).unwrap();
          console.log('✅ Updated invoice result:', result);
          enqueueSnackbar('Factura actualizada como borrador', { variant: 'success' });
        } else {
          const result = await createSalesInvoice(invoiceData).unwrap();
          console.log('✅ Created invoice result:', result);
          enqueueSnackbar('Factura guardada como borrador', { variant: 'success' });
        }

        reset();
        loadingSave.onFalse();
        router.push(paths.dashboard.sales.root);
      } catch (error) {
        console.error('❌ Error saving invoice:', error);

        // Extraer mensaje de error más específico
        let errorMessage = 'Error al guardar la factura';
        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        enqueueSnackbar(errorMessage, { variant: 'error' });
        loadingSave.onFalse();
      }
    },
    (errors) => {
      console.log('❌ Form validation errors:', errors);
      enqueueSnackbar('Por favor corrija los errores en el formulario', { variant: 'error' });
    }
  );

  const handleCreateAndSend = handleSubmit(
    async (data) => {
      console.log('📨 Creating and sending with data:', data);
      loadingSend.onTrue();

      try {
        const invoiceData = transformFormDataToApi(data);
        invoiceData.status = 'OPEN';

        console.log('📤 Sending open invoice data:', invoiceData);

        if (currentInvoice) {
          const result = await updateSalesInvoice({ id: currentInvoice.id, ...invoiceData }).unwrap();
          console.log('✅ Updated invoice result:', result);
          enqueueSnackbar('Factura actualizada y enviada', { variant: 'success' });
        } else {
          const result = await createSalesInvoice(invoiceData).unwrap();
          console.log('✅ Created invoice result:', result);
          enqueueSnackbar('Factura creada y enviada', { variant: 'success' });
        }

        reset();
        loadingSend.onFalse();
        router.push(paths.dashboard.sales.root);
      } catch (error) {
        console.error('❌ Error creating invoice:', error);

        // Extraer mensaje de error más específico
        let errorMessage = 'Error al crear la factura';
        if (error?.data?.message) {
          errorMessage = error.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        enqueueSnackbar(errorMessage, { variant: 'error' });
        loadingSend.onFalse();
      }
    },
    (errors) => {
      console.log('❌ Form validation errors:', errors);
      enqueueSnackbar('Por favor corrija los errores en el formulario', { variant: 'error' });
    }
  );

  return (
    <FormProvider methods={methods} onSubmit={handleCreateAndSend}>
      <Card>
        <SalesInvoiceNewEditAddress />
        <SalesInvoiceNewEditStatusDate />
        <SalesInvoiceNewEditDetails />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton color="inherit" size="large" variant="outlined" onClick={() => navigate(-1)}>
          Cancelar
        </LoadingButton>

        <LoadingButton
          color="info"
          size="large"
          variant="outlined"
          onClick={() => {
            const currentData = methods.getValues();
            console.log('🔍 Current form data:', currentData);
            console.log('🔍 Form errors:', methods.formState.errors);
            const validationErrors = validateFormData(currentData);
            console.log('🔍 Custom validation errors:', validationErrors);
            if (validationErrors.length > 0) {
              enqueueSnackbar(`Errores: ${validationErrors.join(', ')}`, { variant: 'warning' });
            } else {
              enqueueSnackbar('Formulario válido', { variant: 'success' });
            }
          }}
        >
          Debug Form
        </LoadingButton>

        <LoadingButton
          color="inherit"
          size="large"
          variant="outlined"
          loading={loadingSave.value && isSubmitting}
          onClick={handleSaveAsDraft}
        >
          Guardar como borrador
        </LoadingButton>

        <LoadingButton
          size="large"
          color="primary"
          variant="contained"
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend}
        >
          {currentInvoice ? 'Actualizar factura' : 'Crear factura'}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

SalesInvoiceNewEditForm.propTypes = {
  currentInvoice: PropTypes.object
};
