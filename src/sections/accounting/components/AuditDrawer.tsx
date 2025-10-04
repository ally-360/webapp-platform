import React from 'react';
import { Divider, Drawer, IconButton, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

export type AuditDrawerProps = { open: boolean; onClose: () => void };

export const AuditDrawer: React.FC<AuditDrawerProps> = ({ open, onClose }) => {
  const mockEvents = [
    { id: 1, text: 'Creación cuenta 110505 por Juan Pérez - 2025-08-29 10:15' },
    { id: 2, text: 'Edición cuenta 413505 por Ana Gómez - 2025-08-30 09:01' },
    { id: 3, text: 'Importación de 120 cuentas por Admin - 2025-08-30 12:45' }
  ];

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: 380 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        <Typography variant="h6">Historial</Typography>
        <IconButton onClick={onClose}>
          <Icon icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <List>
        {mockEvents.map((e) => (
          <ListItem key={e.id}>
            <ListItemText primary={e.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
