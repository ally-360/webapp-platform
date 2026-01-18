import { useEffect } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// MUI
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Alert } from '@mui/material';

// Components
import FormProvider, { RHFTextField, RHFSwitch } from 'src/components/hook-form';

// Types
import type { CostCenter } from 'src/sections/accounting/types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSubmit: (data: CostCenterFormData) => Promise<void>;
  costCenter?: CostCenter | null;
  isLoading?: boolean;
};

export type CostCenterFormData = {
  code?: string;
  name: string;
  is_active: boolean;
};

// ----------------------------------------------------------------------

export default function CostCenterCreateEditDialog({ open, onClose, onSubmit, costCenter, isLoading = false }: Props) {
  const isEdit = !!costCenter;

  const NewCostCenterSchema = Yup.object().shape({
    code: Yup.string().max(20, 'Código muy largo'),
    name: Yup.string().required('Nombre es requerido').max(100, 'Nombre muy largo'),
    is_active: Yup.boolean().default(true)
  });

  const defaultValues: CostCenterFormData = {
    code: '',
    name: '',
    is_active: true
  };

  const methods = useForm<CostCenterFormData>({
    resolver: yupResolver(NewCostCenterSchema),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    if (costCenter) {
      reset({
        code: costCenter.code || '',
        name: costCenter.name,
        is_active: costCenter.is_active ?? true
      });
    } else {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [costCenter, open]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error en formulario:', error);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Centro de Costo' : 'Crear Centro de Costo'}</DialogTitle>

      <FormProvider methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Los centros de costo permiten organizar y rastrear gastos e ingresos por departamentos, proyectos o áreas
              específicas de la empresa.
            </Alert>

            <RHFTextField
              name="code"
              label="Código"
              placeholder="Ej: CC-001"
              helperText="Código opcional para identificación rápida"
            />

            <RHFTextField name="name" label="Nombre" placeholder="Ej: Ventas, Administración, Proyecto X" required />

            <RHFSwitch name="is_active" label="Activo" labelPlacement="start" helperText="" />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="outlined" disabled={isSubmitting || isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || isLoading}>
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
