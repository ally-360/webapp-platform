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
  Drawer,
  Divider,
  Alert,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { subDays, format } from 'date-fns';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useGetSalesInvoicesQuery } from 'src/redux/services/salesInvoicesApi';
import { useGetBillsQuery } from 'src/redux/services/billsApi';
import { useListMovementsQuery } from 'src/redux/services/inventoryMovementsApi';
import { useGetJournalEntryByIdQuery } from 'src/redux/services/accountingApi';
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

interface ProductAccountingTabProps {
  productId: string;
  productName: string;
}

type SourceType = 'SALE' | 'PURCHASE' | 'INVENTORY';
type FilterType = 'all' | 'sales' | 'purchases' | 'inventory';

interface AccountingEntry {
  source: SourceType;
  reference_type: string;
  reference_id: string;
  document_label: string;
  entry_id?: string;
  entry_date?: string;
  total_debit?: string;
  total_credit?: string;
  status?: string;
  hasJournalEntry: boolean;
  loading?: boolean;
  error?: boolean;
}

export default function ProductAccountingTab({ productId, productName }: ProductAccountingTabProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Estado local
  const [filter, setFilter] = useState<FilterType>('all');
  const [dateRange] = useState({
    start_date: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedEntry, setSelectedEntry] = useState<AccountingEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Queries para obtener documentos relacionados
  const { data: invoicesData, isLoading: isLoadingInvoices } = useGetSalesInvoicesQuery({
    product_id: productId,
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    limit: 1000
  });

  const { data: billsData, isLoading: isLoadingBills } = useGetBillsQuery({
    product_id: productId,
    date_from: dateRange.start_date,
    date_to: dateRange.end_date,
    limit: 1000
  });

  const { data: movementsData, isLoading: isLoadingMovements } = useListMovementsQuery({
    product_id: productId,
    limit: 100,
    offset: 0
  });

  // Procesar documentos y crear entradas contables
  const accountingEntries = useMemo(() => {
    const entries: AccountingEntry[] = [];

    // Procesar facturas de venta
    if (invoicesData?.invoices) {
      invoicesData.invoices.forEach((invoice) => {
        entries.push({
          source: 'SALE',
          reference_type: 'invoice',
          reference_id: invoice.id,
          document_label: invoice.number || 'N/A',
          entry_date: invoice.issue_date || invoice.created_at,
          entry_id: invoice.journal_entry_id || undefined,
          hasJournalEntry: !!invoice.journal_entry_id,
          status: invoice.status
        });
      });
    }

    // Procesar facturas de compra
    if (billsData?.items) {
      billsData.items.forEach((bill) => {
        entries.push({
          source: 'PURCHASE',
          reference_type: 'bill',
          reference_id: bill.id,
          document_label: bill.number || 'N/A',
          entry_date: bill.issue_date || bill.created_at,
          entry_id: bill.journal_entry_id || undefined,
          hasJournalEntry: !!bill.journal_entry_id,
          status: bill.status
        });
      });
    }

    // Procesar movimientos de inventario
    if (movementsData) {
      movementsData.forEach((movement) => {
        entries.push({
          source: 'INVENTORY',
          reference_type: 'movement',
          reference_id: movement.id,
          document_label: movement.reference || 'Ajuste',
          entry_date: movement.created_at,
          entry_id: movement.journal_entry_id || undefined,
          hasJournalEntry: !!movement.journal_entry_id,
          status: 'POSTED'
        });
      });
    }

    // Ordenar por fecha descendente
    return entries.sort((a, b) => {
      const dateA = new Date(a.entry_date || 0);
      const dateB = new Date(b.entry_date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [invoicesData, billsData, movementsData]);

  // Filtrar entradas según filtro seleccionado
  const filteredEntries = useMemo(() => {
    if (filter === 'all') return accountingEntries;
    if (filter === 'sales') return accountingEntries.filter((e) => e.source === 'SALE');
    if (filter === 'purchases') return accountingEntries.filter((e) => e.source === 'PURCHASE');
    if (filter === 'inventory') return accountingEntries.filter((e) => e.source === 'INVENTORY');
    return accountingEntries;
  }, [accountingEntries, filter]);

  // Calcular resumen
  const summary = useMemo(() => {
    const total = accountingEntries.length;
    const sales = accountingEntries.filter((e) => e.source === 'SALE').length;
    const purchases = accountingEntries.filter((e) => e.source === 'PURCHASE').length;
    const inventory = accountingEntries.filter((e) => e.source === 'INVENTORY').length;
    const withJournalEntry = accountingEntries.filter((e) => e.hasJournalEntry).length;

    return { total, sales, purchases, inventory, withJournalEntry };
  }, [accountingEntries]);

  // Navegación
  const handleViewDocument = (entry: AccountingEntry) => {
    if (entry.reference_type === 'invoice') {
      router.push(paths.dashboard.sales.details(entry.reference_id));
    } else if (entry.reference_type === 'bill') {
      router.push(paths.dashboard.bill.details(entry.reference_id));
    }
    // Movements no tienen ruta de detalle implementada aún
  };

  const handleViewJournalEntry = (entry: AccountingEntry) => {
    setSelectedEntry(entry);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedEntry(null);
  };

  // Render de chips
  const renderSourceChip = (source: SourceType) => {
    const config = {
      SALE: { label: 'Venta', color: 'success' as const, icon: 'solar:bill-list-bold' },
      PURCHASE: { label: 'Compra', color: 'warning' as const, icon: 'solar:card-send-bold' },
      INVENTORY: { label: 'Inventario', color: 'info' as const, icon: 'solar:box-bold' }
    };
    const cfg = config[source];
    return (
      <Chip
        icon={<Iconify icon={cfg.icon} width={16} />}
        label={cfg.label}
        color={cfg.color}
        size="small"
        variant="soft"
      />
    );
  };

  const renderStatusChip = (status?: string, hasJournalEntry?: boolean) => {
    if (!hasJournalEntry) {
      return <Chip label="Sin asiento" color="default" size="small" />;
    }
    if (status === 'VOID' || status === 'void') {
      return <Chip label="Anulado" color="error" size="small" />;
    }
    return <Chip label="Contabilizado" color="success" size="small" />;
  };

  // Loading state
  if (isLoadingInvoices || isLoadingBills || isLoadingMovements) {
    return (
      <Stack spacing={3} sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="rectangular" height={400} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6">{t('Contabilidad')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Asientos y movimientos contables relacionados con')} {productName}
          </Typography>
        </Box>
        <ToggleButtonGroup value={filter} exclusive onChange={(e, value) => value && setFilter(value)} size="small">
          <ToggleButton value="all">{t('Todo')}</ToggleButton>
          <ToggleButton value="sales">{t('Ventas')}</ToggleButton>
          <ToggleButton value="purchases">{t('Compras')}</ToggleButton>
          <ToggleButton value="inventory">{t('Inventario')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('Total Documentos')}
              </Typography>
              <Typography variant="h4">{summary.total}</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('Ventas')}
              </Typography>
              <Typography variant="h4">{summary.sales}</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('Compras')}
              </Typography>
              <Typography variant="h4">{summary.purchases}</Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {t('Inventario')}
              </Typography>
              <Typography variant="h4">{summary.inventory}</Typography>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de asientos */}
      <Card>
        {filteredEntries.length === 0 ? (
          <EmptyContent
            filled
            title={t('No hay documentos')}
            description={t('No se encontraron documentos contables en el rango seleccionado')}
            sx={{ py: 10 }}
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Fecha')}</TableCell>
                  <TableCell>{t('Origen')}</TableCell>
                  <TableCell>{t('Documento')}</TableCell>
                  <TableCell>{t('Referencia')}</TableCell>
                  <TableCell>{t('Estado')}</TableCell>
                  <TableCell align="right">{t('Acciones')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEntries.map((entry, index) => (
                  <TableRow key={`${entry.reference_type}-${entry.reference_id}-${index}`} hover>
                    <TableCell>
                      <Typography variant="body2">{fDate(entry.entry_date)}</Typography>
                    </TableCell>
                    <TableCell>{renderSourceChip(entry.source)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {entry.document_label}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {entry.reference_type}/{entry.reference_id.slice(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{renderStatusChip(entry.status, entry.hasJournalEntry)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {entry.hasJournalEntry && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewJournalEntry(entry)}
                            title={t('Ver asiento')}
                          >
                            <Iconify icon="solar:document-text-bold" />
                          </IconButton>
                        )}
                        {(entry.reference_type === 'invoice' || entry.reference_type === 'bill') && (
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewDocument(entry)}
                            title={t('Ver documento')}
                          >
                            <Iconify icon="solar:eye-bold" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Drawer para detalle del asiento */}
      <JournalEntryDrawer open={drawerOpen} entry={selectedEntry} onClose={handleCloseDrawer} />
    </Stack>
  );
}

// Componente para el drawer de detalle de asiento
interface JournalEntryDrawerProps {
  open: boolean;
  entry: AccountingEntry | null;
  onClose: () => void;
}

function JournalEntryDrawer({ open, entry, onClose }: JournalEntryDrawerProps) {
  const { t } = useTranslation();

  // Obtener detalle del journal entry si existe
  const { data: journalEntry, isLoading } = useGetJournalEntryByIdQuery(entry?.entry_id || '', {
    skip: !entry?.entry_id
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 } }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h6">{t('Detalle del Asiento')}</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="solar:close-circle-bold" />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Loading */}
        {isLoading && (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        )}

        {/* Contenido */}
        {!isLoading && entry && (
          <Stack spacing={3}>
            {/* Info básica */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('Documento origen')}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {entry.document_label}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('Fecha')}
              </Typography>
              <Typography variant="body1">{fDate(entry.entry_date)}</Typography>
            </Box>

            {/* Detalle del journal entry si existe */}
            {journalEntry && (
              <>
                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('Número de asiento')}
                  </Typography>
                  <Typography variant="body1">{journalEntry.entry_number || 'N/A'}</Typography>
                </Box>

                {journalEntry.description && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('Descripción')}
                    </Typography>
                    <Typography variant="body2">{journalEntry.description}</Typography>
                  </Box>
                )}

                {/* Tabla de líneas del asiento */}
                {journalEntry.lines && journalEntry.lines.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      {t('Líneas del asiento')}
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>{t('Cuenta')}</TableCell>
                            <TableCell align="right">{t('Débito')}</TableCell>
                            <TableCell align="right">{t('Crédito')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {journalEntry.lines.map((line: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="caption">
                                  {line.account_code || line.account_name || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {line.debit ? fCurrency(parseFloat(line.debit)) : '-'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {line.credit ? fCurrency(parseFloat(line.credit)) : '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Totales */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2">{t('Total Débito')}</Typography>
                        <Typography variant="subtitle2">
                          {fCurrency(parseFloat(journalEntry.total_debit || '0'))}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography variant="subtitle2">{t('Total Crédito')}</Typography>
                        <Typography variant="subtitle2">
                          {fCurrency(parseFloat(journalEntry.total_credit || '0'))}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                )}
              </>
            )}

            {/* Sin asiento */}
            {!entry.hasJournalEntry && (
              <Alert severity="info">
                {t(
                  'Este documento aún no tiene un asiento contable asociado. Esto puede ocurrir si el documento está en borrador o pendiente de aprobación.'
                )}
              </Alert>
            )}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
