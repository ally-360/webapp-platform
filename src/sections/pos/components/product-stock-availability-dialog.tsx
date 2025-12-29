import React from 'react';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// components
import Iconify from 'src/components/iconify';
import { useGetProductByIdQuery } from 'src/redux/services/productsApi';

// ----------------------------------------------------------------------

interface Props {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentPdvId?: string;
}

export default function ProductStockAvailabilityDialog({ open, onClose, productId, productName, currentPdvId }: Props) {
  const theme = useTheme();

  const {
    data: product,
    isLoading,
    error
  } = useGetProductByIdQuery(productId, {
    skip: !open // Solo hacer request cuando el dialog esté abierto
  });

  const pdvStocks = product?.productPdv || [];
  const totalStock = pdvStocks.reduce((sum, pdv) => sum + (pdv.quantity || 0), 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="solar:box-bold-duotone" width={24} sx={{ color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography variant="h6">Disponibilidad de Stock</Typography>
            <Typography variant="body2" color="text.secondary">
              {productName}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al cargar la información de stock
          </Alert>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* Total Stock Summary */}
            <Box
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="text.secondary">
                  Stock Total Disponible
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="baseline">
                  <Typography variant="h3" color="primary.main">
                    {totalStock}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    unidades
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Stock by PDV */}
            {pdvStocks.length === 0 ? (
              <Alert severity="info" icon={<Iconify icon="solar:box-broken-bold" />}>
                No hay stock disponible en ningún punto de venta
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Stock por Punto de Venta
                </Typography>
                {pdvStocks.map((pdv) => {
                  const isCurrentPdv = pdv.pdv_id === currentPdvId;
                  const hasStock = (pdv.quantity || 0) > 0;
                  const isLowStock = (pdv.quantity || 0) > 0 && (pdv.quantity || 0) <= (pdv.min_quantity || 0);

                  return (
                    <Box
                      key={pdv.pdv_id}
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: isCurrentPdv ? alpha(theme.palette.info.main, 0.04) : 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.08)}`
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              bgcolor: alpha(hasStock ? theme.palette.success.main : theme.palette.error.main, 0.08),
                              display: 'flex'
                            }}
                          >
                            <Iconify
                              icon="solar:shop-2-bold-duotone"
                              width={20}
                              sx={{ color: hasStock ? theme.palette.success.main : theme.palette.error.main }}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle2">{pdv.pdv_name}</Typography>
                              {isCurrentPdv && (
                                <Chip
                                  label="Actual"
                                  size="small"
                                  color="info"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Stack>
                            {isLowStock && (
                              <Typography
                                variant="caption"
                                color="warning.main"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                              >
                                <Iconify icon="solar:danger-triangle-bold" width={14} />
                                Stock bajo (mínimo: {pdv.min_quantity})
                              </Typography>
                            )}
                          </Box>
                        </Stack>

                        <Stack alignItems="flex-end" spacing={0.5}>
                          <Stack direction="row" spacing={0.5} alignItems="baseline">
                            <Typography variant="h6" color={hasStock ? 'success.main' : 'error.main'}>
                              {pdv.quantity || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              uds
                            </Typography>
                          </Stack>
                          {!hasStock && (
                            <Chip
                              label="Sin stock"
                              size="small"
                              color="error"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}

            {/* Additional Info */}
            {product && (
              <Box sx={{ mt: 3, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      SKU:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {product.sku || 'N/A'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Código de barras:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {product.barCode || 'N/A'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Venta en negativo:
                    </Typography>
                    <Chip
                      label={product.sellInNegative ? 'Permitida' : 'No permitida'}
                      size="small"
                      color={product.sellInNegative ? 'success' : 'default'}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Stack>
                </Stack>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
