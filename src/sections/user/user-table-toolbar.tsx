import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { getAllMunicipios } from 'src/redux/inventory/locationsSlice';
import { Autocomplete, FormControl } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
// ----------------------------------------------------------------------

export default function UserTableToolbar({
  filters,
  onFilters,
  //
  roleOptions
}) {
  const popover = usePopover();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterMunicipio = useCallback(
    (event, value) => {
      console.log(value);
      onFilters('municipio', value || '');
    },
    [onFilters]
  );
  useEffect(() => {
    dispatch(getAllMunicipios());
  }, [dispatch]);
  const { locations } = useAppSelector((state) => state.locations);

  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    // Set towns in locations
    const towns = locations.flatMap((department) =>
      department.towns.map((town) => ({
        name: town.name,
        id: town.id
      }))
    );
    setMunicipios(towns);
  }, [locations]);

  const [searchQueryMunicipio, setSearchQueryMunicipio] = useState('');

  const handleInputMunicipioChange = (event, value) => {
    setSearchQueryMunicipio(value ? value.name : '');
    console.log(value);
    handleFilterMunicipio(event, value);
  };

  const isOptionEqualToValue = (option, value = '') => {
    if (option && value) {
      return option.id === value.id && option.name === value.name;
    }
    return false;
  };

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row'
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Buscar por nombre o razón social"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 }
          }}
        >
          <Autocomplete
            fullWidth
            // onInputChange={handleInputMunicipioChange}
            onChange={(event, value) => {
              handleInputMunicipioChange(event, value);
            }}
            value={filters.municipio || ''}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={(option) => (option.name ? option.name : '')}
            options={municipios}
            renderInput={(params) => <TextField {...params} label="Municipio" margin="none" />}
          />
        </FormControl>
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 140 }}>
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}

UserTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array
};
