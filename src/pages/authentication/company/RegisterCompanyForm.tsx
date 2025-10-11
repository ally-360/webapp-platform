import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Alert, MenuItem, Stack, Typography, FormControlLabel, Switch, Box, Divider } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAuthContext } from 'src/auth/hooks';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import { RegisterCompanySchema } from 'src/interfaces/auth/yupSchemas';
import { RegisterCompany } from 'src/interfaces/auth/userInterfaces';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { setCompanyData, setCompanyResponse, goToNextStep } from 'src/redux/slices/stepByStepSlice';
import { economicActivityOptions, quantityEmployeesOptions } from './optionsCommon';

export default function RegisterCompanyForm() {
  const { enqueueSnackbar } = useSnackbar();
  const { createCompany } = useAuthContext();

  const dispatch = useAppDispatch();
  const companyData = useAppSelector((state) => state.stepByStep.companyData);
  const companyResponse = useAppSelector((state) => state.stepByStep.companyResponse);

  // Check if we're in edit mode (company already exists)
  const isEditing = !!companyResponse?.id;

  const defaultValues: RegisterCompany = {
    name: companyData?.name || companyResponse?.name || '',
    description: companyData?.description || companyResponse?.description || '',
    address: companyData?.address || companyResponse?.address || '',
    phone_number: companyData?.phone_number || companyResponse?.phone_number || '',
    nit: companyData?.nit || companyResponse?.nit || '',
    economic_activity: companyData?.economic_activity || companyResponse?.economic_activity || '',
    quantity_employees: companyData?.quantity_employees || companyResponse?.quantity_employees || '',
    social_reason: companyData?.social_reason || companyResponse?.social_reason || '',
    logo: companyData?.logo || companyResponse?.logo || null,
    uniquePDV: companyData?.uniquePDV || companyResponse?.uniquePDV || false
  };

  const [errorMsg, setErrorMsg] = useState('');

  const methods = useForm<RegisterCompany>({
    resolver: yupResolver(RegisterCompanySchema) as any,
    defaultValues
  });

  const { handleSubmit, formState, watch } = methods;
  const { isSubmitting } = formState;

  const uniquePDV = watch('uniquePDV');

  const onSubmit = handleSubmit(async (data: RegisterCompany) => {
    try {
      console.log('🏢 Submitting company form:', { isEditing, data });

      // First save form data to Redux for persistence
      dispatch(
        setCompanyData({
          ...data,
          logo: data.logo || undefined // Convert null to undefined
        })
      );

      if (isEditing) {
        // TODO: Implement company update logic if needed
        console.log('✏️ Company update not implemented yet');
        enqueueSnackbar('Funcionalidad de edición pendiente', { variant: 'warning' });
        return;
      }

      // Create new company
      await createCompany(data);

      // The company was created successfully, now update Redux with the response
      // The createCompany function in auth-provider.tsx will:
      // 1. Call createCompanyMutation()
      // 2. Call selectCompany() to get new token
      // 3. Set company in auth context

      // We also need to update Redux store for step-by-step persistence
      // We'll use the data that was sent since the auth-provider has the response
      dispatch(
        setCompanyResponse({
          id: '', // Will be updated when StepByStep loads company data
          name: data.name,
          description: data.description || '',
          address: data.address || '',
          phone_number: data.phone_number || '',
          nit: data.nit,
          economic_activity: data.economic_activity || '',
          quantity_employees: data.quantity_employees || '',
          social_reason: data.social_reason || '',
          logo: data.logo || '',
          uniquePDV: data.uniquePDV,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      );

      // Small delay to ensure Redux state is updated before navigation
      setTimeout(() => {
        // Show success message
        enqueueSnackbar(
          data.uniquePDV
            ? 'Empresa creada exitosamente. PDV principal generado automáticamente.'
            : 'Empresa creada exitosamente.',
          { variant: 'success' }
        );

        // Navigate to next step - goToNextStep handles uniquePDV logic automatically
        dispatch(goToNextStep());
      }, 100);
    } catch (error: any) {
      console.error('❌ Error creating company:', error);
      const errorMessage = error?.data?.detail || error?.message || 'Error al crear la empresa';
      setErrorMsg(errorMessage);
    }
  });

  const getButtonText = () => {
    if (isEditing) return 'Guardar cambios';
    if (uniquePDV) return 'Crear empresa y continuar';
    return 'Siguiente paso';
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack sx={{ marginTop: 1 }} spacing={3}>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <Typography variant="subtitle1" textAlign="center" sx={{ mb: 3 }}>
          {isEditing ? 'Editar información de la empresa' : 'Ingresa la información de la empresa'}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Nombre de la empresa" name="name" />
          <RHFTextField fullWidth label="Descripción" name="description" />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Dirección de la empresa" name="address" />
          <RHFPhoneNumber
            label="Teléfono"
            name="phone_number"
            type="string"
            autoComplete="tel"
            defaultCountry="co"
            onlyCountries={['co']}
            countryCodeEditable={false}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="NIT" name="nit" />
          <RHFTextField fullWidth label="Razón social" name="social_reason" />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFSelect fullWidth label="Cantidad de empleados" name="quantity_employees">
            {quantityEmployeesOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </RHFSelect>
          <RHFSelect fullWidth label="Actividad económica" name="economic_activity">
            {economicActivityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </RHFSelect>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={<Switch {...methods.register('uniquePDV')} checked={uniquePDV} color="primary" />}
            label={
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Punto de venta único
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {uniquePDV
                    ? 'Tu empresa tendrá un solo punto de venta que se creará automáticamente'
                    : 'Podrás configurar múltiples puntos de venta después'}
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', ml: 0 }}
          />
        </Box>
      </Stack>

      <LoadingButton
        color="primary"
        sx={{ marginTop: 8 }}
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        {getButtonText()}
      </LoadingButton>
    </FormProvider>
  );
}
