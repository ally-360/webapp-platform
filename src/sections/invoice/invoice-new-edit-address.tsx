import { useFormContext } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// api
import { useGetContactsForInvoicesQuery } from 'src/redux/services/contactsApi';
// components
import Iconify from 'src/components/iconify';
//
import { useAuthContext } from 'src/auth/hooks';
import logoPlaceholder from '../../../public/assets/logo-placeholder-1.png';
import { AddressListDialog } from '../address';
// ----------------------------------------------------------------------

export default function InvoiceNewEditAddress() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext();

  const upMd = useResponsive('up', 'md');
  const values = watch();
  const { invoiceFrom, invoiceTo } = values;
  const from = useBoolean(false);
  const to = useBoolean(false);
  const { company } = useAuthContext();

  // Get contacts for invoices (clients)
  const { data: contacts = [] } = useGetContactsForInvoicesQuery({});

  return (
    <>
      <Stack spacing={{ xs: 3, md: 5 }} direction={{ xs: 'column', md: 'row' }} sx={{ p: 3 }}>
        <Stack sx={{ width: 1, maxWidth: '150px', justifyContent: 'center', alignItems: 'center' }}>
          <img src={logoPlaceholder} alt="logo" width="100px" height="100px" />
        </Stack>

        <Stack sx={{ width: 1 }}>
          {/* <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              From:
            </Typography>

            <IconButton onClick={from.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Stack> */}
          <Stack spacing={1}>
            <Typography variant="h6">{company?.name}</Typography>
            <Typography variant="body2">Identificación: {company?.nit}</Typography>
            <Typography variant="body2">Teléfono: {company?.phoneNumber}</Typography>
          </Stack>
        </Stack>
        <Divider flexItem orientation={upMd ? 'vertical' : 'horizontal'} sx={{ borderStyle: 'dashed' }} />
        <Stack sx={{ width: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              Cliente:
            </Typography>

            <IconButton onClick={to.onTrue}>
              <Iconify icon={invoiceTo ? 'solar:pen-bold' : 'mingcute:add-line'} />
            </IconButton>
          </Stack>

          {invoiceTo ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">{invoiceTo.name}</Typography>
              <Typography variant="body2">{invoiceTo.fullAddress}</Typography>
              <Typography variant="body2"> {invoiceTo.phoneNumber}</Typography>
            </Stack>
          ) : (
            <Typography typography="caption" sx={{ color: 'error.main' }}>
              {errors.invoiceTo?.message as string}
            </Typography>
          )}
        </Stack>
      </Stack>

      <AddressListDialog
        title="Customers"
        open={from.value}
        onClose={from.onFalse}
        selected={(selectedId) => invoiceFrom?.id === selectedId}
        onSelect={(address) => setValue('invoiceFrom', address)}
        list={contacts}
        action={
          <Button size="small" startIcon={<Iconify icon="mingcute:add-line" />} sx={{ alignSelf: 'flex-end' }}>
            Nuevo
          </Button>
        }
      />

      <AddressListDialog
        title="Clientes"
        open={to.value}
        onClose={to.onFalse}
        selected={(selectedId) => invoiceTo?.id === selectedId}
        onSelect={(address) => setValue('invoiceTo', address)}
        list={contacts}
        action={
          <Button
            color="primary"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ alignSelf: 'flex-end' }}
          >
            Crear
          </Button>
        }
      />
    </>
  );
}
