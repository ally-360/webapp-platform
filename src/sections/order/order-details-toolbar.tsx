import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import { usePopover } from 'src/components/custom-popover';
import React from 'react';
// ----------------------------------------------------------------------

export default function OrderDetailsToolbar({ backLink, createdAt, orderNumber }) {
  const popover = usePopover();

  return (
    <Stack
      spacing={3}
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        mb: { xs: 3, md: 5 }
      }}
    >
      <Stack spacing={1} direction="row" alignItems="flex-start">
        <Stack spacing={0.5}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Typography variant="h4"> Order {orderNumber} </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {fDateTime(createdAt)}
          </Typography>
        </Stack>
      </Stack>
      {/* 
      <Stack flexGrow={1} spacing={1.5} direction="row" alignItems="center" justifyContent="flex-end">
        <Button color="inherit" variant="outlined" startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}>
          Print
        </Button>

        <Button color="inherit" variant="contained" startIcon={<Iconify icon="solar:pen-bold" />}>
          Edit
        </Button>
      </Stack> */}
    </Stack>
  );
}

OrderDetailsToolbar.propTypes = {
  backLink: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  onChangeStatus: PropTypes.func,
  orderNumber: PropTypes.string,
  status: PropTypes.string,
  statusOptions: PropTypes.array
};
