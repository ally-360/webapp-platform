import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Alert, MenuItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';

import { RHFTextField, RHFSelect, RHFAutocomplete } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { useGetProductsQuery } from 'src/redux/services/productsApi';
import { useGetPDVsQuery } from 'src/redux/services/pdvsApi';
import { useTransferStockMutation } from 'src/redux/services/inventoryMovementsApi';
import type { TransferStockPayload } from 'src/types/inventory-movements';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
};

type FormValues = {
  product_id: string;
  pdv_id_from: string;
  pdv_id_to: string;
  quantity: number;
  reference: string;
  notes: string;
};

const TransferSchema = Yup.object().shape({
  product_id: Yup.string().required('Producto es requerido'),
  pdv_id_from: Yup.string().required('PDV Origen es requerido'),
  pdv_id_to: Yup.string()
    .required('PDV Destino es requerido')
    .test('different-pdv', 'PDV Destino debe ser diferente al Origen', function (value) {
      const { pdv_id_from } = this.parent;
      return value !== pdv_id_from;
    }),
  quantity: Yup.number()
    .typeError('Debe ser un número')
    .positive('Debe ser mayor a 0')
    .required('Cantidad es requerida'),
  reference: Yup.string(),
  notes: Yup.string()
});

export default function TransferStockDialog({ open, onClose, onSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
    page_size: 1000
  });
  const { data: pdvsData, isLoading: pdvsLoading } = useGetPDVsQuery();
  const [transferStock, { isLoading: isSubmitting }] = useTransferStockMutation();

  const methods = useForm<FormValues>({
    resolver: yupResolver(TransferSchema),
    defaultValues: {
      product_id: '',
      pdv_id_from: '',
      pdv_id_to: '',
      quantity: 0,
      reference: '',
      notes: ''
    }
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = methods;

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: TransferStockPayload = {
        product_id: data.product_id,
        pdv_id_from: data.pdv_id_from,
        pdv_id_to: data.pdv_id_to,
        quantity: data.quantity,
        reference: data.reference || undefined,
        notes: data.notes || undefined
      };

      await transferStock(payload).unwrap();

      enqueueSnackbar('Transferencia registrada exitosamente', { variant: 'success' });
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error transferring stock:', error);
      enqueueSnackbar(error?.data?.detail || error?.data?.message || 'Error al registrar transferencia', {
        variant: 'error'
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const products = productsData?.data || [];
  const pdvs = pdvsData || [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transferir Stock</DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Alert severity="info">
              Transfiere inventario de un PDV a otro. Se generará una salida en el origen y una entrada en el destino.
            </Alert>

            <Controller
              name="product_id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <RHFAutocomplete
                  {...field}
                  label="Producto *"
                  options={products}
                  loading={productsLoading}
                  getOptionLabel={(option: any) =>
                    typeof option === 'string' ? products.find((p) => p.id === option)?.name || '' : option.name || ''
                  }
                  renderOption={(props, option: any) => (
                    <li {...props} key={option.id}>
                      <Stack>
                        <span>{option.name}</span>
                        {option.sku && <span style={{ fontSize: 12, color: 'text.secondary' }}>SKU: {option.sku}</span>}
                      </Stack>
                    </li>
                  )}
                  onChange={(_, value) => field.onChange(value?.id || '')}
                  value={products.find((p) => p.id === field.value) || null}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            <RHFSelect name="pdv_id_from" label="PDV Origen *" disabled={pdvsLoading}>
              <MenuItem value="">Seleccionar PDV Origen</MenuItem>
              {pdvs.map((pdv) => (
                <MenuItem key={pdv.id} value={pdv.id}>
                  {pdv.name}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect name="pdv_id_to" label="PDV Destino *" disabled={pdvsLoading}>
              <MenuItem value="">Seleccionar PDV Destino</MenuItem>
              {pdvs.map((pdv) => (
                <MenuItem key={pdv.id} value={pdv.id}>
                  {pdv.name}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField name="quantity" label="Cantidad *" type="number" inputProps={{ min: 0, step: 1 }} />

            <RHFTextField name="reference" label="Referencia" />

            <RHFTextField name="notes" label="Notas" multiline rows={3} />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Transferir
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
