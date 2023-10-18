import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// icons
import { Icon } from '@iconify/react';
// @mui
import Box from '@mui/material/Box';
import React from 'react';

// ----------------------------------------------------------------------

const Iconify = forwardRef(({ icon, width = 20, sx, ...other } : IconifyProps, ref) => (
  <Box
    ref={ref}
    component={Icon}
    className="component-iconify"
    icon={icon}
    sx={{ width, height: width, ...sx }}
    {...other}
  />
));

type IconifyProps = {
  icon: string;
  width?: number;
  sx?: object;
};


// Iconify.propTypes = {
//   icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
//   sx: PropTypes.object,
//   width: PropTypes.number,
// };

export default Iconify;
