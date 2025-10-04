import PropTypes from 'prop-types';
import { useMemo, useCallback } from 'react';
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
import { useSnackbar } from 'src/components/snackbar';
// components
import FormProvider from 'src/components/hook-form';
// RTK Query
import { useCreateBillMutation, useUpdateBillMutation } from 'src/redux/services/billsApi';
//
import InvoiceNewEditDetails from './invoice-new-edit-details';
import BillNewEditAddress from './bill-new-edit-address';
import InvoiceNewEditStatusDate from './invoice-new-edit-status-date';

// ----------------------------------------------------------------------

const NewBillSchema = Yup.object()
  .shape({
    supplier_id: Yup.string().required('El proveedor es requerido'),
    // Ambas variantes opcionales; se valida a nivel de objeto que al menos una exista
    pdv_id: Yup.string().nullable(),
    pdvId: Yup.string().nullable(),
    // Fechas: opcionales individualmente; se valida a nivel de objeto que exista una de emisión
    issue_date: Yup.date().nullable(),
    createDate: Yup.date().nullable(),
    due_date: Yup.date()
      .nullable()
      .test(
        'date-min',
        'La fecha de vencimiento debe ser posterior a la fecha de emisión',
        function validateDueDate(value) {
          const { issue_date, createDate } = this.parent as any;
          const emissionDate = issue_date || createDate;
          if (!value || !emissionDate) return true;
          return new Date(value).getTime() >= new Date(emissionDate).getTime();
        }
      ),
    items: Yup.array()
      .of(
        Yup.object().shape({
          product_id: Yup.string().required('Producto es requerido'),
          quantity: Yup.number().required('Cantidad es requerida').min(1, 'La cantidad debe ser mayor a 0'),
          unit_price: Yup.number().required('Precio es requerido').min(0, 'El precio debe ser mayor o igual a 0')
        })
      )
      .min(1, 'Debe agregar al menos un producto'),
    number: Yup.string(),
    notes: Yup.string(),
    status: Yup.string(),
    currency: Yup.string(),
    // Campos extra del componente Invoice para evitar errores de validación
    method: Yup.string(),
    paymentMethod: Yup.string(),
    totalAmount: Yup.number(),
    totalTaxes: Yup.number()
  })
  // Validación a nivel de objeto para evitar dependencias cíclicas
  .test('require-pdv', 'El punto de venta es requerido', (obj) => {
    if (!obj) return false;
    return Boolean((obj as any).pdv_id || (obj as any).pdvId);
  })
  .test('require-issue-date', 'La fecha de emisión es requerida', (obj) => {
    if (!obj) return false;
    return Boolean((obj as any).issue_date || (obj as any).createDate);
  });

// ----------------------------------------------------------------------

export default function BillNewEditForm({ currentBill }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const loadingSave = useBoolean(false);
  const loadingSend = useBoolean(false);

  // RTK Query mutations
  const [createBill, { isLoading: isCreating }] = useCreateBillMutation();
  const [updateBill, { isLoading: isUpdating }] = useUpdateBillMutation();

  const defaultValues = useMemo(
    () => ({
      supplier_id: currentBill?.supplier_id || '',
      pdv_id: currentBill?.pdv_id || '',
      number: currentBill?.number || '',
      issue_date: currentBill?.issue_date ? new Date(currentBill.issue_date) : new Date(),
      due_date: currentBill?.due_date ? new Date(currentBill.due_date) : null,
      currency: currentBill?.currency || 'COP',
      notes: currentBill?.notes || '',
      status: currentBill?.status || 'draft',
      // Add fields expected by InvoiceNewEditStatusDate component
      createDate: currentBill?.issue_date ? new Date(currentBill.issue_date) : new Date(),
      pdvId: currentBill?.pdv_id || '',
      method: 'Contado',
      paymentMethod: 'Efectivo',
      items: currentBill?.line_items?.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        price: Number(item.unit_price) || 0,
        total: Number(item.quantity) * (Number(item.unit_price) || 0),
        taxes: 0,
        title: item.product || '',
        description: item.product?.description || '',
        reference: item.product?.sku || item.product?.barCode || ''
      })) || [
        {
          product_id: '',
          quantity: 1,
          unit_price: 0,
          price: 0,
          total: 0,
          taxes: 0,
          title: '',
          description: '',
          reference: ''
        }
      ]
    }),
    [currentBill]
  );

  const methods = useForm<typeof defaultValues>({
    resolver: yupResolver(NewBillSchema) as any,
    defaultValues
  });

  const {
    reset,
    getValues,
    formState: { isSubmitting }
  } = methods;

  // Transform and validate data for API submission
  const transformFormDataToBillData = useCallback((data: any) => {
    console.log('Raw form data:', data);

    // Extract and validate required fields using destructuring
    const { supplier_id, due_date } = data;
    const pdv_id = data.pdv_id || data.pdvId;
    const issue_date = data.issue_date || data.createDate;

    // Validate required fields
    if (!supplier_id) {
      throw new Error('Debe seleccionar un proveedor');
    }
    if (!pdv_id) {
      throw new Error('Debe seleccionar un punto de venta');
    }
    if (!issue_date) {
      throw new Error('Debe seleccionar una fecha de emisión');
    }

    // Filter and validate items
    const validItems = (data.items || []).filter((item: any) => item.product_id && item.product_id !== '');
    if (validItems.length === 0) {
      throw new Error('Debe agregar al menos un producto');
    }

    // Validate each item
    validItems.forEach((item: any, index: number) => {
      if (!item.product_id) {
        throw new Error(`Producto ${index + 1}: Debe seleccionar un producto`);
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        throw new Error(`Producto ${index + 1}: La cantidad debe ser mayor a 0`);
      }
      if (item.unit_price === undefined || item.unit_price === null || Number(item.unit_price) < 0) {
        throw new Error(`Producto ${index + 1}: El precio debe ser mayor o igual a 0`);
      }
    });

    // Build/ensure bill number
    const asDate = issue_date instanceof Date ? issue_date : new Date(issue_date);
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = asDate.getFullYear();
    const m = pad(asDate.getMonth() + 1);
    const d = pad(asDate.getDate());
    const hh = pad(asDate.getHours());
    const mm = pad(asDate.getMinutes());
    const ss = pad(asDate.getSeconds());
    const rand = Math.floor(Math.random() * 9000 + 1000); // 4-digit
    const autoNumber = `BILL-${y}${m}${d}-${hh}${mm}${ss}-${rand}`;
    const number = (data.number && String(data.number).trim()) || autoNumber;

    // Create the bill data object
    const billData = {
      supplier_id,
      pdv_id,
      number,
      issue_date: new Date(issue_date).toISOString().split('T')[0],
      due_date: due_date ? new Date(due_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      currency: data.currency || 'COP',
      notes: data.notes || undefined,
      line_items: validItems.map((item: any) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price)
      }))
    };

    console.log('Transformed bill data:', billData);
    return billData;
  }, []);

  const handleSaveAsDraft = useCallback(async () => {
    loadingSave.onTrue();

    try {
      const data = getValues();
      const billData = transformFormDataToBillData(data);
      const finalBillData = { ...billData, status: 'draft' as const };

      console.log('Final bill data (Draft):', finalBillData);

      if (currentBill) {
        await updateBill({
          id: currentBill.id,
          bill: finalBillData
        }).unwrap();

        enqueueSnackbar('Factura actualizada exitosamente', { variant: 'success' });
        router.push(paths.dashboard.bill.details(currentBill.id));
      } else {
        const newBill = await createBill(finalBillData).unwrap();
        enqueueSnackbar('Factura creada como borrador exitosamente', { variant: 'success' });
        router.push(paths.dashboard.bill.details(newBill.id));
      }

      reset();
    } catch (error: any) {
      console.error('Error saving bill:', error);
      enqueueSnackbar(error.message || (currentBill ? 'Error al actualizar la factura' : 'Error al crear la factura'), {
        variant: 'error'
      });
    } finally {
      loadingSave.onFalse();
    }
  }, [
    currentBill,
    createBill,
    updateBill,
    enqueueSnackbar,
    router,
    reset,
    loadingSave,
    transformFormDataToBillData,
    getValues
  ]);

  const handleCreateAndOpen = useCallback(async () => {
    loadingSend.onTrue();

    try {
      const data = getValues();
      const billData = transformFormDataToBillData(data);
      const finalBillData = { ...billData, status: 'open' as const };

      console.log('Final bill data (Open):', finalBillData);

      if (currentBill) {
        await updateBill({
          id: currentBill.id,
          bill: finalBillData
        }).unwrap();

        enqueueSnackbar('Factura actualizada y abierta exitosamente', { variant: 'success' });
        router.push(paths.dashboard.bill.details(currentBill.id));
      } else {
        const newBill = await createBill(finalBillData).unwrap();
        enqueueSnackbar('Factura creada y abierta exitosamente. Inventario actualizado.', {
          variant: 'success'
        });
        router.push(paths.dashboard.bill.details(newBill.id));
      }

      reset();
    } catch (error: any) {
      console.error('Error creating/updating bill:', error);
      enqueueSnackbar(error.message || (currentBill ? 'Error al actualizar la factura' : 'Error al crear la factura'), {
        variant: 'error'
      });
    } finally {
      loadingSend.onFalse();
    }
  }, [
    currentBill,
    createBill,
    updateBill,
    enqueueSnackbar,
    router,
    reset,
    loadingSend,
    transformFormDataToBillData,
    getValues
  ]);

  return (
    <FormProvider methods={methods} onSubmit={() => console.log('Form submitted')}>
      <Card>
        <BillNewEditAddress />

        <InvoiceNewEditStatusDate />

        <InvoiceNewEditDetails />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          color="inherit"
          size="large"
          variant="outlined"
          onClick={() => router.push(paths.dashboard.bill.root)}
        >
          Cancelar
        </LoadingButton>

        <LoadingButton
          color="warning"
          size="large"
          variant="outlined"
          loading={loadingSave.value || isSubmitting || isCreating || isUpdating}
          onClick={handleSaveAsDraft}
        >
          {currentBill ? 'Actualizar Borrador' : 'Guardar como Borrador'}
        </LoadingButton>

        <LoadingButton
          size="large"
          color="primary"
          variant="contained"
          loading={loadingSend.value || isSubmitting || isCreating || isUpdating}
          onClick={handleCreateAndOpen}
          disabled={currentBill?.status === 'void' || currentBill?.status === 'paid'}
        >
          {currentBill ? 'Actualizar y Abrir' : 'Crear y Abrir'}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

BillNewEditForm.propTypes = {
  currentBill: PropTypes.object
};
