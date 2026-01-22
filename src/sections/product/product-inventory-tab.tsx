import { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Skeleton,
  Chip,
  IconButton,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Iconify from 'src/components/iconify';
import { useGetProductStockSummaryQuery, useUpdateMinQuantityMutation } from 'src/redux/services/stockApi';
import { useGetPDVsQuery } from 'src/redux/services/pdvsApi';
import EmptyContent from 'src/components/empty-content';

interface ProductInventoryTabProps {
  productId: string;
  productName: string;
  onTabChange?: (tab: string) => void;
}

interface EditingState {
  pdvId: string;
  value: string;
}

export default function ProductInventoryTab({ productId, productName, onTabChange }: ProductInventoryTabProps) {
  const { t } = useTranslation();
  const [editingRow, setEditingRow] = useState<EditingState | null>(null);

  const { data: summaryData, isLoading: isLoadingSummary } = useGetProductStockSummaryQuery(productId);
  const { data: pdvsData } = useGetPDVsQuery();
  const [updateMinQuantity] = useUpdateMinQuantityMutation();

  const pdvMap = pdvsData?.reduce((acc, pdv) => ({ ...acc, [pdv.id]: pdv.name }), {} as Record<string, string>) || {};

  // Calcular KPIs
  const totalUnits = summaryData?.total_quantity || 0;
  const pdvsWithStock = summaryData?.pdv_stocks?.filter((s) => s.quantity > 0).length || 0;
  const lowStockPdvs =
    summaryData?.pdv_stocks?.filter((s) => s.quantity > 0 && s.quantity < s.min_quantity).length || 0;

  // Determinar estado de stock
  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity <= 0) return { label: 'Sin stock', color: 'error' as const };
    if (quantity < minQuantity) return { label: 'Bajo', color: 'warning' as const };
    return { label: 'OK', color: 'success' as const };
  };

  // Manejar edición inline
  const handleStartEdit = (pdvId: string, currentMin: number) => {
    setEditingRow({ pdvId, value: String(currentMin) });
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
  };

  const handleSaveEdit = async (pdvId: string) => {
    if (!editingRow) return;

    const newMinQuantity = parseInt(editingRow.value, 10);

    if (isNaN(newMinQuantity) || newMinQuantity < 0) {
      // TODO: Mostrar error
      return;
    }

    try {
      await updateMinQuantity({
        productId,
        pdvId,
        min_quantity: newMinQuantity
      }).unwrap();
      setEditingRow(null);
    } catch (error) {
      console.error('Error updating min quantity:', error);
    }
  };

  const handleNavigateToKardex = (pdvId?: string) => {
    if (onTabChange) {
      onTabChange('movements');
      // TODO: Aplicar filtro de PDV si se proporciona
    }
  };

  // Loading state
  if (isLoadingSummary) {
    return (
      <Stack spacing={3}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{ p: 3 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={40} />
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card>
          <Skeleton variant="rectangular" height={400} />
        </Card>
      </Stack>
    );
  }

  // Empty state
  if (!summaryData || !summaryData.pdv_stocks || summaryData.pdv_stocks.length === 0) {
    return (
      <Card>
        <EmptyContent
          filled
          title="No hay stock registrado"
          description="Este producto no tiene stock en ningún punto de venta"
          sx={{ py: 10 }}
        />
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6">{t('Inventario por Punto de Venta')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Gestiona el stock y mínimos de')} {productName}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:history-bold-duotone" />}
          onClick={() => handleNavigateToKardex()}
        >
          {t('Ver Kardex')}
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('Total Unidades')}
              </Typography>
              <Typography variant="h4">{totalUnits}</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('PDVs con Stock')}
              </Typography>
              <Typography variant="h4">{pdvsWithStock}</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('PDVs Bajo Stock')}
              </Typography>
              <Typography variant="h4" color={lowStockPdvs > 0 ? 'warning.main' : 'text.primary'}>
                {lowStockPdvs}
              </Typography>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Alerta si hay PDVs bajo stock */}
      {lowStockPdvs > 0 && (
        <Alert severity="warning">
          {t('Hay')} {lowStockPdvs} {t('punto(s) de venta con stock bajo el mínimo configurado')}
        </Alert>
      )}

      {/* Tabla de Stock por PDV */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('Punto de Venta')}</TableCell>
                <TableCell align="right">{t('Stock Actual')}</TableCell>
                <TableCell align="right">{t('Mínimo')}</TableCell>
                <TableCell>{t('Estado')}</TableCell>
                <TableCell align="right">{t('Acciones')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryData.pdv_stocks.map((stock) => {
                const status = getStockStatus(stock.quantity, stock.min_quantity);
                const isEditing = editingRow?.pdvId === stock.pdv_id;

                return (
                  <TableRow key={stock.pdv_id} hover>
                    <TableCell>
                      <Typography variant="body2">{pdvMap[stock.pdv_id] || stock.pdv_id}</Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={stock.quantity <= 0 ? 'error.main' : 'text.primary'}
                      >
                        {stock.quantity}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      {isEditing ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <TextField
                            size="small"
                            type="number"
                            value={editingRow.value}
                            onChange={(e) => setEditingRow({ ...editingRow, value: e.target.value })}
                            sx={{ width: 80 }}
                            inputProps={{ min: 0 }}
                          />
                          <IconButton size="small" color="primary" onClick={() => handleSaveEdit(stock.pdv_id)}>
                            <Iconify icon="solar:check-circle-bold" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={handleCancelEdit}>
                            <Iconify icon="solar:close-circle-bold" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                          <Typography variant="body2">{stock.min_quantity}</Typography>
                          <IconButton size="small" onClick={() => handleStartEdit(stock.pdv_id, stock.min_quantity)}>
                            <Iconify icon="solar:pen-bold-duotone" width={18} />
                          </IconButton>
                        </Stack>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleNavigateToKardex(stock.pdv_id)}
                        title={t('Ver movimientos en Kardex')}
                      >
                        <Iconify icon="solar:history-bold-duotone" />
                      </IconButton>
                      <IconButton size="small" disabled title={t('Ajustar stock (próximamente)')}>
                        <Iconify icon="solar:settings-bold-duotone" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
