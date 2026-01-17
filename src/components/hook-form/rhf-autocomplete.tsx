import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useTheme } from '@mui/material';
import { useState } from 'react';

// ----------------------------------------------------------------------

interface RHFAutocompleteProps {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  options: any[];
  onChange?: (event: any, value: any) => void;
  [key: string]: any; // Permite pasar otras propiedades adicionales
}

export default function RHFAutocomplete({
  name,
  label,
  placeholder,
  helperText,
  options,
  onChange: onChangeProp,
  ...other
}: RHFAutocompleteProps) {
  const { control, setValue } = useFormContext();
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const { value, onChange, ...restField } = field;
        // MUI Autocomplete expects `null` when there's no selection (not `{}` or `undefined`)
        const safeValue = value && Object.keys(value || {}).length > 0 ? value : null;

        return (
          <Autocomplete
            {...restField}
            value={safeValue}
            onChange={(event, newValue) => {
              setValue(name, newValue ?? null, { shouldValidate: true });
              onChange(newValue ?? null);
              onChangeProp?.(event, newValue ?? null);
            }}
            options={options}
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
            renderInput={(params) => (
              <TextField
                label={label}
                placeholder={placeholder}
                error={!!error}
                helperText={error ? error?.message : helperText}
                {...params}
              />
            )}
            {...other}
          />
        );
      }}
    />
  );
}

RHFAutocomplete.propTypes = {
  helperText: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string
};
