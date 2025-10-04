import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { mockJournal } from 'src/mocks/accounting/journal.mock';

export default function JournalEntryDetailPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const entry = mockJournal.find((e) => e.id === entryId);

  if (!entry) {
    return <Typography variant="body2">Asiento no encontrado.</Typography>;
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Asiento {entry.number}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Icon icon="mdi:arrow-left" />} onClick={() => navigate(-1)}>
            Volver
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon icon="mdi:repeat" />}
            onClick={() => navigate(`/dashboard/accounting/journal/${entry.id}/reversal`)}
          >
            Reversar
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Fecha: {entry.date}</Typography>
            <Typography variant="subtitle2">Referencia: {entry.reference || '-'}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={entry.status} size="small" />
              {entry.source && <Chip label={`Origen: ${entry.source}`} size="small" color="info" />}
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Líneas
          </Typography>
          <Stack spacing={1}>
            {entry.lines.map((l) => (
              <Stack key={l.id} direction="row" spacing={2} justifyContent="space-between">
                <Typography variant="body2" sx={{ minWidth: 200 }}>
                  {l.accountCode} - {l.accountName}
                </Typography>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {l.description || '-'}
                </Typography>
                <Typography variant="body2" sx={{ minWidth: 120, textAlign: 'right' }}>
                  {l.debit.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ minWidth: 120, textAlign: 'right' }}>
                  {l.credit.toLocaleString()}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Typography variant="subtitle2">Total Débito: {entry.totals.debit.toLocaleString()}</Typography>
            <Typography variant="subtitle2">Total Crédito: {entry.totals.credit.toLocaleString()}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
