import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  MenuItem
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers';
import { LoadingScreen } from 'src/components/loading-screen';
import { useGetJournalEntriesQuery } from 'src/redux/services/accountingApi';
import { JournalEntryDetailDrawer } from 'src/sections/accounting/components/JournalEntryDetailDrawer';
import { fCurrency } from 'src/utils/format-number';
import type { JournalEntry, JournalEntryType, JournalEntryStatus } from 'src/sections/accounting/types';

const entryTypeLabels: Record<JournalEntryType, string> = {
  invoice: 'Factura',
  payment: 'Pago',
  treasury: 'Tesorería',
  debit_note: 'Nota Débito',
  credit_note: 'Nota Crédito',
  adjustment: 'Ajuste',
  manual: 'Manual'
};

const entryTypeColors: Record<JournalEntryType, any> = {
  invoice: 'success',
  payment: 'info',
  treasury: 'warning',
  debit_note: 'error',
  credit_note: 'primary',
  adjustment: 'secondary',
  manual: 'default'
};

const statusLabels: Record<JournalEntryStatus, string> = {
  draft: 'Borrador',
  posted: 'Contabilizado',
  voided: 'Anulado'
};

const statusColors: Record<JournalEntryStatus, any> = {
  draft: 'warning',
  posted: 'success',
  voided: 'error'
};

function JournalListPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState<JournalEntryType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<JournalEntryStatus | ''>('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // Fetch journal entries
  const { data, isLoading, error } = useGetJournalEntriesQuery({
    skip: page * pageSize,
    limit: pageSize,
    ...(searchText && { search: searchText }),
    ...(startDate && { start_date: format(startDate, 'yyyy-MM-dd') }),
    ...(endDate && { end_date: format(endDate, 'yyyy-MM-dd') }),
    ...(selectedType && { entry_type: selectedType }),
    ...(selectedStatus && { status: selectedStatus })
  });

  const entries = data?.journal_entries || [];
  const totalRows = data?.total || 0;

  const handleViewDetail = (entryId: string) => {
    setSelectedEntryId(entryId);
    setDetailDrawerOpen(true);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setStartDate(null);
    setEndDate(null);
    setSelectedType('');
    setSelectedStatus('');
  };

  const hasFilters = Boolean(searchText || startDate || endDate || selectedType || selectedStatus);

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'entry_date',
        headerName: 'Fecha',
        width: 130,
        sortable: false,
        renderCell: ({ row }: { row: JournalEntry }) => (
          <Typography variant="body2">{format(new Date(row.entry_date), 'dd/MM/yyyy', { locale: es })}</Typography>
        )
      },
      {
        field: 'entry_number',
        headerName: 'Número',
        width: 140,
        sortable: false,
        renderCell: ({ row }: { row: JournalEntry }) => (
          <Typography variant="body2" fontWeight={600}>
            {row.entry_number}
          </Typography>
        )
      },
      {
        field: 'entry_type',
        headerName: 'Tipo',
        width: 140,
        sortable: false,
        renderCell: ({ row }: { row: JournalEntry }) => (
          <Chip
            label={entryTypeLabels[row.entry_type]}
            color={entryTypeColors[row.entry_type]}
            size="small"
            variant="outlined"
          />
        )
      },
      {
        field: 'reference_number',
        headerName: 'Referencia',
        width: 140,
        sortable: false,
        renderCell: ({ row }: { row: JournalEntry }) => (
          <Typography variant="body2" color="text.secondary">
            {row.reference_number || '-'}
          </Typography>
        )
      },
      {
        field: 'description',
        headerName: 'Descripción',
        flex: 1,
        minWidth: 250,
        sortable: false,
        renderCell: ({ row }: { row: JournalEntry }) => (
          <Typography variant="body2" noWrap>
            {row.description}
          </Typography>
        )
      },
      {
        field: 'total_debit',
        headerName: 'Débito',
        width: 130,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }: { row: JournalEntry }) => (
          <Typography variant="body2" fontWeight={600} color="info.main">
            {fCurrency(row.total_debit)}
          </Typography>
        )
      },
      {
        field: 'total_credit',
        headerName: 'Crédito',
        width: 130,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }: { row: JournalEntry }) => (
          <Typography variant="body2" fontWeight={600} color="success.main">
            {fCurrency(row.total_credit)}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: 'Estado',
        width: 140,
        sortable: false,
        renderCell: ({ row }: { row: JournalEntry }) => (
          <Chip label={statusLabels[row.status]} color={statusColors[row.status]} size="small" />
        )
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 100,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }: { row: JournalEntry }) => (
          <Tooltip title="Ver detalle">
            <IconButton size="small" onClick={() => handleViewDetail(row.id)}>
              <Icon icon="solar:eye-bold" width={20} />
            </IconButton>
          </Tooltip>
        )
      }
    ],
    []
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error al cargar el libro diario</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Libro Diario</Typography>
        <Tooltip title="Disponible en fase futura">
          <span>
            <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} disabled>
              Nuevo Asiento
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/* Info banner - READ ONLY */}
      <Card sx={{ mb: 3, bgcolor: 'info.lighter' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Icon icon="mdi:information" width={24} color="#0288d1" />
            <Box>
              <Typography variant="subtitle2" color="info.darker">
                Fase 1 - Solo lectura
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Los asientos se generan automáticamente por las operaciones del sistema (ventas, pagos, tesorería,
                etc.). La creación manual estará disponible en una fase futura.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            {/* Primera fila: Búsqueda y fechas */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Buscar por número o descripción..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: <Icon icon="mdi:magnify" style={{ marginRight: 8 }} />
                }}
              />
              <DatePicker
                label="Fecha inicio"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                slotProps={{
                  textField: { fullWidth: true, size: 'medium' }
                }}
              />
              <DatePicker
                label="Fecha fin"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                slotProps={{
                  textField: { fullWidth: true, size: 'medium' }
                }}
              />
            </Stack>

            {/* Segunda fila: Tipo y Estado */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Tipo de asiento"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as JournalEntryType)}
                sx={{ minWidth: 200 }}
                fullWidth
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(entryTypeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Estado"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as JournalEntryStatus)}
                sx={{ minWidth: 200 }}
                fullWidth
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              {hasFilters && (
                <Button
                  variant="outlined"
                  startIcon={<Icon icon="mdi:filter-off" />}
                  onClick={handleClearFilters}
                  sx={{ minWidth: 150 }}
                >
                  Limpiar filtros
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Card>
          <CardContent>
            {entries.length === 0 ? (
              <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
                <Icon icon="mdi:book-open-outline" width={64} color="text.secondary" />
                <Typography variant="h6" color="text.secondary">
                  No se encontraron asientos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasFilters ? 'Intenta ajustar los filtros' : 'Aún no hay asientos contables registrados'}
                </Typography>
              </Stack>
            ) : (
              <DataGrid
                autoHeight
                rows={entries}
                columns={columns}
                rowCount={totalRows}
                paginationMode="server"
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(model) => {
                  setPage(model.page);
                  setPageSize(model.pageSize);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                disableColumnMenu
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none'
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer'
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Drawer */}
      <JournalEntryDetailDrawer
        entryId={selectedEntryId}
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedEntryId(null);
        }}
      />
    </Box>
  );
}

export default JournalListPage;
