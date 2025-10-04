import PropTypes from 'prop-types';
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
// components
import Iconify from 'src/components/iconify';
//
import { useAuthContext } from 'src/auth/hooks';
import { AddressListDialog } from 'src/sections/address';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';

// ----------------------------------------------------------------------

export default function BillNewEditAddress({ isSupplier = false }) {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext();

  const upMd = useResponsive('up', 'md');

  const values = watch();

  const { supplier_id } = values;

  const supplierDialog = useBoolean(false);

  const { company } = useAuthContext();

  const { data: allContacts = [] } = useGetContactsQuery({});

  const suppliers = allContacts.filter((contact) => contact.type && contact.type.includes('provider'));

  const selectedSupplier = suppliers.find((s) => s.id === supplier_id);

  return (
    <>
      <Stack spacing={{ xs: 3, md: 5 }} direction={{ xs: 'column', md: 'row' }} sx={{ p: 3 }}>
        <Stack sx={{ width: 1, maxWidth: '150px', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/assets/logo-placeholder-1.png" alt="logo" width="100px" height="100px" />
        </Stack>

        <Stack sx={{ width: 1 }}>
          <Stack spacing={1}>
            <Typography variant="h6">{company?.name || 'Mi Empresa'}</Typography>
            <Typography variant="body2">NIT: {company?.nit || 'N/A'}</Typography>
            <Typography variant="body2">Teléfono: {company?.phoneNumber || 'N/A'}</Typography>
          </Stack>
        </Stack>

        <Divider flexItem orientation={upMd ? 'vertical' : 'horizontal'} sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ width: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              Proveedor:
            </Typography>

            <IconButton onClick={supplierDialog.onTrue}>
              <Iconify icon={selectedSupplier ? 'solar:pen-bold' : 'mingcute:add-line'} />
            </IconButton>
          </Stack>

          {selectedSupplier ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">{selectedSupplier.name}</Typography>
              {selectedSupplier.document_number && (
                <Typography variant="body2">NIT: {selectedSupplier.document_number}</Typography>
              )}
              {selectedSupplier.billing_address?.address && (
                <Typography variant="body2">{selectedSupplier.billing_address.address}</Typography>
              )}
              {(selectedSupplier.mobile || selectedSupplier.phone_primary) && (
                <Typography variant="body2">
                  Tel: {selectedSupplier.mobile || selectedSupplier.phone_primary}
                </Typography>
              )}
              {selectedSupplier.email && <Typography variant="body2">{selectedSupplier.email}</Typography>}
            </Stack>
          ) : (
            <Typography typography="caption" sx={{ color: 'error.main' }}>
              {errors.supplier_id ? 'Proveedor requerido' : 'Seleccione un proveedor'}
            </Typography>
          )}
        </Stack>
      </Stack>

      <AddressListDialog
        title="Proveedores"
        open={supplierDialog.value}
        onClose={supplierDialog.onFalse}
        selected={(selectedId) => supplier_id === selectedId}
        onSelect={(contact) => setValue('supplier_id', contact.id)}
        list={suppliers}
        action={
          <Button
            color="primary"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ alignSelf: 'flex-end' }}
            onClick={() => {
              // TODO: Navigate to create supplier
              console.log('Create new supplier');
            }}
          >
            Nuevo Proveedor
          </Button>
        }
      />
    </>
  );
}

BillNewEditAddress.propTypes = {
  isSupplier: PropTypes.bool
};
