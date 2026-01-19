import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { useAuthContext } from 'src/auth/hooks';
// components
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// api
import { useGetPDVsQuery } from 'src/redux/services/pdvsApi';
import Chip from '@mui/material/Chip';
import { useGetSellersQuery } from 'src/redux/services/sellersApi';
// hooks
import { useProgressiveContacts } from './hooks/use-progressive-contacts';

// ----------------------------------------------------------------------

export default function QuoteNewEditAddress() {
  const { watch, setValue } = useFormContext();

  const upMd = useResponsive('up', 'md');
  const { company } = useAuthContext();

  const values = watch();

  // Obtener datos de clientes con scroll infinito
  const {
    contacts: customersOptions,
    setSearch: setCustomerSearch,
    isFetching: isFetchingCustomers,
    listboxProps: customerListboxProps
  } = useProgressiveContacts({
    limit: 100,
    type: 'client'
  });

  // Obtener datos de PDVs y vendedores
  const { data: pdvs = [] } = useGetPDVsQuery();
  const { data: sellers = [], isFetching: isFetchingSellers } = useGetSellersQuery({
    active_only: false,
    limit: 1000,
    offset: 0
  });

  // Procesar datos de la API
  const pdvsOptions = useMemo(() => (Array.isArray(pdvs) ? pdvs : []), [pdvs]);
  const sellersOptions = Array.isArray(sellers) ? sellers : [];

  useEffect(() => {
    if (!values.pdv_id && pdvsOptions.length === 1) {
      setValue('pdv_id', pdvsOptions[0].id);
    }
  }, [pdvsOptions, setValue, values.pdv_id]);

  return (
    <>
      <Stack
        spacing={{ xs: 3, md: 5 }}
        direction={{ xs: 'column', md: 'row' }}
        divider={<Divider flexItem orientation={upMd ? 'vertical' : 'horizontal'} sx={{ borderStyle: 'dashed' }} />}
        sx={{ p: 3 }}
      >
        {/* Información de la empresa */}
        <Stack sx={{ width: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled', mb: 2 }}>
            De:
          </Typography>
          <Stack spacing={1}>
            <Typography variant="subtitle2">{company?.name}</Typography>
            <Typography variant="body2">NIT: {company?.nit}</Typography>
            <Typography variant="body2">Tel: {company?.phone_number}</Typography>
            <Typography variant="body2">{company?.address}</Typography>
          </Stack>
        </Stack>

        {/* Cliente */}
        <Stack sx={{ width: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled', mb: 2 }}>
            Para: *
          </Typography>
          <Autocomplete
            fullWidth
            options={customersOptions}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={values.customer || null}
            onChange={(event, newValue) => {
              setValue('customer', newValue);
            }}
            onInputChange={(event, newInputValue) => {
              setCustomerSearch(newInputValue);
            }}
            loading={isFetchingCustomers}
            ListboxProps={customerListboxProps}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Seleccionar cliente"
                error={!values.customer}
                helperText={!values.customer ? 'Cliente es requerido' : ''}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isFetchingCustomers ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Stack>
                  <Typography variant="subtitle2">{option.name}</Typography>
                  {option.email && (
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  )}
                </Stack>
              </li>
            )}
          />
          {values.customer && (
            <Stack spacing={0.5} sx={{ mt: 2 }}>
              <Typography variant="body2">
                Identificación:{' '}
                {values.customer.id_type && values.customer.id_number
                  ? `${values.customer.id_type} ${values.customer.id_number}`
                  : 'N/A'}
              </Typography>
              {values.customer.email && <Typography variant="body2">Email: {values.customer.email}</Typography>}
              {(values.customer.mobile || values.customer.phone_primary) && (
                <Typography variant="body2">Tel: {values.customer.mobile || values.customer.phone_primary}</Typography>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* PDV, Vendedor y Fechas */}
      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {/* PDV */}
          <RHFSelect fullWidth name="pdv_id" label="Punto de Venta *" InputLabelProps={{ shrink: true }}>
            <MenuItem value="">Seleccionar PDV</MenuItem>
            {pdvsOptions.map((pdv) => (
              <MenuItem key={pdv.id} value={pdv.id}>
                {pdv.name}
              </MenuItem>
            ))}
          </RHFSelect>

          {/* Vendedor */}
          <RHFSelect
            fullWidth
            name="seller_id"
            label="Vendedor *"
            InputLabelProps={{ shrink: true }}
            disabled={isFetchingSellers}
          >
            <MenuItem value="">Seleccionar vendedor</MenuItem>
            {sellersOptions.map((seller) => (
              <MenuItem key={seller.id} value={seller.id}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 1 }}>
                  <Typography variant="body2" noWrap>
                    {seller.full_name || `${seller.first_name || ''} ${seller.last_name || ''}`.trim() || seller.email}
                  </Typography>
                  {seller.is_invitation_pending ? (
                    <Chip size="small" label="Invitación pendiente" variant="outlined" color="warning" />
                  ) : null}
                </Stack>
              </MenuItem>
            ))}
          </RHFSelect>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {/* Fecha de emisión */}
          <DatePicker
            label="Fecha de Emisión *"
            value={values.issue_date}
            onChange={(newValue) => setValue('issue_date', newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !values.issue_date
              }
            }}
          />

          {/* Fecha de vencimiento */}
          <DatePicker
            label="Fecha de Vencimiento *"
            value={values.expiration_date}
            onChange={(newValue) => setValue('expiration_date', newValue)}
            minDate={values.issue_date}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !values.expiration_date
              }
            }}
          />
        </Stack>

        {/* Moneda (fija en COP) */}
        <RHFTextField
          name="currency"
          label="Moneda"
          disabled
          value="COP"
          InputLabelProps={{ shrink: true }}
          helperText="La moneda está fija en COP (Pesos colombianos)"
        />
      </Stack>
    </>
  );
}
