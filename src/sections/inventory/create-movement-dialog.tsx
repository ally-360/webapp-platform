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
import { useCreateMovementMutation } from 'src/redux/services/inventoryMovementsApi';
import type { CreateMovementPayload, MovementType } from 'src/types/inventory-movements';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
};

type FormValues = {
  product_id: string;
  pdv_id: string;
  movement_type: MovementType;
  quantity: number;
  reference: string;
  notes: string;
};

const MovementSchema = Yup.object().shape({
  product_id: Yup.string().required('Producto es requerido'),
  pdv_id: Yup.string().required('PDV es requerido'),
  movement_type: Yup.string().oneOf(['IN', 'OUT']).required('Tipo es requerido'),
  quantity: Yup.number()
    .typeError('Debe ser un número')
    .positive('Debe ser mayor a 0')
    .required('Cantidad es requerida'),
  reference: Yup.string(),
  notes: Yup.string()
});

export default function CreateMovementDialog({ open, onClose, onSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
    page_size: 1000
  });
  const { data: pdvsData, isLoading: pdvsLoading } = useGetPDVsQuery();
  const [createMovement, { isLoading: isSubmitting }] = useCreateMovementMutation();

  const methods = useForm<FormValues>({
    resolver: yupResolver(MovementSchema),
    defaultValues: {
      product_id: '',
      pdv_id: '',
      movement_type: 'IN',
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
      const payload: CreateMovementPayload = {
        product_id: data.product_id,
        pdv_id: data.pdv_id,
        movement_type: data.movement_type,
        quantity: data.quantity,
        reference: data.reference || undefined,
        notes: data.notes || undefined
      };

      await createMovement(payload).unwrap();

      enqueueSnackbar('Movimiento registrado exitosamente', { variant: 'success' });
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating movement:', error);
      enqueueSnackbar(error?.data?.detail || error?.data?.message || 'Error al registrar movimiento', {
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
      <DialogTitle>Registrar Movimiento</DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Alert severity="info">
              Registra una entrada (IN) o salida (OUT) de inventario para un producto y PDV específico.
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

            <RHFSelect name="pdv_id" label="PDV *" disabled={pdvsLoading}>
              <MenuItem value="">Seleccionar PDV</MenuItem>
              {pdvs.map((pdv) => (
                <MenuItem key={pdv.id} value={pdv.id}>
                  {pdv.name}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect name="movement_type" label="Tipo de Movimiento *">
              <MenuItem value="IN">Entrada</MenuItem>
              <MenuItem value="OUT">Salida</MenuItem>
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
            Registrar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
