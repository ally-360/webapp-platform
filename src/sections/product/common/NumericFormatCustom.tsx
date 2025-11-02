import * as React from 'react';
import { NumericFormat } from 'react-number-format';
import PropTypes from 'prop-types';

export const NumericFormatCustom = React.forwardRef((props, ref) => {
  const { ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      // onValueChange={(values) => {
      //   onChange({
      //     target: {
      //       value: values.value
      //     }
      //   });
      // }}
      thousandSeparator
      valueIsNumericString
    />
  );
});
NumericFormatCustom.propTypes = {
  onChange: PropTypes.func.isRequired
};
