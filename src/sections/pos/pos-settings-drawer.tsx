import React from 'react';
// @mui
import {
  Box,
  Drawer,
  Typography,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import { Icon } from '@iconify/react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PosSettingsDrawer({ open, onClose }: Props) {
  const handleMenuAction = (action: string) => {
    // eslint-disable-next-line no-alert
    alert(`Acción: ${action} - Esta funcionalidad estará disponible próximamente`);
  };

  const settingsOptions = [
    {
      id: 'sales-history',
      title: 'Historial de Ventas',
      description: 'Ver ventas realizadas',
      icon: 'mdi:receipt',
      action: () => handleMenuAction('Historial de Ventas')
    },
    {
      id: 'daily-report',
      title: 'Reporte Diario',
      description: 'Generar reporte del día',
      icon: 'mdi:chart-line',
      action: () => handleMenuAction('Reporte Diario')
    },
    {
      id: 'inventory',
      title: 'Inventario',
      description: 'Gestionar productos',
      icon: 'mdi:package-variant',
      action: () => handleMenuAction('Inventario')
    },
    {
      id: 'customers',
      title: 'Clientes',
      description: 'Administrar clientes',
      icon: 'mdi:account-group',
      action: () => handleMenuAction('Clientes')
    },
    {
      id: 'users',
      title: 'Usuarios',
      description: 'Gestionar usuarios',
      icon: 'mdi:account-multiple',
      action: () => handleMenuAction('Usuarios')
    },
    {
      id: 'printer-config',
      title: 'Configurar Impresora',
      description: 'Ajustes de impresión',
      icon: 'mdi:printer',
      action: () => handleMenuAction('Configurar Impresora')
    }
  ];

  const dangerOptions = [
    {
      id: 'close-register',
      title: 'Cerrar Caja',
      description: 'Finalizar jornada',
      icon: 'mdi:cash-register',
      color: 'warning',
      action: () => handleMenuAction('Cerrar Caja')
    },
    {
      id: 'backup',
      title: 'Respaldo de Datos',
      description: 'Crear copia de seguridad',
      icon: 'mdi:backup-restore',
      color: 'info',
      action: () => handleMenuAction('Respaldo de Datos')
    }
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 350,
          maxWidth: '90vw'
        }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Configuración
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Icon icon="mdi:close" />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2 }} />
        {/* Settings Content */}
        <Stack spacing={3} sx={{ flex: 1, overflow: 'auto' }}>
          {/* Important Actions */}
          <Box>
            <List sx={{ p: 0 }}>
              {dangerOptions.map((option) => (
                <ListItem key={option.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={option.action}
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Icon icon={option.icon} width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle2" fontWeight={500}>
                            {option.title}
                          </Typography>
                          <Chip
                            label={option.color === 'warning' ? 'Importante' : 'Proceso'}
                            size="small"
                            color={option.color as any}
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={option.description}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />
                    <Icon icon="mdi:chevron-right" width={16} height={16} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
          <Divider />
          {/* Quick Actions */}
          <Box>
            <List sx={{ p: 0 }}>
              {settingsOptions.map((option) => (
                <ListItem key={option.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={option.action}
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Icon icon={option.icon} width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary={option.title}
                      secondary={option.description}
                      primaryTypographyProps={{
                        variant: 'subtitle2',
                        fontWeight: 500
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />
                    <Icon icon="mdi:chevron-right" width={16} height={16} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider />

          {/* General Settings */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Configuraciones Generales
            </Typography>

            <Stack spacing={2}>
              <FormControlLabel control={<Switch defaultChecked />} label="Impresión automática de tickets" />
              <FormControlLabel control={<Switch />} label="Sonidos de notificación" />
              <FormControlLabel control={<Switch defaultChecked />} label="Confirmación antes de eliminar" />
            </Stack>
          </Box>
        </Stack>

        {/* Footer Info */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            POS System v1.0
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            © 2024 - Sistema de Punto de Venta
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
