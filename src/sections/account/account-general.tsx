import * as Yup from 'yup';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// utils
import { fData } from 'src/utils/format-number';
import { t } from 'i18next';
// api
import {
  useUpdateUserProfileMutation,
  useUploadUserAvatarMutation,
  useGetUserAvatarQuery
} from 'src/redux/services/userProfileApi';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  // RTK Query mutations
  const [updateProfile, { isLoading: _isUpdatingProfile }] = useUpdateUserProfileMutation();
  const [uploadAvatar, { isLoading: _isUploadingAvatar }] = useUploadUserAvatarMutation();
  const { data: avatarData } = useGetUserAvatarQuery();

  const UpdateUserSchema = Yup.object().shape({
    name: Yup.string().required('Nombre es requerido'),
    lastname: Yup.string().required('Apellido es requerido'),
    email: Yup.string().required('Email es requerido').email('Email debe ser válido'),
    photo: Yup.mixed().nullable(),
    personalPhoneNumber: Yup.string().required('Teléfono es requerido'),
    dni: Yup.string().required('DNI es requerido')
  });

  const defaultValues = {
    name: user?.profile?.name ?? '',
    lastname: user?.profile?.lastname ?? '',
    email: user?.email ?? '',
    photo: (avatarData?.avatar_url || user?.profile?.photo) ?? '',
    personalPhoneNumber: user?.profile?.personalPhoneNumber ?? '',
    dni: user?.profile?.dni ?? ''
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // 1. Subir avatar si hay una nueva imagen
      if (data.photo && typeof data.photo === 'object' && 'preview' in data.photo) {
        const formData = new FormData();
        formData.append('file', data.photo as unknown as File);

        await uploadAvatar(formData).unwrap();
        enqueueSnackbar('Avatar actualizado correctamente', { variant: 'success' });
      }

      // 2. Actualizar perfil
      const profileData = {
        profile: {
          first_name: data.name,
          last_name: data.lastname,
          phone_number: data.personalPhoneNumber
        }
      };

      await updateProfile(profileData).unwrap();

      enqueueSnackbar('Perfil actualizado correctamente', { variant: 'success' });

      // Recargar página para actualizar contexto
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error?.data?.message || 'No se pudo actualizar el perfil';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file)
        });
        setValue('photo', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="photo"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled'
                  }}
                >
                  permitidos *.jpeg, *.jpg, *.png, *.gif
                  <br /> tamaño maximo {fData(3145728)}
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)'
              }}
            >
              <RHFTextField name="name" label="Nombre" />
              <RHFTextField name="lastname" label="Apellido" />
              <RHFTextField name="email" label={t('Email Address')} />
              <RHFPhoneNumber
                type="string"
                placeholder="Ej: 300 123 4567"
                defaultCountry="co"
                countryCodeEditable={false}
                onlyCountries={['co']}
                name="personalPhoneNumber"
                label="Télefono"
              />
              <RHFTextField name="dni" label="Cédula de ciudadania" disabled />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                color="primary"
                type="submit"
                variant="contained"
                loading={isSubmitting || _isUpdatingProfile || _isUploadingAvatar}
              >
                Guardar Cambios
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
