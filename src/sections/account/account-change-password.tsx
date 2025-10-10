import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { t } from 'i18next';
import React from 'react';
// api
import { useChangePasswordMutation } from 'src/redux/services/authApi';

// types
interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// validation schema
const ChangePasswordSchema = Yup.object().shape({
  current_password: Yup.string().required('Contraseña actual es requerida'),
  new_password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .required('Nueva contraseña es requerida'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Las contraseñas deben coincidir')
    .required('Confirmación de contraseña es requerida')
});

// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();
  const password = useBoolean(true);

  // RTK Query mutation
  const [changePassword, { isLoading: _isLoading }] = useChangePasswordMutation();

  const defaultValues = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  const methods = useForm<ChangePasswordFormData>({
    resolver: yupResolver(ChangePasswordSchema),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await changePassword(data).unwrap();
      reset();
      enqueueSnackbar('Contraseña actualizada correctamente', { variant: 'success' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error?.data?.detail || error?.data?.message || 'Error al cambiar la contraseña';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack component={Card} spacing={3} sx={{ p: 3 }}>
        <RHFTextField
          name="current_password"
          type={password.value ? 'password' : 'text'}
          label={t('Old Password')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <RHFTextField
          name="new_password"
          label={t('New Password')}
          type={password.value ? 'password' : 'text'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                </IconButton>
              </InputAdornment>
            )
          }}
          helperText="La contraseña debe tener al menos 8 caracteres"
        />

        <RHFTextField
          name="confirm_password"
          type={password.value ? 'password' : 'text'}
          label={t('Confirm New Password')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <LoadingButton type="submit" variant="contained" loading={isSubmitting || _isLoading} sx={{ ml: 'auto' }}>
          {t('Save Change')}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
