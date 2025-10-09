import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { Alert, Stack, Typography, MenuItem, FormControlLabel, Switch, Box, Divider } from '@mui/material';
import { LoadingButton } from '@mui/lab';

// hooks
import { useAppDispatch, useAppSelector } from 'src/hooks/store';

// components
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';

// interfaces & validation
import { RegisterCompanySchema } from 'src/interfaces/auth/yupSchemas';
import { CompanyFormData, CompanyResponse } from 'src/interfaces/stepByStep';

// redux
import {
  setCompanyData,
  setCompanyResponse,
  setLoading,
  setError,
  clearError,
  selectCompanyData,
  selectLoading,
  selectErrors
} from 'src/redux/slices/stepByStepSlice';

// RTK Query
import { useGetMyCompaniesQuery, useCreateCompanyMutation, useUpdateCompanyMutation } from 'src/redux/services/authApi';
import { useAuthContext } from 'src/auth/hooks';

// options
import { useEffect } from 'react';
import { economicActivityOptions, quantityEmployeesOptions } from './optionsCommon';

// ========================================
// 🏢 REGISTER COMPANY FORM - Refactored
// ========================================

export default function RegisterCompanyForm() {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { isFirstLogin } = useAuthContext();

  // RTK Query hooks
  // Evitar consultas de empresas en onboarding (first_login) para no disparar 404 y re-montajes
  const { data: myCompanies } = useGetMyCompaniesQuery(undefined, {
    skip: isFirstLogin === true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false
  });
  const [createCompany] = useCreateCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();

  // Redux state
  const companyData = useAppSelector(selectCompanyData);
  const loading = useAppSelector(selectLoading);
  const errors = useAppSelector(selectErrors);
  const companyResponse = useAppSelector((state) => state.stepByStep.companyResponse);

  // Determine if editing (has company from API) or creating new
  const firstCompany = myCompanies?.[0];
  const isEditing = !!firstCompany;

  // Form setup with values from API or Redux state
  const defaultValues: CompanyFormData = {
    name: firstCompany?.name || companyData?.name || '',
    description: firstCompany?.description || companyData?.description || '',
    address: firstCompany?.address || companyData?.address || '',
    phone_number: firstCompany?.phone_number || companyData?.phone_number || '',
    nit: firstCompany?.nit || companyData?.nit || '',
    economic_activity: firstCompany?.economic_activity || companyData?.economic_activity || '',
    quantity_employees: String(firstCompany?.quantity_employees || companyData?.quantity_employees || ''),
    social_reason: firstCompany?.social_reason || companyData?.social_reason || '',
    logo: firstCompany?.logo || companyData?.logo || '',
    uniquePDV: firstCompany?.uniquePDV ?? companyData?.uniquePDV ?? false
  };

  // Load company data into Redux when API data arrives
  useEffect(() => {
    if (firstCompany && !companyResponse) {
      console.log('🔄 Loading company from API:', firstCompany);

      // Set form data in Redux
      dispatch(
        setCompanyData({
          name: firstCompany.name || '',
          description: firstCompany.description || '',
          address: firstCompany.address || '',
          phone_number: firstCompany.phone_number || '',
          nit: firstCompany.nit || '',
          economic_activity: firstCompany.economic_activity || '',
          quantity_employees: String(firstCompany.quantity_employees || ''),
          social_reason: firstCompany.social_reason || '',
          logo: firstCompany.logo || '',
          uniquePDV: firstCompany.uniquePDV ?? false
        })
      );

      // Set company response to indicate it exists
      dispatch(
        setCompanyResponse({
          id: firstCompany.id,
          name: firstCompany.name || '',
          description: firstCompany.description || '',
          address: firstCompany.address || '',
          phone_number: firstCompany.phone_number || '',
          nit: firstCompany.nit || '',
          economic_activity: firstCompany.economic_activity || '',
          quantity_employees: String(firstCompany.quantity_employees || ''),
          social_reason: firstCompany.social_reason || '',
          logo: firstCompany.logo || '',
          uniquePDV: firstCompany.uniquePDV ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      );
    }
  }, [firstCompany, companyResponse, dispatch]);

  useEffect(() => {
    console.log('Company data changed:', companyData);
  }, [companyData]);

  const methods = useForm({
    resolver: yupResolver(RegisterCompanySchema),
    defaultValues,
    shouldFocusError: false
  });

  const {
    handleSubmit,
    watch,
    setError: setFormError,
    formState: { isSubmitting }
  } = methods;

  // Watch uniquePDV value for UI changes
  const uniquePDV = watch('uniquePDV');

  // Button text helper
  const getButtonText = () => {
    if (isEditing) {
      return uniquePDV ? 'Actualizar empresa y continuar' : 'Actualizar empresa';
    }
    return uniquePDV ? 'Crear empresa y continuar' : 'Crear empresa';
  };

  const onSubmit = handleSubmit(async (data: CompanyFormData) => {
    try {
      dispatch(clearError('company'));
      dispatch(setLoading({ step: 'company', loading: true }));

      console.log('🏢 Creating company with data:', data);

      // Save form data to Redux
      dispatch(setCompanyData(data));

      // Adaptar datos al formato esperado por createCompany (RegisterCompany)
      const companyPayload = {
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        phone_number: data.phone_number || '',
        nit: data.nit || '',
        economic_activity: data.economic_activity || '',
        quantity_employees: String(data.quantity_employees || ''),
        social_reason: data.social_reason || '',
        logo: data.logo || null,
        uniquePDV: data.uniquePDV
      };

      // Si ya existe una empresa, hacer PATCH (update), si no, POST (create)
      let response;
      if (firstCompany?.id) {
        // Editar empresa existente
        response = await updateCompany({ id: firstCompany.id, data: companyPayload }).unwrap();
        enqueueSnackbar('Empresa actualizada exitosamente.', { variant: 'success' });
      } else {
        // Crear nueva empresa
        response = await createCompany(companyPayload).unwrap();
        enqueueSnackbar(
          data.uniquePDV
            ? 'Empresa creada exitosamente. PDV principal generado automáticamente.'
            : 'Empresa creada exitosamente.',
          { variant: 'success' }
        );
      }

      // Guardar respuesta real en Redux si existe
      if (response && response.id) {
        dispatch(
          setCompanyResponse({
            ...response,
            uniquePDV: data.uniquePDV
          })
        );
      } else {
        // Fallback: respuesta mock
        const mockResponse: CompanyResponse = {
          id: 'temp-id',
          name: data.name,
          description: data.description,
          address: data.address,
          phone_number: data.phone_number,
          nit: data.nit,
          economic_activity: data.economic_activity,
          quantity_employees: data.quantity_employees,
          social_reason: data.social_reason,
          logo: data.logo,
          uniquePDV: data.uniquePDV,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        dispatch(setCompanyResponse(mockResponse));
      }
    } catch (error: any) {
      console.error('❌ Company creation error:', error);

      let errorMessage = 'Error creando la empresa';

      // Handle validation errors from API
      if (error?.data?.detail && Array.isArray(error.data.detail)) {
        // Set specific field errors
        error.data.detail.forEach((err: any) => {
          if (err.loc && err.loc[1]) {
            const fieldName = err.loc[1]; // Get field name from error location
            const errorMsg = err.msg || 'Error de validación';
            setFormError(fieldName, { message: errorMsg });
          }
        });

        const validationErrors = error.data.detail.map((err: any) => err.msg || 'Error de validación').join(', ');
        errorMessage = `Errores de validación: ${validationErrors}`;
      } else if (error?.data?.detail && typeof error.data.detail === 'string') {
        errorMessage = error.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      dispatch(setError({ step: 'company', error: errorMessage }));
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      dispatch(setLoading({ step: 'company', loading: false }));
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3} sx={{ mt: 1 }}>
        {/* Error Alert */}
        {errors.company && <Alert severity="error">{errors.company}</Alert>}

        {/* Header */}
        <Typography variant="subtitle1" textAlign="center" sx={{ mb: 3 }}>
          {isEditing ? 'Editar información de tu empresa' : 'Configura la información de tu empresa'}
        </Typography>

        {/* Company Basic Info */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Nombre de la empresa" name="name" placeholder="Ej: Mi Empresa SAS" />
          <RHFTextField
            fullWidth
            label="NIT"
            name="nit"
            placeholder="Ej: 901886184"
            // helperText="NIT colombiano de 8-9 dígitos (sin dígito de verificación)"
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField
            fullWidth
            label="Razón social *"
            name="social_reason"
            placeholder="Ej: Mi Empresa Sociedad por Acciones Simplificada"
          />
          <RHFTextField
            fullWidth
            label="Descripción *"
            name="description"
            placeholder="Ej: Comercialización de productos tecnológicos"
          />
        </Stack>

        {/* Contact Info */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Dirección *" name="address" placeholder="Ej: Calle 123 #45-67, Bogotá" />
          <RHFPhoneNumber
            label="Teléfono *"
            name="phone_number"
            type="string"
            autoComplete="tel"
            defaultCountry="co"
            onlyCountries={['co']}
            countryCodeEditable={false}
            placeholder="Ej: +57 300 123 4567"
          />
        </Stack>

        {/* Business Details */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFSelect
            fullWidth
            label="Cantidad de empleados *"
            name="quantity_employees"
            placeholder="Selecciona el rango"
          >
            {quantityEmployeesOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </RHFSelect>

          <RHFSelect
            fullWidth
            label="Actividad económica *"
            name="economic_activity"
            placeholder="Selecciona tu sector"
          >
            {economicActivityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </RHFSelect>
        </Stack>

        {/* Unique PDV Option */}
        <Box sx={{ mt: 3 }}>
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

        {/* Submit Button */}
        <LoadingButton
          color="primary"
          sx={{ mt: 4 }}
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting || loading.company}
        >
          {getButtonText()}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
