import { Button, Divider, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import React, { useState, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import Iconify from 'src/components/iconify';
import { useTranslation } from 'react-i18next';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

// Tipos para mejor tipado
interface MenuCategoriesProps {
  handleEdit: (element: any) => void;
  handleDelete: (element: any) => void;
  handleView?: (id: string | number) => void;
  view?: boolean;
  element: any;
  edit?: boolean;
}

function MenuCategories({ handleEdit, handleDelete, handleView, view, element, edit }: MenuCategoriesProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const openMenu = Boolean(anchorEl);
  const { t } = useTranslation();
  const popover = usePopover();
  const confirm = useBoolean(false);
  const ref = useRef<HTMLElement>(null);

  // ========================================
  // 🎯 CALLBACKS ESTABLES
  // ========================================

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEditElement = useCallback(() => {
    handleEdit(element);
    handleClose();
  }, [handleEdit, element, handleClose]);

  const handleViewElement = useCallback(() => {
    if (handleView && element?.id) {
      handleView(element.id);
    }
    popover.onClose();
  }, [handleView, element?.id, popover]);

  const handleDeleteElement = useCallback(() => {
    handleDelete(element);
    confirm.onFalse();
  }, [handleDelete, element, confirm]);

  const handleConfirmDelete = useCallback(() => {
    confirm.onTrue();
    popover.onClose();
  }, [confirm, popover]);

  // ========================================
  // 🎨 RENDERIZADO PRINCIPAL
  // ========================================

  return (
    <>
      <IconButton color={popover.open ? 'primary' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 140 }}>
        {handleView && (
          <MenuItem onClick={handleViewElement}>
            <Iconify icon="solar:eye-bold" />
            {t('Ver')}
          </MenuItem>
        )}

        <MenuItem onClick={handleEditElement}>
          <Iconify icon="solar:pen-bold" />
          {t('Editar')}
        </MenuItem>

        <MenuItem onClick={handleConfirmDelete} sx={{ color: 'error.main' }}>
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

        {view && handleView && (
          <MenuItem onClick={handleViewElement}>
            <Iconify icon="solar:eye-bold" />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Ver
            </Typography>
          </MenuItem>
        )}

        {(view || edit) && <Divider />}

        <MenuItem onClick={handleDeleteElement} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Delete
          </Typography>
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('Confirmar eliminación')}
        content={t('¿Estás seguro de que quieres eliminar este elemento?')}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteElement}>
            {t('Eliminar')}
          </Button>
        }
      />
    </>
  );
}

// Memoización para evitar re-renderizados innecesarios
export default memo(MenuCategories);

MenuCategories.propTypes = {
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleView: PropTypes.func,
  view: PropTypes.bool,
  element: PropTypes.object.isRequired,
  edit: PropTypes.bool
};
