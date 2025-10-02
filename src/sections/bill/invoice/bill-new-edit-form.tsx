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

const NewBillSchema = Yup.object().shape({
  supplier_id: Yup.string().required('El proveedor es requerido'),
  pdv_id: Yup.string().required('El punto de venta es requerido'),
  issue_date: Yup.date().required('La fecha de emisión es requerida'),
  due_date: Yup.date()
    .required('La fecha de vencimiento es requerida')
    .nullable()
    .test('date-min', 'La fecha de vencimiento debe ser posterior a la fecha de emisión', (value, { parent }) => {
      if (!value || !parent.issue_date) return true;
      return new Date(value).getTime() >= new Date(parent.issue_date).getTime();
    }),
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
  currency: Yup.string()
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
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const handleSaveAsDraft = handleSubmit(
    useCallback(
      async (data) => {
        loadingSave.onTrue();

        try {
          console.log('Form data before mapping:', data);

          // Validate required fields
          if (!data.supplier_id) {
            enqueueSnackbar('Debe seleccionar un proveedor', { variant: 'error' });
            return;
          }

          const pdvId = data.pdv_id || (data as any).pdvId;
          if (!pdvId) {
            enqueueSnackbar('Debe seleccionar un punto de venta', { variant: 'error' });
            return;
          }

          // Filter items that have a selected product
          const validItems = (data.items || []).filter((item) => item.product_id);
          if (validItems.length === 0) {
            enqueueSnackbar('Debe agregar al menos un producto', { variant: 'error' });
            return;
          }

          const billData = {
            supplier_id: data.supplier_id,
            pdv_id: pdvId,
            number: data.number || undefined,
            issue_date: (data.issue_date || (data as any).createDate).toISOString().split('T')[0],
            due_date: data.due_date?.toISOString().split('T')[0] ?? new Date().toISOString().split('T')[0],
            currency: data.currency || 'COP',
            notes: data.notes || undefined,
            line_items: validItems.map((item) => ({
              product_id: item.product_id,
              quantity: Number(item.quantity),
              unit_price: Number(item.unit_price)
            })),
            status: 'draft' as const
          };
          console.log('Mapped bill data:', billData);

          if (currentBill) {
            await updateBill({
              id: currentBill.id,
              bill: billData
            }).unwrap();

            enqueueSnackbar('Factura actualizada exitosamente', { variant: 'success' });
            router.push(paths.dashboard.bill.details(currentBill.id));
          } else {
            const newBill = await createBill(billData).unwrap();
            enqueueSnackbar('Factura creada como borrador exitosamente', { variant: 'success' });
            router.push(paths.dashboard.bill.details(newBill.id));
          }

          reset();
        } catch (error) {
          console.error('Error saving bill:', error);
          enqueueSnackbar(currentBill ? 'Error al actualizar la factura' : 'Error al crear la factura', {
            variant: 'error'
          });
        } finally {
          loadingSave.onFalse();
        }
      },
      [currentBill, createBill, updateBill, enqueueSnackbar, router, reset, loadingSave]
    )
  );

  const handleCreateAndOpen = handleSubmit(
    useCallback(
      async (data) => {
        loadingSend.onTrue();

        try {
          console.log('Form data before mapping (Open):', data);

          // Validate required fields
          if (!data.supplier_id) {
            enqueueSnackbar('Debe seleccionar un proveedor', { variant: 'error' });
            return;
          }

          const pdvId = data.pdv_id || (data as any).pdvId;
          if (!pdvId) {
            enqueueSnackbar('Debe seleccionar un punto de venta', { variant: 'error' });
            return;
          }

          // Filter items that have a selected product
          const validItems = (data.items || []).filter((item) => item.product_id);
          if (validItems.length === 0) {
            enqueueSnackbar('Debe agregar al menos un producto', { variant: 'error' });
            return;
          }

          const billData = {
            supplier_id: data.supplier_id,
            pdv_id: pdvId,
            number: data.number || undefined,
            issue_date: (data.issue_date || (data as any).createDate).toISOString().split('T')[0],
            due_date: data.due_date?.toISOString().split('T')[0] ?? new Date().toISOString().split('T')[0],
            currency: data.currency || 'COP',
            notes: data.notes || undefined,
            line_items: validItems.map((item) => ({
              product_id: item.product_id,
              quantity: Number(item.quantity),
              unit_price: Number(item.unit_price)
            })),
            status: 'open' as const
          };
          console.log('Mapped bill data (Open):', billData);

          if (currentBill) {
            await updateBill({
              id: currentBill.id,
              bill: billData
            }).unwrap();

            enqueueSnackbar('Factura actualizada y abierta exitosamente', { variant: 'success' });
            router.push(paths.dashboard.bill.details(currentBill.id));
          } else {
            const newBill = await createBill(billData).unwrap();
            enqueueSnackbar('Factura creada y abierta exitosamente. Inventario actualizado.', {
              variant: 'success'
            });
            router.push(paths.dashboard.bill.details(newBill.id));
          }

          reset();
        } catch (error) {
          console.error('Error creating/updating bill:', error);
          enqueueSnackbar(currentBill ? 'Error al actualizar la factura' : 'Error al crear la factura', {
            variant: 'error'
          });
        } finally {
          loadingSend.onFalse();
        }
      },
      [currentBill, createBill, updateBill, enqueueSnackbar, router, reset, loadingSend]
    )
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSaveAsDraft}>
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
