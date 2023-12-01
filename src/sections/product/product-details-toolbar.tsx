import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Divider } from '@mui/material';
import React from 'react';
import { paths } from 'src/routes/paths';
// ----------------------------------------------------------------------

interface ProductDetailsToolbarProps {
  backLink: string;
  editLink: string;
  stateProduct: boolean;
  id: string;
  sx?: object;
}
export default function ProductDetailsToolbar({
  backLink,
  editLink,
  stateProduct,
  id,
  sx,
  ...other
}: ProductDetailsToolbarProps) {
  return (
    <Stack
      spacing={1.5}
      direction="row"
      sx={{
        mb: { xs: 3, md: 5 },
        ...sx
      }}
      {...other}
    >
      <Button
        component={RouterLink}
        color="error"
        variant="outlined"
        href={backLink}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
      >
        Volver
      </Button>

      <Box sx={{ flexGrow: 1 }} />
      <Button
        variant="outlined"
        color="primary"
        component={RouterLink}
        href={editLink}
        startIcon={<Iconify icon="solar:pen-bold" width={18} />}
      >
        Editar
      </Button>
      <Tooltip title="Crea una factura de comprar para agregar existencias a este producto">
        <Button
          variant="outlined"
          color="primary"
          component={RouterLink}
          href={`${paths.dashboard.bill.newBill}?product=${id}`}
          startIcon={<Iconify icon="gala:add" width={20} />}
        >
          Abastecer este producto
        </Button>
      </Tooltip>
      <Button
        variant="outlined"
        color="primary"
        href={`${paths.dashboard.sales.newSale}?product=${id}`}
        component={RouterLink}
        startIcon={<Iconify icon="gala:add" width={20} />}
      >
        Facturar este producto
      </Button>
      <Divider orientation="vertical" flexItem />

      {stateProduct && (
        <Button variant="outlined" color={stateProduct ? 'error' : 'primary'} component={RouterLink}>
          {stateProduct ? 'Desactivar' : 'Activar'}
        </Button>
      )}
    </Stack>
  );
}

ProductDetailsToolbar.propTypes = {
  backLink: PropTypes.string,
  editLink: PropTypes.string,
  liveLink: PropTypes.string,
  onChangePublish: PropTypes.func,
  publish: PropTypes.string,
  publishOptions: PropTypes.array,
  sx: PropTypes.object
};
