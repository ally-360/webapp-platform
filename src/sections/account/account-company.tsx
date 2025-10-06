import * as Yup from 'yup';
import { useCallback } from 'react';
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
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
// api
import {
  useUpdateCompanyMutation,
  useUploadCompanyLogoMutation,
  useGetCompanyLogoQuery,
  useGetCompanyProfileQuery
} from 'src/redux/services/userProfileApi';

// ----------------------------------------------------------------------

export default function AccountCompany() {
  const { enqueueSnackbar } = useSnackbar();
  const { company } = useAuthContext();

  // RTK Query hooks
  const { data: companyData, refetch: refetchCompany } = useGetCompanyProfileQuery();
  const { data: logoData } = useGetCompanyLogoQuery();
  const [updateCompany, { isLoading: _isUpdatingCompany }] = useUpdateCompanyMutation();
  const [uploadLogo, { isLoading: _isUploadingLogo }] = useUploadCompanyLogoMutation();

  // Usar datos de la API si están disponibles, sino usar del contexto
  const currentCompany = companyData || company;

  const UpdateCompanySchema = Yup.object().shape({
    name: Yup.string().required('Nombre es requerido'),
    nit: Yup.string(),
    address: Yup.string().required('Dirección es requerida'),
    phone_number: Yup.string().required('Teléfono es requerido'),
    description: Yup.string(),
    social_reason: Yup.string(),
    quantity_employees: Yup.number().min(1, 'Debe ser mayor a 0'),
    economic_activity: Yup.string().required('Actividad económica es requerida'),
    logo: Yup.mixed()
  });

  const defaultValues = {
    name: currentCompany?.name || '',
    nit: currentCompany?.nit || '',
    address: (currentCompany as any)?.address || '',
    phone_number: (currentCompany as any)?.phone_number || '',
    description: (currentCompany as any)?.description || '',
    social_reason: (currentCompany as any)?.social_reason || '',
    quantity_employees: (currentCompany as any)?.quantity_employees || 0,
    economic_activity: (currentCompany as any)?.economic_activity || '',
    logo: logoData?.logo_url || (currentCompany as any)?.logo_url || null
  };

  const methods = useForm<any>({
    resolver: yupResolver(UpdateCompanySchema),
    defaultValues
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // 1. Subir logo si hay una nueva imagen
      if (data.logo && typeof data.logo === 'object' && 'preview' in data.logo) {
        const formData = new FormData();
        formData.append('file', data.logo as unknown as File);

        await uploadLogo(formData).unwrap();
        enqueueSnackbar('Logo actualizado correctamente', { variant: 'success' });
      }

      // 2. Actualizar información de la empresa
      const updateData = {
        name: data.name,
        address: data.address,
        phone_number: data.phone_number,
        description: data.description,
        social_reason: data.social_reason,
        quantity_employees: Number(data.quantity_employees),
        economic_activity: data.economic_activity
      };

      await updateCompany(updateData).unwrap();
      enqueueSnackbar('Información de la empresa actualizada correctamente', { variant: 'success' });

      // Refrescar datos
      refetchCompany();
    } catch (error: any) {
      console.error('Error updating company:', error);
      const errorMessage = error?.data?.message || 'No se pudo actualizar la información de la empresa';
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
        setValue('logo', newFile, { shouldValidate: true });
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
              name="logo"
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
                  Formatos permitidos: *.jpeg, *.jpg, *.png, *.gif
                  <br /> Tamaño máximo: {fData(3145728)}
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
              <RHFTextField name="name" label="Nombre de la Empresa" />
              <RHFTextField disabled name="nit" label="NIT" />
              <RHFTextField name="address" label="Dirección" />
              <RHFPhoneNumber
                type="string"
                placeholder="Ej: 601 123 4567"
                defaultCountry="co"
                countryCodeEditable={false}
                onlyCountries={['co']}
                name="phone_number"
                label="Teléfono"
              />
              <RHFTextField name="description" label="Descripción" multiline rows={3} />
              <RHFTextField name="social_reason" label="Razón Social" />
              <RHFTextField
                name="quantity_employees"
                label="Cantidad de Empleados"
                type="number"
                inputProps={{ min: 1 }}
              />
              <RHFTextField name="economic_activity" label="Actividad Económica" />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                color="primary"
                type="submit"
                variant="contained"
                loading={isSubmitting || _isUpdatingCompany || _isUploadingLogo}
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
