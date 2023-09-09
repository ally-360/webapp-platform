import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useDispatch, useSelector } from 'react-redux';
import { getAllMunicipios } from 'src/redux/inventory/locationsSlice';
import { Autocomplete, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function UserTableToolbar({
  filters,
  onFilters,
  //
  roleOptions
}) {
  const popover = usePopover();
  const dispatch = useDispatch();
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
  const { locations } = useSelector((state) => state.locations);

  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    console.log(locations);
    // Set towns in locations
    const towns = locations.flatMap((department) =>
      department.towns.map((town) => ({
        name: town.name,
        id: town.id
      }))
    );

    setMunicipios(towns);
    console.log(towns);
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
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
          />

          <FormControl
            sx={{
              flexShrink: 0,
              width: { xs: 1, md: 200 }
            }}
          >
            {/* <Select
              multiple
              value={filters.role}
              onChange={handleFilterRole}
              input={<OutlinedInput label="Role" />}
              renderValue={(selected) => selected.map((value) => value).join(', ')}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 240 }
                }
              }}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox disableRipple size="small" checked={filters.role.includes(option)} />
                  {option}
                </MenuItem>
              ))}
            </Select> */}

            <Autocomplete
              name="municipio"
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
              // renderOption={(props, option) => {
              //   const matches = match(option.name, searchQueryMunicipio);
              //   const parts = parse(option.name, matches);

              //   return (
              //     <li {...props}>
              //       <Box sx={{ typography: 'body2', display: 'flex', alignItems: 'center' }}>
              //         <Typography variant="body2" color="text.primary">
              //           {parts.map((part, index) => (
              //             <span
              //               key={index}
              //               style={{
              //                 fontWeight: part.highlight ? 700 : 400,
              //                 color: part.highlight ? theme.palette.primary.main : 'inherit'
              //               }}
              //             >
              //               {part.text}
              //             </span>
              //           ))}
              //         </Typography>
              //       </Box>
              //     </li>
              //   );
              // }}
              noOptionsText={
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
                  {municipios.length === 0
                    ? 'Seleciona un departamento'
                    : `No hay resultados para ${searchQueryMunicipio}`}
                </Typography>
              }
            />
          </FormControl>

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
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
