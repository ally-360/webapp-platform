import PropTypes from 'prop-types';
import { format } from 'date-fns';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
// utils
import { fCurrency } from 'src/utils/format-number';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Popover, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function ProductTableRow({ row, selected, onSelectRow, onDeleteRow, onEditRow, onViewRow }) {
  const { name, priceSale, state, images, sku, quantityStock, productPdv, barCode } = row;

  const { t } = useTranslation();

  console.log(quantityStock);

  const confirm = useBoolean();

  const minQuantityAllPdvs = productPdv.reduce((acc, pdv) => pdv.minQuantity + acc, 0);
  const maxQuantityAllPdvs = productPdv.reduce((acc, pdv) => pdv.maxQuantity + acc, 0);
  const inventoryType =
    // eslint-disable-next-line no-nested-ternary
    quantityStock > minQuantityAllPdvs ? 'Existencias' : quantityStock === 0 ? 'Sin exitencias' : 'Pocas existencias';
  const popover = usePopover();

  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={name} src={images[0]} variant="rounded" sx={{ width: 64, height: 64, mr: 2 }} />
          <ListItemText
            disableTypography
            primary={
              <Link noWrap color="inherit" variant="subtitle2" onClick={onViewRow} sx={{ cursor: 'pointer' }}>
                {name}
              </Link>
            }
            secondary={
              <Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
                {t('Código')} {barCode}
              </Box>
            }
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={sku}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption'
            }}
          />
        </TableCell>
        <TableCell
          aria-owns={open ? 'mouse-over-popover' : undefined}
          aria-haspopup="true"
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          sx={{ typography: 'caption', color: 'text.secondary' }}
        >
          <LinearProgress
            value={(quantityStock * 100) / (maxQuantityAllPdvs !== 0 ? maxQuantityAllPdvs : minQuantityAllPdvs)}
            variant="determinate"
            color={
              (quantityStock === 0 && 'error') ||
              (quantityStock < minQuantityAllPdvs && 'low stock' && 'warning') ||
              'success'
            }
            sx={{ mb: 1, height: 6, maxWidth: 80 }}
          />
          {!!quantityStock && quantityStock} {inventoryType}
          <Popover
            id="mouse-over-popover"
            sx={{
              pointerEvents: 'none'
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'left'
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'right'
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
          >
            {/* Validar si el objeto tiene > 0 */}
            {Object.keys(productPdv).length > 0 &&
              productPdv.map((element, index) => (
                <Box key={index} sx={{ p: 0.2 }}>
                  <Typography sx={{ typography: 'caption', color: 'text.secondary' }}>
                    {element.pdv.name}: {element.quantity} {t('productos')}
                  </Typography>
                </Box>
              ))}
          </Popover>
        </TableCell>

        <TableCell>{fCurrency(priceSale)}</TableCell>

        <TableCell>
          <Label variant="soft" color={(state === true && 'success') || 'default'}>
            {state === true ? t('Activo') : t('Inactivo')}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton color={popover.open ? 'primary' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 140 }}>
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          {t('Ver')}
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('Editar')}
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          {t('Eliminar')}
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('Eliminar producto')}
        content={t(`¿Estás seguro de eliminar el producto ${name}?`)}
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            {t('Eliminar')}
          </Button>
        }
      />
    </>
  );
}

ProductTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool
};
