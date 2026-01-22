import { useState, useMemo } from 'react';
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
  Tabs,
  Tab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { subDays, format } from 'date-fns';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useGetSalesInvoicesQuery } from 'src/redux/services/salesInvoicesApi';
import { useGetBillsQuery } from 'src/redux/services/billsApi';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

interface ProductInvoicesTabProps {
  productId: string;
  productName: string;
}

type InternalTab = 'sales' | 'purchases';

// Helper: validar si invoice es válida para estadísticas
const isInvoiceValidForStats = (status: string): boolean => status !== 'VOID' && status !== 'CANCELED';

// Helper: validar si bill es válida para estadísticas
const isBillValidForStats = (status: string): boolean => status !== 'void';

export default function ProductInvoicesTab({ productId, productName }: ProductInvoicesTabProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Estado local
  const [internalTab, setInternalTab] = useState<InternalTab>('sales');
  const [dateRange] = useState({
    start_date: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd')
  });

  // Queries con filtro por producto e incluyendo unidades
  const {
    data: invoicesData,
    isLoading: isLoadingInvoices,
    error: errorInvoices
  } = useGetSalesInvoicesQuery({
    product_id: productId,
    include_units: true,
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    limit: 1000
  });

  const {
    data: billsData,
    isLoading: isLoadingBills,
    error: errorBills
  } = useGetBillsQuery({
    product_id: productId,
    include_units: true,
    date_from: dateRange.start_date,
    date_to: dateRange.end_date,
    limit: 1000
  });

  // Procesar datos filtrados por el backend
  const processedData = useMemo(() => {
    // Usar totales de unidades calculados por el backend
    const soldUnits = invoicesData?.total_units_sold || 0;
    const boughtUnits = billsData?.total_units_purchased || 0;

    let totalSalesAmount = 0;
    let totalPurchasesAmount = 0;
    const salesWithProduct: any[] = [];
    const purchasesWithProduct: any[] = [];

    // Procesar facturas de venta
    if (invoicesData?.invoices) {
      invoicesData.invoices.forEach((invoice) => {
        if (isInvoiceValidForStats(invoice.status)) {
          salesWithProduct.push(invoice);
          totalSalesAmount += parseFloat(invoice.total_amount || '0');
        }
      });
    }

    // Procesar facturas de compra
    if (billsData?.items) {
      billsData.items.forEach((bill) => {
        if (isBillValidForStats(bill.status)) {
          purchasesWithProduct.push(bill);
          totalPurchasesAmount += parseFloat(bill.total_amount || '0');
        }
      });
    }

    return {
      soldUnits,
      boughtUnits,
      totalSalesAmount,
      totalPurchasesAmount,
      salesWithProduct,
      purchasesWithProduct
    };
  }, [invoicesData, billsData]);

  // Navegación
  const handleViewInvoiceDetail = (invoiceId: string) => {
    router.push(paths.dashboard.sales.details(invoiceId));
  };

  const handleViewBillDetail = (billId: string) => {
    router.push(paths.dashboard.bill.details(billId));
  };

  // Render de chips de estado
  const renderInvoiceStatusChip = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Borrador', color: 'default' as const },
      OPEN: { label: 'Abierta', color: 'info' as const },
      PAID: { label: 'Pagada', color: 'success' as const },
      VOID: { label: 'Anulada', color: 'error' as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const renderBillStatusChip = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', color: 'default' as const },
      open: { label: 'Abierta', color: 'info' as const },
      partial: { label: 'Parcial', color: 'warning' as const },
      paid: { label: 'Pagada', color: 'success' as const },
      void: { label: 'Anulada', color: 'error' as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // Loading state
  if (isLoadingInvoices || isLoadingBills) {
    return (
      <Stack spacing={3} sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={400} />
      </Stack>
    );
  }

  // Error state
  if (errorInvoices || errorBills) {
    return (
      <Card sx={{ p: 3 }}>
        <EmptyContent
          filled
          title="Error al cargar datos"
          description="No se pudieron cargar las facturas. Intenta nuevamente."
          sx={{ py: 10 }}
        />
      </Card>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6">{t('Facturas')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Ventas y compras relacionadas con')} {productName}
          </Typography>
        </Box>
        {/* TODO: Implementar selector de rango de fechas */}
      </Box>

      {/* KPIs */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('Unidades Vendidas')}
              </Typography>
              <Typography variant="h4">{processedData.soldUnits}</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('Total Ventas')}
              </Typography>
              <Typography variant="h4">{fCurrency(processedData.totalSalesAmount)}</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('Unidades Compradas')}
              </Typography>
              <Typography variant="h4">{processedData.boughtUnits}</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('Total Compras')}
              </Typography>
              <Typography variant="h4">{fCurrency(processedData.totalPurchasesAmount)}</Typography>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs internos */}
      <Card>
        <Tabs
          value={internalTab}
          onChange={(e, newValue) => setInternalTab(newValue)}
          sx={{ px: 3, pt: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`${t('Ventas')} (${processedData.salesWithProduct.length})`} value="sales" />
          <Tab label={`${t('Compras')} (${processedData.purchasesWithProduct.length})`} value="purchases" />
        </Tabs>

        {/* Tabla de Ventas */}
        {internalTab === 'sales' && (
          <>
            {processedData.salesWithProduct.length === 0 ? (
              <EmptyContent
                filled
                title={t('No hay ventas')}
                description={t('No se encontraron facturas de venta en el rango seleccionado')}
                sx={{ py: 10 }}
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Fecha')}</TableCell>
                      <TableCell>{t('Documento')}</TableCell>
                      <TableCell>{t('Cliente')}</TableCell>
                      <TableCell>{t('Estado')}</TableCell>
                      <TableCell align="right">{t('Total')}</TableCell>
                      <TableCell align="right">{t('Acciones')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {processedData.salesWithProduct.map((invoice: any) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell>
                          <Typography variant="body2">{fDate(invoice.issue_date || invoice.created_at)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {invoice.number || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {invoice.customer_name || invoice.customer_id || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>{renderInvoiceStatusChip(invoice.status)}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {fCurrency(parseFloat(invoice.total_amount || '0'))}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewInvoiceDetail(invoice.id)}
                            title={t('Ver detalle')}
                          >
                            <Iconify icon="solar:eye-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {/* Tabla de Compras */}
        {internalTab === 'purchases' && (
          <>
            {processedData.purchasesWithProduct.length === 0 ? (
              <EmptyContent
                filled
                title={t('No hay compras')}
                description={t('No se encontraron facturas de compra en el rango seleccionado')}
                sx={{ py: 10 }}
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Fecha')}</TableCell>
                      <TableCell>{t('Documento')}</TableCell>
                      <TableCell>{t('Proveedor')}</TableCell>
                      <TableCell>{t('Estado')}</TableCell>
                      <TableCell align="right">{t('Total')}</TableCell>
                      <TableCell align="right">{t('Acciones')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {processedData.purchasesWithProduct.map((bill: any) => (
                      <TableRow key={bill.id} hover>
                        <TableCell>
                          <Typography variant="body2">{fDate(bill.issue_date || bill.created_at)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {bill.number || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{bill.supplier_name || bill.supplier_id || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell>{renderBillStatusChip(bill.status)}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {fCurrency(parseFloat(bill.total_amount || '0'))}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewBillDetail(bill.id)}
                            title={t('Ver detalle')}
                          >
                            <Iconify icon="solar:eye-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Card>
    </Stack>
  );
}
