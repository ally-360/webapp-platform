import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { Icon } from '@iconify/react';

interface AddTabButtonProps {
  onAdd: () => void;
  disabled?: boolean;
}

/**
 * Botón para agregar nuevo tab en el tab bar
 */
const AddTabButton: React.FC<AddTabButtonProps> = ({ onAdd, disabled = false }) => (
  <Tooltip title="Crear nueva venta" placement="top" arrow>
    <Box>
      <IconButton
        onClick={onAdd}
        color="primary"
        disabled={disabled}
        sx={{
          flexShrink: 0,
          bgcolor: 'action.hover',
          '&:hover': {
            bgcolor: 'primary.light',
            color: 'primary.contrastText'
          },
          '&.Mui-disabled': {
            bgcolor: 'action.disabledBackground'
          }
        }}
      >
        <Icon icon="mdi:plus" />
      </IconButton>
    </Box>
  </Tooltip>
);

export default AddTabButton;
