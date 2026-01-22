import { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
  Stack,
  Alert,
  Skeleton,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { UnmatchedMovement } from '../types';

// ----------------------------------------------------------------------

interface UnmatchedMovementsPanelProps {
  movements: UnmatchedMovement[];
  selectedMovement: UnmatchedMovement | null;
  onSelectMovement: (movement: UnmatchedMovement) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  preselectedMovementId?: string;
}

export default function UnmatchedMovementsPanel({
  movements,
  selectedMovement,
  onSelectMovement,
  isLoading = false,
  readOnly = false,
  preselectedMovementId,
}: UnmatchedMovementsPanelProps) {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(preselectedMovementId || null);

  // Filtrar movimientos
  const filteredMovements = useMemo(() => {
    let filtered = movements;

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter((m) => m.source_module === typeFilter);
    }

    // Filtro por búsqueda
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.reference?.toLowerCase().includes(search) ||
          m.description?.toLowerCase().includes(search) ||
          m.amount?.toString().includes(search)
      );
    }

    return filtered;
  }, [movements, typeFilter, searchText]);

  const handleToggleExpand = (movementId: string) => {
    setExpandedId(expandedId === movementId ? null : movementId);
  };

  // Obtener configuración de tipos
  const getTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; icon: string; color: string }> = {
      treasury_movement: {
        label: 'Movimiento',
        icon: 'solar:wallet-bold-duotone',
        color: 'info',
      },
      invoice_payment: {
        label: 'Pago Cliente',
        icon: 'solar:bill-check-bold-duotone',
        color: 'success',
      },
      purchase_payment: {
        label: 'Pago Proveedor',
        icon: 'solar:cart-check-bold-duotone',
        color: 'warning',
      },
      adjustment: {
        label: 'Ajuste',
        icon: 'solar:settings-bold-duotone',
        color: 'default',
      },
    };
    return configs[type] || configs.treasury_movement;
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title="Libros Contables"
          subheader="Movimientos sin conciliar"
          avatar={<Iconify icon="solar:book-bold-duotone" width={24} />}
        />
        <CardContent>
          <Stack spacing={2}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Libros Contables</Typography>
            <Chip label={filteredMovements.length} size="small" color="success" />
          </Stack>
        }
        subheader="Selecciona un movimiento interno"
        avatar={
          <Iconify icon="solar:book-bold-duotone" width={24} sx={{ color: 'success.main' }} />
        }
      />

      <CardContent sx={{ flex: 1, overflow: 'auto', pt: 0 }}>
        {/* Filters */}
        <Box
          sx={{ mb: 2, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, pt: 2 }}
        >
          <Stack spacing={1.5}>
            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por referencia, descripción..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchText('')}>
                      <Iconify icon="eva:close-fill" width={20} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Type filter */}
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de movimiento</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Tipo de movimiento"
              >
                <MenuItem value="all">Todos los tipos</MenuItem>
                <MenuItem value="treasury_movement">Movimientos de Tesorería</MenuItem>
                <MenuItem value="invoice_payment">Pagos de Clientes</MenuItem>
                <MenuItem value="purchase_payment">Pagos a Proveedores</MenuItem>
                <MenuItem value="adjustment">Ajustes</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Empty state */}
        {filteredMovements.length === 0 && (
          <Alert severity="success" icon={<Iconify icon="eva:checkmark-circle-2-fill" />}>
            {searchText || typeFilter !== 'all'
              ? 'No se encontraron movimientos con esos criterios'
              : '¡Perfecto! No hay movimientos pendientes por conciliar'}
          </Alert>
        )}

        {/* Movements list */}
        <List disablePadding>
          {filteredMovements.map((movement) => {
            const isSelected = selectedMovement?.id === movement.id;
            const isExpanded = expandedId === movement.id;
            const isNegative = parseFloat(movement.amount || '0') < 0;
            const typeConfig = getTypeConfig(movement.source_module || 'treasury_movement');

            return (
              <Box key={movement.id} sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => !readOnly && onSelectMovement(movement)}
                  disabled={readOnly}
                  sx={{
                    borderRadius: 1,
                    border: (theme) =>
                      isSelected
                        ? `2px solid ${theme.palette.success.main}`
                        : `1px solid ${theme.palette.divider}`,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'success.lighter',
                      '&:hover': {
                        bgcolor: 'success.lighter',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" noWrap sx={{ flex: 1, mr: 1 }}>
                          {movement.reference || movement.description || 'Sin referencia'}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            color: isNegative ? 'error.main' : 'success.main',
                            fontWeight: 600,
                          }}
                        >
                          {fCurrency(movement.amount || 0)}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={format(new Date(movement.movement_date), 'dd MMM yyyy', {
                            locale: es,
                          })}
                          icon={<Iconify icon="solar:calendar-bold-duotone" width={16} />}
                          sx={{ height: 22 }}
                        />
                        <Chip
                          size="small"
                          label={typeConfig.label}
                          icon={<Iconify icon={typeConfig.icon} width={16} />}
                          color={typeConfig.color as any}
                          sx={{ height: 22 }}
                        />
                        {movement.description && movement.description !== movement.reference && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {movement.description}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExpand(movement.id);
                    }}
                  >
                    <Iconify
                      icon={
                        isExpanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'
                      }
                    />
                  </IconButton>
                </ListItemButton>

                {/* Expanded details */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Detalles del movimiento:
                      </Typography>

                      {movement.reference && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Referencia:
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {movement.reference}
                          </Typography>
                        </Stack>
                      )}

                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Tipo:
                        </Typography>
                        <Chip
                          label={typeConfig.label}
                          icon={<Iconify icon={typeConfig.icon} width={16} />}
                          size="small"
                          color={typeConfig.color as any}
                        />
                      </Stack>

                      {movement.description && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Descripción:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{ maxWidth: '60%', textAlign: 'right' }}
                          >
                            {movement.description}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}
