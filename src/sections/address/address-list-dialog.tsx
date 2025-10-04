import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton, { listItemButtonClasses } from '@mui/material/ListItemButton';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
// ----------------------------------------------------------------------

export default function AddressListDialog({
  title = 'Directorio de Direcciones',
  list: _list,
  action,
  //
  open,
  onClose,
  //
  selected,
  onSelect
}) {
  const [searchAddress, setSearchAddress] = useState('');
  const { data: contacts = [] } = useGetContactsQuery({});

  const dataFiltered = applyFilter({
    inputData: contacts,
    query: searchAddress
  });

  const notFound = !dataFiltered.length && !!searchAddress;

  const handleSearchAddress = useCallback((event) => {
    setSearchAddress(event.target.value);
  }, []);

  const handleSelectAddress = useCallback(
    (contact) => {
      onSelect(contact);
      setSearchAddress('');
      onClose();
    },
    [onClose, onSelect]
  );

  const renderList = (
    <Stack
      spacing={0.5}
      sx={{
        p: 0.5,
        maxHeight: 80 * 8,
        overflowX: 'hidden'
      }}
    >
      {dataFiltered.map((contact) => (
        <Stack
          key={contact.id}
          spacing={0.5}
          component={ListItemButton}
          selected={selected(`${contact.id}`)}
          onClick={() => handleSelectAddress(contact)}
          sx={{
            py: 1,
            px: 1.5,
            borderRadius: 1,
            flexDirection: 'column',
            alignItems: 'flex-start',
            [`&.${listItemButtonClasses.selected}`]: {
              bgcolor: 'action.selected',
              '&:hover': {
                bgcolor: 'action.selected'
              }
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2">{contact.name}</Typography>

            {contact.type?.includes('provider') && <Label color="info">Proveedor</Label>}
          </Stack>

          {contact.email && <Box sx={{ color: 'primary.main', typography: 'caption' }}>{contact.email}</Box>}

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {contact.billing_address?.address || contact.shipping_address?.address || 'Sin dirección'}
          </Typography>

          {(contact.mobile || contact.phone_primary) && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {contact.mobile || contact.phone_primary}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3, pr: 1.5 }}>
        <Typography variant="h6"> {title} </Typography>

        {action && action}
      </Stack>

      <Stack sx={{ p: 2, pt: 0 }}>
        <TextField
          value={searchAddress}
          onChange={handleSearchAddress}
          placeholder="Buscar dirección..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            )
          }}
        />
      </Stack>

      {notFound ? <SearchNotFound query={searchAddress} sx={{ px: 3, pt: 5, pb: 10 }} /> : renderList}
    </Dialog>
  );
}

AddressListDialog.propTypes = {
  action: PropTypes.node,
  list: PropTypes.array,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  open: PropTypes.bool,
  selected: PropTypes.func,
  title: PropTypes.string
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, query }) {
  if (query) {
    return inputData.filter(
      (contact) =>
        contact.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        (contact.billing_address?.address || '').toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        (contact.shipping_address?.address || '').toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        `${contact.email || ''}`.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }

  return inputData;
}
