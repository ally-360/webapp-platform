import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { useTheme } from '@mui/material';
import { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import MuiPhoneNumber from 'material-ui-phone-number-2';
// ----------------------------------------------------------------------

export default function RHFPhoneNumber({ name, helperText, type, ...other }) {
  const { control } = useFormContext();
  const theme = useTheme(); // Obtiene el tema actual de Material-UI
  const [isFocused, setIsFocused] = useState(false); // Estado para rastrear el focus

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <MuiPhoneNumber
          {...field}
          fullWidth
          color="primary"
          variant="outlined"
          countryCodeEditable={false}
          value={field.value === 0 ? '' : field.value}
          onChange={(event) => {
            field.onChange(event);
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
        />
      )}
    />
  );
}

RHFPhoneNumber.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string
};
