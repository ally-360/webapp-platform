import React, { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import { mockJournal } from 'src/mocks/accounting/journal.mock';
import { JournalEntry } from 'src/mocks/accounting/types';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';

function statusColor(s: JournalEntry['status']) {
  switch (s) {
    case 'POSTED':
      return 'success';
    case 'DRAFT':
      return 'warning';
    case 'REVERSED':
      return 'default';
    default:
      return 'default';
  }
}

export default function JournalListPage() {
  const navigate = useNavigate();
  const [rows] = useState<JournalEntry[]>(mockJournal);
  const [filterText, setFilterText] = useState('');

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'number', headerName: 'Número', width: 120, sortable: false },
      { field: 'date', headerName: 'Fecha', width: 120, sortable: false },
      {
        field: 'concept',
        headerName: 'Concepto',
        flex: 1,
        minWidth: 280,
        sortable: false
      },
      { field: 'reference', headerName: 'Referencia', width: 160, sortable: false },
      {
        field: 'status',
        headerName: 'Estado',
        width: 140,
        sortable: false,
        renderCell: ({ row }) => <Chip size="small" label={row.status} color={statusColor(row.status) as any} />
      },
      {
        field: 'totals',
        headerName: 'Débito / Crédito',
        width: 200,
        sortable: false,
        valueGetter: ({ row }) => `${row.totals.debit.toLocaleString()} / ${row.totals.credit.toLocaleString()}`
      },
      {
        field: 'source',
        headerName: 'Origen',
        width: 140,
        sortable: false
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Ver detalle">
              <IconButton size="small" onClick={() => navigate(paths.dashboard.accounting.journal.details(row.id))}>
                <Icon icon="mdi:eye" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => navigate(paths.dashboard.accounting.journal.edit(row.id))}>
                <Icon icon="mdi:pencil" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [navigate]
  );

  const filtered = useMemo(() => {
    const t = filterText.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) => `${r.number} ${r.concept} ${r.reference ?? ''} ${r.status}`.toLowerCase().includes(t));
  }, [rows, filterText]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Libro Diario</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Icon icon="mdi:download" />}>
            Exportar
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon icon="mdi:plus" />}
            onClick={() => navigate(paths.dashboard.accounting.journal.new)}
          >
            Nuevo asiento
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Buscar por número, concepto o referencia"
              style={{ width: 340, padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
            />
          </Stack>
          <DataGrid
            autoHeight
            rows={filtered}
            columns={columns}
            getRowId={(r) => r.id}
            disableRowSelectionOnClick
            disableColumnMenu
            sx={{ border: 'none' }}
          />
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />
      <Typography variant="body2" color="text.secondary">
        Datos de prueba. Preparado para integración futura con React Query/Zustand/msw.
      </Typography>
    </Box>
  );
}
