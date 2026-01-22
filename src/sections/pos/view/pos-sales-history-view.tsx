import React, { useMemo, useCallback, useState, memo } from 'react';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  Container,
  Stack,
  Tabs,
  Tab,
  TextField,
  Table,
  TableBody,
  TableContainer,
  Typography,
  Button,
  IconButton,
  Tooltip,
  MenuItem,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import { format } from 'date-fns';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  emptyRows,
  getComparator,
  useTable
} from 'src/components/table';
import Label from 'src/components/label';
import { paths } from 'src/routes/paths';
import CustomPopover from 'src/components/custom-popover';
import { fCurrency } from 'src/utils/format-number';
import { PAYMENT_LABEL, escapeCsv, printSale } from 'src/sections/pos/components/sales-history/utils';
import {
  cancelSale as apiCancelSale,
  createCreditNote as apiCreateCreditNote,
  downloadSalePDF as apiDownloadSalePDF
} from 'src/api';
import CustomDateRangePicker from 'src/components/custom-date-range-picker';
import { fDate, fDateTime } from 'src/utils/format-time';
import { useGetPOSSalesQuery, useGetPOSSaleQuery } from 'src/redux/services/posApi';
import type { POSInvoice } from 'src/types/pos';
import { LoadingScreen } from 'src/components/loading-screen';

// Local interface for transformed sales data
interface TransformedSale {
  id: string;
  invoice_number: string;
  created_at: string;
  customer: { name: string } | null;
  seller_name: string;
  products: any[];
  payments: any[];
  subtotal: number;
  tax_amount: number;
  total: number;
  pos_type: 'simple' | 'electronic';
  status: 'paid' | 'cancelled' | 'refunded';
}

const TABLE_HEAD = [
  { id: 'created_at', label: 'Fecha', width: 160 },
  { id: 'invoice_number', label: 'Factura', width: 120 },
  { id: 'customer', label: 'Cliente' },
  { id: 'items', label: 'Items', width: 100, align: 'center' as const },
  { id: 'total', label: 'Total', width: 140 },
  { id: 'payments', label: 'Pagos', width: 220 },
  { id: 'seller', label: 'Vendedor', width: 180 },
  { id: 'pos_type', label: 'Tipo POS', width: 120 },
  { id: '', label: '', width: 80, align: 'right' as const }
];

const POS_TYPE_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'simple', label: 'Simple' },
  { value: 'electronic', label: 'Electrónico' }
] as const;

interface Filters {
  query: string;
  pos_type: 'all' | 'simple' | 'electronic';
  startDate: string | null; // yyyy-MM-dd
  endDate: string | null; // yyyy-MM-dd
  seller_id?: string; // Nuevo filtro para vendedor
}

const defaultFilters: Filters = {
  query: '',
  pos_type: 'all',
  startDate: null,
  endDate: null,
  seller_id: undefined
};

// Memoized row component
const SaleRow = memo(({ row, onOpenActions, active }: any) => {
  const items = useMemo(
    () => (row.products?.length > 0 ? row.products.reduce((sum: number, p: any) => sum + p.quantity, 0) : '-'),
    [row.products]
  );
  const payments = useMemo(() => {
    if (!row.payments || row.payments.length === 0) {
      return fCurrency(row.total); // Show total if payments not available
    }
    return row.payments.map((p: any) => `${PAYMENT_LABEL[p.method] || p.method}: ${fCurrency(p.amount)}`).join(' | ');
  }, [row.payments, row.total]);
  const dateStr = useMemo(() => fDateTime(row.created_at, 'dd MMM yyyy HH:mm'), [row.created_at]);

  return (
    <TableRow hover sx={{ opacity: row.status === 'cancelled' ? 0.6 : 1 }}>
      <TableCell sx={{ width: 160 }}>{dateStr}</TableCell>
      <TableCell sx={{ width: 120 }}>{row.invoice_number || '-'}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <span>{row.customer?.name || 'Sin cliente'}</span>
          {row.status === 'cancelled' && <Label color="error">Anulada</Label>}
          {row.status === 'refunded' && <Label color="warning">Nota crédito</Label>}
        </Stack>
      </TableCell>
      <TableCell sx={{ width: 100, textAlign: 'center' }}>{items}</TableCell>
      <TableCell sx={{ width: 140 }}>{fCurrency(row.total)}</TableCell>
      <TableCell sx={{ width: 220 }}>{payments}</TableCell>
      <TableCell sx={{ width: 180 }}>{row.seller_name || '-'}</TableCell>
      <TableCell sx={{ width: 120 }}>{row.pos_type === 'electronic' ? 'Electrónico' : 'Simple'}</TableCell>
      <TableCell align="right" sx={{ width: 80, px: 1 }}>
        <Tooltip title="Acciones">
          <IconButton color={active ? 'inherit' : 'default'} onClick={(e) => onOpenActions(e, row)}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
});

// Fix indentation/formatting by converting to named memoized component with explicit props
type FiltersBarProps = {
  filters: Filters;
  onFilters: (name: keyof Filters, value: any) => void;
  canReset: boolean;
  dateError: boolean;
};

const FiltersBar = memo(({ filters, onFilters, canReset, dateError }: FiltersBarProps) => {
  // Local dialog state for the custom date range picker
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (filters.startDate && filters.endDate) {
      return `${fDate(filters.startDate, 'dd MMM yy')} - ${fDate(filters.endDate, 'dd MMM yy')}`;
    }
    return 'Rango de fechas';
  }, [filters.startDate, filters.endDate]);

  const handleChangeStart = useCallback(
    (newValue: Date | string | null) => {
      const v = newValue ? new Date(newValue as any) : null;
      onFilters('startDate', v ? v.toISOString().slice(0, 10) : null);
    },
    [onFilters]
  );

  const handleChangeEnd = useCallback(
    (newValue: Date | string | null) => {
      const v = newValue ? new Date(newValue as any) : null;
      onFilters('endDate', v ? v.toISOString().slice(0, 10) : null);
    },
    [onFilters]
  );

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}>
      <TextField
        fullWidth
        value={filters.query}
        onChange={(e) => onFilters('query', e.target.value)}
        placeholder="Buscar por factura, cliente o vendedor"
        InputProps={{
          startAdornment: (
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', color: 'text.disabled', mr: 1 }}>
              <Iconify icon="eva:search-fill" />
            </Box>
          )
        }}
      />

      {/* Read-only text field that opens the custom date range picker */}
      <TextField
        value={label}
        onClick={() => setOpen(true)}
        label="Rango de fechas"
        InputProps={{
          readOnly: true,
          startAdornment: (
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', color: 'text.disabled', mr: 1 }}>
              <Iconify icon="solar:calendar-broken" />
            </Box>
          )
        }}
        sx={{ width: { xs: 1, md: 260 } }}
      />

      {dateError && (
        <Typography color="error" variant="caption">
          Rango de fechas inválido
        </Typography>
      )}

      {canReset && (
        <Box sx={{ ml: { xs: 0, md: 'auto' } }}>
          <Button
            color="inherit"
            onClick={() => onFilters('query', '')}
            startIcon={<Iconify icon="solar:refresh-bold" />}
          >
            Limpiar filtros
          </Button>
        </Box>
      )}

      <CustomDateRangePicker
        open={open}
        onClose={() => setOpen(false)}
        variant="calendar"
        title="Seleccionar rango"
        startDate={filters.startDate ? new Date(filters.startDate) : null}
        endDate={filters.endDate ? new Date(filters.endDate) : null}
        onChangeStartDate={handleChangeStart}
        onChangeEndDate={handleChangeEnd}
        error={dateError}
      />
    </Stack>
  );
});

const DetailsDialog = memo(({ open, onClose, saleId, onPrint }: any) => {
  // Fetch full sale detail when dialog opens
  const { data: saleDetail, isLoading } = useGetPOSSaleQuery(saleId, {
    skip: !open || !saleId
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalle de venta</DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
            <LoadingScreen />
          </Stack>
        )}

        {!isLoading && saleDetail && (
          <Stack spacing={2}>
            {/* Información básica */}
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Info label="Factura" value={saleDetail.number || '-'} />
              <Info label="Fecha" value={fDateTime(saleDetail.issue_date, 'dd MMM yyyy')} />
              <Info label="Cliente" value={saleDetail.customer_name || 'Sin cliente'} />
              <Info label="Vendedor" value={saleDetail.seller_name || '-'} />
              <Info label="PDV" value={saleDetail.pdv_name || '-'} />
              <Info label="Estado" value={saleDetail.status} />
              {saleDetail.cost_center && (
                <Info
                  label="Centro de Costo"
                  value={
                    saleDetail.cost_center.code
                      ? `${saleDetail.cost_center.code} · ${saleDetail.cost_center.name}`
                      : saleDetail.cost_center.name
                  }
                />
              )}
            </Stack>

            <Divider />

            {/* Productos */}
            <Typography variant="subtitle2">Productos</Typography>
            <Stack spacing={0.5}>
              {saleDetail.line_items?.map((item: any, index: number) => (
                <Stack key={`${item.sku}-${index}`} direction="row" justifyContent="space-between">
                  <Typography variant="body2">
                    {item.product_name} {item.sku ? `(${item.sku})` : ''} — x{item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    {fCurrency(item.unit_price)} x {item.quantity} = {fCurrency(item.subtotal)}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider />

            {/* Pagos */}
            <Typography variant="subtitle2">Pagos</Typography>
            <Stack spacing={0.5}>
              {saleDetail.payments?.map((payment: any, index: number) => (
                <Stack key={`${payment.method}-${index}`} direction="row" justifyContent="space-between">
                  <Typography variant="body2">
                    {PAYMENT_LABEL[payment.method] || payment.method}
                    {payment.reference && ` (Ref: ${payment.reference})`}
                  </Typography>
                  <Typography variant="body2">{fCurrency(payment.amount)}</Typography>
                </Stack>
              ))}
            </Stack>

            <Divider />

            {/* Totales */}
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Subtotal</Typography>
              <Typography variant="subtitle2">{fCurrency(saleDetail.subtotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Impuestos</Typography>
              <Typography variant="subtitle2">{fCurrency(saleDetail.tax)}</Typography>
            </Stack>
            {saleDetail.discount > 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Descuento</Typography>
                <Typography variant="subtitle2">-{fCurrency(saleDetail.discount)}</Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">{fCurrency(saleDetail.total)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2" color="success.main">
                Pagado
              </Typography>
              <Typography variant="subtitle2" color="success.main">
                {fCurrency(saleDetail.total_paid)}
              </Typography>
            </Stack>

            {/* Notas */}
            {saleDetail.notes && (
              <>
                <Divider />
                <Stack>
                  <Typography variant="subtitle2">Notas</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {saleDetail.notes}
                  </Typography>
                </Stack>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button
          onClick={onPrint}
          startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
          variant="contained"
          disabled={!saleDetail}
        >
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default function PosSalesHistoryView() {
  const table = useTable({ defaultOrderBy: 'created_at' });
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // actions state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedSale, setSelectedSale] = useState<TransformedSale | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Prepare API parameters from filters
  const apiParams = useMemo(() => {
    const params: any = {
      limit: 1000, // Get more records for client-side filtering
      offset: 0
    };

    if (filters.startDate) {
      params.start_date = filters.startDate;
    }

    if (filters.endDate) {
      params.end_date = filters.endDate;
    }

    if (filters.seller_id) {
      params.seller_id = filters.seller_id;
    }

    return params;
  }, [filters.startDate, filters.endDate, filters.seller_id]);

  // Use RTK Query to fetch POS sales
  const { data: salesResponse, isLoading: loading } = useGetPOSSalesQuery(apiParams);

  // Transform API response to match expected format
  const rowsAll = useMemo((): TransformedSale[] => {
    if (!salesResponse?.items) return [];

    return salesResponse.items.map((sale: POSInvoice) => {
      // Map status to expected values
      let status: 'paid' | 'cancelled' | 'refunded' = 'paid';
      const saleStatus = sale.status?.toUpperCase();
      if (saleStatus === 'CANCELLED') {
        status = 'cancelled';
      } else if (saleStatus === 'REFUNDED') {
        status = 'refunded';
      }

      // Determine pos_type from sale data
      let pos_type: 'simple' | 'electronic' = 'simple';
      if (sale.pos_type?.toLowerCase().includes('electronic') || sale.pos_type?.toLowerCase().includes('electrónico')) {
        pos_type = 'electronic';
      }

      return {
        id: sale.id,
        invoice_number: sale.invoice_number || sale.number,
        created_at: sale.created_at,
        customer: sale.customer_name ? { name: sale.customer_name } : null,
        seller_name: sale.seller_name || 'Sin vendedor',
        products: sale.line_items || [],
        payments: sale.payments || [],
        subtotal: typeof sale.subtotal === 'number' ? sale.subtotal : parseFloat(String(sale.subtotal || '0')),
        tax_amount: typeof sale.tax === 'number' ? sale.tax : parseFloat(String(sale.tax || '0')),
        total: typeof sale.total === 'number' ? sale.total : parseFloat(String(sale.total || '0')),
        pos_type,
        status
      };
    });
  }, [salesResponse]);

  const dateError = useMemo(() => {
    if (filters.startDate && filters.endDate) {
      return new Date(filters.startDate).getTime() > new Date(filters.endDate).getTime();
    }
    return false;
  }, [filters.startDate, filters.endDate]);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: rowsAll,
        comparator: getComparator(table.order, table.orderBy),
        filters,
        dateError
      }),
    [rowsAll, table.order, table.orderBy, filters, dateError]
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !!filters.query || filters.pos_type !== 'all' || (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: keyof Filters, value: any) => {
      table.onResetPage();
      if (name === 'query' && value === '') {
        setFilters((prev) => ({
          ...prev,
          query: '',
          pos_type: 'all',
          startDate: null,
          endDate: null
        }));
      } else {
        setFilters((prev) => ({ ...prev, [name]: value }));
      }
    },
    [table]
  );

  const handleFilterPosType = useCallback(
    (_e: any, newValue: any) => {
      handleFilters('pos_type', newValue);
    },
    [handleFilters]
  );

  // Local any-cast to satisfy Scrollbar typing in this file
  const ScrollbarAny: any = Scrollbar;

  const openActions = (event: React.MouseEvent<HTMLElement>, sale: TransformedSale) => {
    setAnchorEl(event.currentTarget);
    setSelectedSale(sale);
  };
  const closeActions = () => setAnchorEl(null);

  const handleViewDetails = () => {
    setDetailsOpen(true);
    closeActions();
  };
  const handleCloseDetails = () => setDetailsOpen(false);

  const handleReprint = () => {
    if (!selectedSale) return;
    printSale(selectedSale);
    closeActions();
  };

  const handleDownloadPDF = async () => {
    if (!selectedSale) return;
    try {
      setActionLoading(true);
      const res = await apiDownloadSalePDF(selectedSale.id);
      const url = (res as any)?.data?.url || (res as any)?.data?.downloadUrl;
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      // noop; could add snackbar
    } finally {
      setActionLoading(false);
      closeActions();
    }
  };

  const updateRowOptimistic = (id: string, patch: Partial<TransformedSale>) => {
    // Since we're using RTK Query, we should ideally use optimistic updates
    // For now, we'll just update the selectedSale if it matches
    if (selectedSale && selectedSale.id === id) {
      setSelectedSale({ ...selectedSale, ...patch });
    }
  };

  const handleCancelSale = async () => {
    if (!selectedSale) return;
    const { id } = selectedSale;
    const prev = selectedSale;
    updateRowOptimistic(id, { status: 'cancelled' });
    setActionLoading(true);
    try {
      await apiCancelSale(id);
    } catch (e) {
      // revert on failure
      updateRowOptimistic(id, { status: prev.status });
    } finally {
      setActionLoading(false);
      closeActions();
    }
  };

  const handleCreateCreditNote = async () => {
    if (!selectedSale) return;
    const reason = window.prompt('Motivo de la nota crédito:') || 'Ajuste';
    const { id } = selectedSale;
    const prev = selectedSale;
    updateRowOptimistic(id, { status: 'refunded' });
    setActionLoading(true);
    try {
      await apiCreateCreditNote(id, { reason } as any);
    } catch (e) {
      // revert on failure
      updateRowOptimistic(id, { status: prev.status });
    } finally {
      setActionLoading(false);
      closeActions();
    }
  };

  const handleExportSingle = () => {
    if (!selectedSale) return;
    exportCsv([selectedSale]);
    closeActions();
  };

  const exportCsv = (rows: any[]) => {
    const headers = ['Fecha', 'Factura', 'Cliente', 'Items', 'Total', 'Pagos', 'Vendedor', 'Tipo POS'];
    const lines = rows.map((row) => {
      const dateStr = format(new Date(row.created_at), 'yyyy-MM-dd HH:mm');
      const items = row.products.reduce((sum: number, p: any) => sum + p.quantity, 0);
      const payments = row.payments.map((p: any) => `${PAYMENT_LABEL[p.method] || p.method}: ${p.amount}`).join(' | ');
      const posType = row.pos_type === 'electronic' ? 'Electrónico' : 'Simple';
      const values = [
        dateStr,
        row.invoice_number || '-',
        row.customer?.name || 'Sin cliente',
        String(items),
        String(row.total),
        payments,
        row.seller_name || '-',
        posType
      ];
      return values.map(escapeCsv).join(',');
    });

    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historial_ventas_pos_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading="Historial de ventas"
        icon="mdi:history"
        links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Historial' }]}
        action={
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:download-outline" />}
            onClick={() => exportCsv(dataFiltered)}
          >
            Exportar CSV
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={filters.pos_type}
          onChange={handleFilterPosType}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`
          }}
        >
          {POS_TYPE_TABS.map((tab) => (
            <Tab
              key={tab.value}
              iconPosition="end"
              value={tab.value}
              label={tab.label}
              icon={
                <Label
                  variant={((tab.value === 'all' || tab.value === filters.pos_type) && 'filled') || 'soft'}
                  color={(tab.value === 'electronic' && 'info') || (tab.value === 'simple' && 'default') || 'default'}
                >
                  {tab.value === 'all' ? rowsAll.length : rowsAll.filter((s) => s.pos_type === tab.value).length}
                </Label>
              }
            />
          ))}
        </Tabs>

        <FiltersBar filters={filters} onFilters={handleFilters} canReset={canReset} dateError={dateError} />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <ScrollbarAny>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1100 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={0}
                onSort={table.onSort}
              />

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Stack spacing={2} sx={{ p: 2 }}>
                        <Box height={16} bgcolor={(t) => alpha(t.palette.grey[500], 0.24)} borderRadius={1} />
                        <Box height={16} bgcolor={(t) => alpha(t.palette.grey[500], 0.24)} borderRadius={1} />
                        <Box height={16} bgcolor={(t) => alpha(t.palette.grey[500], 0.24)} borderRadius={1} />
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}

                {dataFiltered
                  .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row) => (
                    <SaleRow
                      key={row.id}
                      row={row}
                      onOpenActions={openActions}
                      active={Boolean(anchorEl && selectedSale?.id === row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />
                <TableNoData notFound={notFound} text="No hay ventas registradas" />
              </TableBody>
            </Table>
          </ScrollbarAny>
        </TableContainer>

        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      <CustomPopover open={anchorEl} onClose={closeActions} arrow="right-top" sx={{ width: 220 }}>
        <MenuItem onClick={handleViewDetails} disabled={!selectedSale || actionLoading}>
          <Iconify icon="solar:eye-bold" /> Ver detalles
        </MenuItem>
        <MenuItem onClick={handleDownloadPDF} disabled={!selectedSale || actionLoading}>
          <Iconify icon="mdi:file-pdf-box" /> Descargar PDF
        </MenuItem>
        <MenuItem onClick={handleReprint} disabled={!selectedSale || actionLoading}>
          <Iconify icon="solar:printer-minimalistic-bold" /> Reimprimir
        </MenuItem>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <MenuItem
          onClick={handleCancelSale}
          disabled={!selectedSale || selectedSale?.status === 'cancelled' || actionLoading}
        >
          <Iconify icon="mdi:cancel" /> Anular
        </MenuItem>
        <MenuItem
          onClick={handleCreateCreditNote}
          disabled={!selectedSale || selectedSale?.status === 'cancelled' || actionLoading}
        >
          <Iconify icon="mdi:note-outline" /> Emitir nota crédito
        </MenuItem>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <MenuItem onClick={handleExportSingle} disabled={!selectedSale || actionLoading}>
          <Iconify icon="eva:download-outline" /> Exportar CSV
        </MenuItem>
      </CustomPopover>

      <DetailsDialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        saleId={selectedSale?.id}
        onPrint={handleReprint}
      />
    </Container>
  );
}

function applyFilter({ inputData, comparator, filters, dateError }: any) {
  const { query, pos_type, startDate, endDate } = filters as Filters;
  let data = [...inputData];

  // sort
  const stabilizedThis = data.map((el, index) => [el, index] as const);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  data = stabilizedThis.map((el) => el[0]);

  // query search
  if (query) {
    const q = query.toLowerCase();
    data = data.filter((row: any) => {
      const inInvoice = (row.invoice_number || '').toLowerCase().includes(q);
      const inCustomer = (row.customer?.name || '').toLowerCase().includes(q);
      const inSeller = (row.seller_name || '').toLowerCase().includes(q);
      return inInvoice || inCustomer || inSeller;
    });
  }

  // pos type
  if (pos_type !== 'all') {
    data = data.filter((row: any) => row.pos_type === pos_type);
  }

  // dates (inclusive for whole days)
  if (!dateError && startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const startMs = start.getTime();
    const endMs = end.getTime();
    data = data.filter((row: any) => {
      const created = new Date(row.created_at).getTime();
      return created >= startMs && created <= endMs;
    });
  }

  return data;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
