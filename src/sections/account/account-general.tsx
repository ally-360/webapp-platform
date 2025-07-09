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
// utils
import { fData } from 'src/utils/format-number';
import { t } from 'i18next';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();

  const { user, updateProfileInfo } = useAuthContext();

  const UpdateUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    lastname: Yup.string().required('Last name is required'),
    photo: Yup.mixed().nullable().required('Avatar is required'),
    personalPhoneNumber: Yup.string().required('Phone number is required'),
    dni: Yup.string().required('DNI is required')
  });

  const defaultValues = {
    name: user?.profile?.name ?? '',
    lastname: user?.profile?.lastname ?? '',
    email: user?.email ?? '',
    photo: user?.profile?.photo ?? '',
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

  // TODO: revisar a donde se hace el submit porque cambio el email y está afuera del profile

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateProfileInfo(user?.profile?.id, data);
      enqueueSnackbar('Se ha actualizado la información', { variant: 'success' });
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('No se ha podido actualizar la información', { variant: 'error' });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file)
      });

      if (file) {
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
                variant="outlined"
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
              <LoadingButton color="primary" type="submit" variant="contained" loading={isSubmitting}>
                Guardar Cambios
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
