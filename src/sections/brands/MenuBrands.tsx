import { Button, Divider, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import Iconify from 'src/components/iconify';
import { useTranslation } from 'react-i18next';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

interface MenuBrandsProps {
  handleEdit: (element: any) => void;
  handleDelete: (element: any) => void;
  handleView: (id: string) => void;
  view?: boolean;
  element: any;
  edit?: boolean;
}

export default function MenuBrands({
  handleEdit,
  handleDelete,
  handleView,
  view = true,
  element,
  edit
}: MenuBrandsProps) {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const { t } = useTranslation();
  const popover = usePopover();
  const confirm = useBoolean(false);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [elementState] = useState(element);

  useEffect(() => {
    console.log(elementState);
  }, [elementState]);

  const handleEditElement = () => {
    handleEdit(elementState);
    handleClose();
  };

  const ref = useRef(null);

  return (
    <>
      <IconButton color={popover.open ? 'primary' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 140 }}>
        <MenuItem
          onClick={() => {
            handleView(element.id);
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          {t('Ver')}
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleEditElement();
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
      <Menu
        open={openMenu}
        anchorEl={ref.current}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {edit && (
          <MenuItem onClick={handleEditElement}>
            <Iconify icon="solar:pen-bold" />

            <Typography variant="body2" sx={{ ml: 2 }}>
              Editar
            </Typography>
          </MenuItem>
        )}

        {view && (
          <MenuItem onClick={() => handleView(element.id)}>
            <Iconify icon="solar:eye-bold" />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Ver
            </Typography>
          </MenuItem>
        )}
        {view || edit ? <Divider /> : null}
        <MenuItem onClick={() => handleDelete(element)} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Delete
          </Typography>
        </MenuItem>
      </Menu>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('Eliminar Punto De Venta')}
        content={t(`¿Estás seguro de eliminar la categoria?`)}
        action={
          <Button variant="contained" color="error" onClick={() => handleDelete(element)}>
            {t('Eliminar')}
          </Button>
        }
      />
    </>
  );
}
