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
import { useAppDispatch } from 'src/hooks/store';
// utils
import { fData } from 'src/utils/format-number';
import { t } from 'i18next';
// api
import {
  useUpdateUserProfileMutation,
  useUploadUserAvatarMutation,
  useGetUserAvatarQuery,
  userProfileApi
} from 'src/redux/services/userProfileApi';
import { authApi } from 'src/redux/services/authApi';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';

// types
interface AccountFormData {
  first_name: string;
  last_name: string;
  email: string;
  photo?: any;
  phone_number: string;
  dni?: string;
}

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const dispatch = useAppDispatch();

  // RTK Query mutations
  const [updateProfile, { isLoading: _isUpdatingProfile }] = useUpdateUserProfileMutation();
  const [uploadAvatar, { isLoading: _isUploadingAvatar }] = useUploadUserAvatarMutation();
  const { data: avatarData } = useGetUserAvatarQuery();

  const UpdateUserSchema = Yup.object().shape({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone_number: Yup.string().required('Phone number is required'),
    dni: Yup.string(),
    photo: Yup.mixed().nullable()
  });

  const defaultValues = {
    first_name: user?.profile?.first_name ?? '',
    last_name: user?.profile?.last_name ?? '',
    email: user?.email ?? '',
    photo: (avatarData?.avatar_url || user?.profile?.avatar_url) ?? '',
    phone_number: user?.profile?.phone_number ?? '',
    dni: user?.profile?.dni ?? ''
  };

  const methods = useForm<AccountFormData>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues
  });

  console.log(user);

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.photo && typeof data.photo === 'object' && 'preview' in data.photo) {
        const formData = new FormData();
        formData.append('file', data.photo as unknown as File);

        await uploadAvatar(formData).unwrap();
        enqueueSnackbar('Avatar actualizado correctamente', { variant: 'success' });
      }

      const profileData = {
        profile: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          ...(data.dni && { dni: data.dni })
        }
      };

      await updateProfile(profileData).unwrap();

      // Invalidate user cache to update profile across the app
      dispatch(userProfileApi.util.invalidateTags(['UserProfile']));
      dispatch(authApi.util.invalidateTags(['User']));

      enqueueSnackbar('Perfil actualizado correctamente', { variant: 'success' });

      // Force a small delay to ensure cache invalidation
      await new Promise((resolve) => setTimeout(resolve, 200));
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
                  permitidos *.jpeg, *.jpg, *.png
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
              <RHFTextField name="first_name" label="Nombre" />
              <RHFTextField name="last_name" label="Apellido" />
              <RHFTextField name="email" label={t('Email Address')} />
              <RHFPhoneNumber
                type="string"
                placeholder="Ej: 300 123 4567"
                defaultCountry="co"
                countryCodeEditable={false}
                onlyCountries={['co']}
                name="phone_number"
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
