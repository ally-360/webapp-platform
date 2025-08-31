import React, { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { enqueueSnackbar } from 'notistack';

interface ImportRow {
  code: string;
  name: string;
  level: 'CLASS' | 'GROUP' | 'ACCOUNT' | 'SUBACCOUNT';
  nature: 'DEBIT' | 'CREDIT';
  flags: string[];
}

const mockRows: ImportRow[] = [
  { code: '1', name: 'Activo', level: 'CLASS', nature: 'DEBIT', flags: [] },
  { code: '11', name: 'Disponible', level: 'GROUP', nature: 'DEBIT', flags: [] },
  { code: '1105', name: 'Caja', level: 'ACCOUNT', nature: 'DEBIT', flags: ['reconcilable'] },
  { code: '110505', name: 'Caja general', level: 'SUBACCOUNT', nature: 'DEBIT', flags: ['movements'] }
];

export default function ChartOfAccountsImportPage() {
  const [rows] = useState<ImportRow[]>(mockRows);

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'code', headerName: 'Código', width: 140 },
      { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 200 },
      { field: 'level', headerName: 'Nivel', width: 140 },
      { field: 'nature', headerName: 'Naturaleza', width: 140 },
      { field: 'flags', headerName: 'Flags', flex: 1, minWidth: 200, valueGetter: ({ row }) => row.flags.join(', ') }
    ],
    []
  );

  const handleImport = () => enqueueSnackbar('Importación completada (mock)', { variant: 'success' });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Importar Catálogo</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" component="label">
            Subir CSV/Excel
            <input type="file" hidden />
          </Button>
          <Button variant="contained" onClick={handleImport}>
            Importar
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Previsualización (mock)
          </Typography>
          <DataGrid autoHeight rows={rows} columns={columns} getRowId={(r) => r.code} sx={{ border: 'none' }} />
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Validaciones (mock)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Duplicados de código detectados: 0
            <br />• Longitud de código según nivel: OK
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
