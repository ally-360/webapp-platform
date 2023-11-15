import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material';
import React, { useState } from 'react';
// ----------------------------------------------------------------------

interface RHFSelectProps {
  // Name es solo para el controlador de React Hook Form, no permite modificar el valor, solo es de lectura.
  readonly name: string;
  native?: boolean;
  maxHeight?: number;
  helperText?: string;
  children?: React.ReactNode;
  PaperPropsSx?: object;
  [x: string]: unknown;
}

export function RHFSelect({
  name,
  native,
  maxHeight = 220,
  helperText,
  children,
  PaperPropsSx,
  ...other
}: RHFSelectProps) {
  const { control } = useFormContext();
  const theme = useTheme(); // Obtiene el tema actual de Material-UI
  const [isFocused, setIsFocused] = useState(false); // Estado para rastrear el focus
  console.log('isFocused', isFocused);
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          fullWidth
          SelectProps={{
            native,
            MenuProps: {
              PaperProps: {
                sx: {
                  ...(!native && {
                    maxHeight: typeof maxHeight === 'number' ? maxHeight : 'unset'
                  }),
                  ...PaperPropsSx
                }
              }
            },
            sx: { textTransform: 'capitalize' }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
          onFocus={() => setIsFocused(true)} // Establece isFocused a true cuando se hace focus
          onBlur={() => setIsFocused(false)} // Establece isFocused a false cuando se pierde el focus
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isFocused ? theme.palette.primary.main : '#ced4da' // Usa el color primario del tema cuando se hace focus
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main
              }
            },
            '& label.Mui-focused': {
              color: `${theme.palette.primary.main}!important` // Cambia el color del label cuando se hace focus
            }
          }}
        >
          {children}
        </TextField>
      )}
    />
  );
}

// ----------------------------------------------------------------------

interface RHFAutocompleteProps {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  checkbox?: boolean;
  helperText?: string;
  chip?: boolean;
  sx?: object;
  [x: string]: unknown;
}

export function RHFMultiSelect({
  name,
  chip,
  label,
  options,
  checkbox,
  placeholder,
  helperText,
  sx,
  ...other
}: RHFAutocompleteProps) {
  const { control } = useFormContext();

  const renderValues = (selectedIds: string) => {
    const selectedItems = options.filter((item) => selectedIds.includes(item.value));

    if (!selectedItems.length && placeholder) {
      return (
        <Box component="em" sx={{ color: 'text.disabled' }}>
          {placeholder}
        </Box>
      );
    }

    if (chip) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selectedItems.map((item) => (
            <Chip key={item.value} size="small" label={item.label} />
          ))}
        </Box>
      );
    }

    return selectedItems.map((item) => item.label).join(', ');
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={sx}>
          {label && <InputLabel id={name}> {label} </InputLabel>}

          <Select
            {...field}
            multiple
            displayEmpty={!!placeholder}
            labelId={name}
            input={<OutlinedInput fullWidth label={label} error={!!error} />}
            renderValue={renderValues}
            {...other}
          >
            {placeholder && (
              <MenuItem disabled value="">
                <em> {placeholder} </em>
              </MenuItem>
            )}

            {options.map((option) => {
              const selected = field.value.includes(option.value);

              return (
                <MenuItem key={option.value} value={option.value}>
                  {checkbox && <Checkbox size="small" disableRipple checked={selected} />}

                  {option.label}
                </MenuItem>
              );
            })}
          </Select>

          {(!!error || helperText) && (
            <FormHelperText error={!!error}>{error ? error?.message : helperText}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
}
