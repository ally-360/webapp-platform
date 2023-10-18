import PropTypes from 'prop-types';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Divider } from '@mui/material';

// ----------------------------------------------------------------------

export default function ProductDetailsToolbar({
  publish,
  backLink,
  editLink,
  liveLink,
  publishOptions,
  onChangePublish,
  stateProduct,
  sx,
  ...other
}) {
  const popover = usePopover();

  return (
    <>
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

        {publish === 'published' && (
          <Tooltip title="Go Live">
            <IconButton component={RouterLink} href={liveLink}>
              <Iconify icon="eva:external-link-fill" />
            </IconButton>
          </Tooltip>
        )}

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
            href={liveLink}
            startIcon={<Iconify icon="gala:add" width={20} />}
          >
            Abastecer este producto
          </Button>
        </Tooltip>
        <Button
          variant="outlined"
          color="primary"
          component={RouterLink}
          href={liveLink}
          startIcon={<Iconify icon="gala:add" width={20} />}
        >
          Facturar este producto
        </Button>
        <Divider orientation="vertical" flexItem />

        {stateProduct && (
          <Button variant="outlined" color={stateProduct ? 'error' : 'primary'} component={RouterLink} href={liveLink}>
            {stateProduct ? 'Desactivar' : 'Activar'}
          </Button>
        )}
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="top-right" sx={{ width: 140 }}>
        {publishOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === publish}
            onClick={() => {
              popover.onClose();
              onChangePublish(option.value);
            }}
          >
            {option.value === 'published' && <Iconify icon="eva:cloud-upload-fill" />}
            {option.value === 'draft' && <Iconify icon="solar:file-text-bold" />}
            {option.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
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
