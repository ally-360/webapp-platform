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
import { CompanyFormSchema } from 'src/interfaces/auth/yupSchemas';
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
  selectErrors,
  goToNextStep
} from 'src/redux/slices/stepByStepSlice';

// RTK Query
import { useGetMyCompaniesQuery, useCreateCompanyMutation, useUpdateCompanyMutation } from 'src/redux/services/authApi';

// options
import { useEffect } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { economicActivityOptions, quantityEmployeesOptions } from './optionsCommon';

// ========================================
// 🏢 REGISTER COMPANY FORM - Refactored
// ========================================

export default function RegisterCompanyForm() {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { selectCompany } = useAuthContext();

  // RTK Query hooks
  // En step-by-step, permitir la consulta para cargar datos existentes
  const { data: myCompanies } = useGetMyCompaniesQuery(undefined, {
    skip: false, // Permitir la consulta para detectar si hay empresa existente
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
    name: String(firstCompany?.name || companyData?.name || ''),
    description: String(firstCompany?.description || companyData?.description || ''),
    address: String(firstCompany?.address || companyData?.address || ''),
    phone_number: String(firstCompany?.phone_number || companyData?.phone_number || ''),
    nit: String(firstCompany?.nit || companyData?.nit || ''),
    economic_activity: String(firstCompany?.economic_activity || companyData?.economic_activity || ''),
    quantity_employees: String(firstCompany?.quantity_employees || companyData?.quantity_employees || ''),
    social_reason: String(firstCompany?.social_reason || companyData?.social_reason || ''),
    logo: String(firstCompany?.logo || companyData?.logo || ''),
    uniquePDV: Boolean(firstCompany?.uniquePDV ?? companyData?.uniquePDV ?? false)
  };

  const methods = useForm<CompanyFormData>({
    resolver: yupResolver(CompanyFormSchema as any),
    defaultValues,
    shouldFocusError: false
  });

  const {
    handleSubmit,
    watch,
    reset,
    setError: setFormError,
    formState: { isSubmitting }
  } = methods;

  // Load company data into Redux when API data arrives
  useEffect(() => {
    if (firstCompany && !companyResponse) {
      console.log('🔄 Loading company from API:', firstCompany);

      // Create a deep copy to avoid immutability issues
      const companyFormData: CompanyFormData = {
        name: String(firstCompany.name || ''),
        description: String(firstCompany.description || ''),
        address: String(firstCompany.address || ''),
        phone_number: String(firstCompany.phone_number || ''),
        nit: String(firstCompany.nit || ''),
        economic_activity: String(firstCompany.economic_activity || ''),
        quantity_employees: String(firstCompany.quantity_employees || ''),
        social_reason: String(firstCompany.social_reason || ''),
        logo: String(firstCompany.logo || ''),
        uniquePDV: Boolean(firstCompany.uniquePDV ?? false)
      };

      // Set form data in Redux
      dispatch(setCompanyData(companyFormData));

      // Reset form with copied data to avoid read-only issues
      reset(companyFormData);

      // Set company response to indicate it exists
      const companyResponseData: CompanyResponse = {
        id: String(firstCompany.id),
        name: String(firstCompany.name || ''),
        description: String(firstCompany.description || ''),
        address: String(firstCompany.address || ''),
        phone_number: String(firstCompany.phone_number || ''),
        nit: String(firstCompany.nit || ''),
        economic_activity: String(firstCompany.economic_activity || ''),
        quantity_employees: String(firstCompany.quantity_employees || ''),
        social_reason: String(firstCompany.social_reason || ''),
        logo: String(firstCompany.logo || ''),
        uniquePDV: Boolean(firstCompany.uniquePDV ?? false),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      dispatch(setCompanyResponse(companyResponseData));
    }
  }, [firstCompany, companyResponse, dispatch, reset]);

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

      // Create a clean copy of form data to avoid read-only issues
      const cleanData: CompanyFormData = {
        name: String(data.name || ''),
        description: String(data.description || ''),
        address: String(data.address || ''),
        phone_number: String(data.phone_number || ''),
        nit: String(data.nit || ''),
        economic_activity: String(data.economic_activity || ''),
        quantity_employees: String(data.quantity_employees || ''),
        social_reason: String(data.social_reason || ''),
        logo: String(data.logo || ''),
        uniquePDV: Boolean(data.uniquePDV)
      };

      // Save form data to Redux
      dispatch(setCompanyData(cleanData));

      // Adaptar datos al formato esperado por createCompany (RegisterCompany)
      const companyPayload = {
        name: cleanData.name,
        description: cleanData.description,
        address: cleanData.address,
        phone_number: cleanData.phone_number,
        nit: cleanData.nit,
        economic_activity: cleanData.economic_activity,
        quantity_employees: cleanData.quantity_employees,
        social_reason: cleanData.social_reason,
        logo: cleanData.logo || null,
        uniquePDV: cleanData.uniquePDV
      };

      let response: any;
      if (firstCompany?.id) {
        response = await updateCompany({ id: firstCompany.id, data: companyPayload }).unwrap();
        enqueueSnackbar('Empresa actualizada exitosamente.', { variant: 'success' });
      } else {
        response = await createCompany(companyPayload).unwrap();
        enqueueSnackbar(
          cleanData.uniquePDV
            ? 'Empresa creada exitosamente. PDV principal generado automáticamente.'
            : 'Empresa creada exitosamente.',
          { variant: 'success' }
        );
      }

      try {
        const companyIdToSelect = response?.id || firstCompany?.id;
        if (companyIdToSelect) {
          await selectCompany(companyIdToSelect, false);
          console.log('✅ Empresa seleccionada y token actualizado (tenant)');
        }
        console.log('ℹ️ No se seleccionó ninguna empresa (no hay ID disponible)');
      } catch (selectErr) {
        console.error('❌ Error al seleccionar empresa tras registro/edición:', selectErr);
      }

      if (response && response.id) {
        const responseData: CompanyResponse = {
          id: String(response.id),
          name: String(response.name || cleanData.name),
          description: String(response.description || cleanData.description),
          address: String(response.address || cleanData.address),
          phone_number: String(response.phone_number || cleanData.phone_number),
          nit: String(response.nit || cleanData.nit),
          economic_activity: String(response.economic_activity || cleanData.economic_activity),
          quantity_employees: String(response.quantity_employees || cleanData.quantity_employees),
          social_reason: String(response.social_reason || cleanData.social_reason),
          logo: String(response.logo || cleanData.logo),
          uniquePDV: Boolean(cleanData.uniquePDV),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        dispatch(setCompanyResponse(responseData));
      } else {
        const mockResponse: CompanyResponse = {
          id: 'temp-id',
          name: cleanData.name,
          description: cleanData.description,
          address: cleanData.address,
          phone_number: cleanData.phone_number,
          nit: cleanData.nit,
          economic_activity: cleanData.economic_activity,
          quantity_employees: cleanData.quantity_employees,
          social_reason: cleanData.social_reason,
          logo: cleanData.logo,
          uniquePDV: cleanData.uniquePDV,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        dispatch(setCompanyResponse(mockResponse));
      }

      dispatch(goToNextStep());
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
