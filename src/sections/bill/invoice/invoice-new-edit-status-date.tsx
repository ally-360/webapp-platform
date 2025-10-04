import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
// components
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { useGetPDVsQuery } from 'src/redux/services/pdvsApi';
import { useGetNextInvoiceNumberQuery } from 'src/redux/services/invoicesApi';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

export default function InvoiceNewEditStatusDate() {
  const { control, watch, setValue } = useFormContext();

  const values = watch();

  // Get PDVs and next invoice number
  const { data: pdvs = [] } = useGetPDVsQuery();
  const { data: nextNumberData } = useGetNextInvoiceNumberQuery(values.pdvId || '', {
    skip: !values.pdvId
  });

  useEffect(() => {
    if (values.method === 'Contado') {
      setValue('status', 'pagado');
    } else {
      setValue('status', 'pendiente');
    }
  }, [values.method, setValue]);

  // Update invoice number when PDV changes
  useEffect(() => {
    if (nextNumberData?.number) {
      setValue('invoiceNumber', nextNumberData.number);
    }
  }, [nextNumberData, setValue]);

  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 3, bgcolor: 'background.neutral' }}>
      {/* PDV Selection */}
      <RHFSelect
        fullWidth
        name="pdvId"
        label="Punto de Venta"
        InputLabelProps={{ shrink: true }}
        PaperPropsSx={{ textTransform: 'capitalize' }}
      >
        {pdvs.map((pdv) => (
          <MenuItem key={pdv.id} value={pdv.id}>
            {pdv.name}
          </MenuItem>
        ))}
      </RHFSelect>

      <RHFTextField disabled name="invoiceNumber" label="Número de factura" value={values.invoiceNumber} />

      <RHFSelect
        fullWidth
        name="method"
        label="Método de pago"
        InputLabelProps={{ shrink: true }}
        PaperPropsSx={{ textTransform: 'capitalize' }}
      >
        {['Contado', 'Credito'].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </RHFSelect>

      <Controller
        name="createDate"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            label="Fecha"
            value={field.value || new Date()}
            onChange={(newValue) => {
              field.onChange(newValue);
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error?.message
              }
            }}
          />
        )}
      />
      {values.method === 'Credito' && (
        <>
          {/* Plazo de pago */}
          <RHFSelect
            fullWidth
            name="paymentTerm"
            label="Plazo de pago"
            placeholder="15 días"
            InputLabelProps={{ shrink: true }}
            PaperPropsSx={{ textTransform: 'capitalize' }}
            // Actualizar automaticamente la fecha de vencimiento dependiendo el plazo de dias
            onChange={(e) => {
              setValue('paymentTerm', e.target.value);
              const dueDate = new Date(values.createDate);
              switch (e.target.value) {
                case '15 días':
                  dueDate.setDate(dueDate.getDate() + 15);
                  break;
                case '30 días':
                  dueDate.setDate(dueDate.getDate() + 30);
                  break;
                case '60 días':
                  dueDate.setDate(dueDate.getDate() + 60);
                  break;
                case '90 días':
                  dueDate.setDate(dueDate.getDate() + 90);
                  break;
                default:
                  break;
              }
              setValue('dueDate', dueDate);
            }}
          >
            {['15 días', '30 días', '60 días', '90 días'].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </RHFSelect>
          <Controller
            name="dueDate"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                label="Vencimiento"
                value={field.value || null}
                onChange={(newValue) => {
                  field.onChange(newValue);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error?.message
                  }
                }}
              />
            )}
          />
        </>
      )}
      {values.method === 'Contado' && (
        <RHFSelect
          fullWidth
          name="paymentMethod"
          label="Método de pago"
          InputLabelProps={{ shrink: true }}
          PaperPropsSx={{ textTransform: 'capitalize' }}
        >
          {['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia bancaria'].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </RHFSelect>
      )}
    </Stack>
  );
}
