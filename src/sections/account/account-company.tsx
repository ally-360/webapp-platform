import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// hooks
// utils
import { fData } from 'src/utils/format-number';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSwitch, RHFTextField, RHFUploadAvatar, RHFAutocomplete } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';

// ----------------------------------------------------------------------

export default function AccountCompany() {
  const { enqueueSnackbar } = useSnackbar();

  const { company, updateCompany } = useAuthContext();

  const UpdateUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    address: Yup.string().required('Address is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    website: Yup.string().required('Website is required'),
    quantityEmployees: Yup.string().required('Quantity of employees is required'),
    economicActivity: Yup.string().required('Economic activity is required')
  });

  const defaultValues = {
    name: company?.name || '',
    nit: company?.nit || '',
    address: company?.address || '',
    phoneNumber: company?.phoneNumber || '',
    website: company?.website || '',
    quantityEmployees: company?.quantityEmployees || '',
    economicActivity: company?.economicActivity || ''

    // lastname: company?.profile?.lastname || '',
    // email: company?.profile?.email || '',
    // photoURL: company?.profile?.photo || null,
    // phoneNumber: company?.profile?.personalPhoneNumber || '',
    // dni: company?.profile?.dni || ''
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
      delete data.nit;
      await updateCompany(data);
      enqueueSnackbar('Update success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file)
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
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
              name="photoURL"
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
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
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
              <RHFTextField disabled name="nit" label="Nit" />
              <RHFTextField name="address" label="Dirección" />
              <RHFPhoneNumber
                type="string"
                variant="outlined"
                placeholder="Ej: 300 123 4567"
                defaultCountry="co"
                countryCodeEditable={false}
                onlyCountries={['co']}
                name="phoneNumber"
                label="Télefono"
              />
              <RHFTextField name="website" label="Sitio web" />
              <RHFTextField name="quantityEmployees" label="Cantidad de empleados" />

              {/* <RHFTextField name="lastname" label="Apellido" />
              <RHFTextField name="email" label="Email Address" />
              <RHFPhoneNumber name="phoneNumber" label="Télefono" />
              <RHFTextField name="dni" label="Cédula de ciudadania" /> */}
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
