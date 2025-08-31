import React, { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { mockChartAccounts } from 'src/mocks/accounting/chart-of-accounts.mock';
import { JournalEntry, JournalLine } from 'src/mocks/accounting/types';
import { useNavigate, useParams } from 'react-router-dom';

export default function JournalEntryEditorPage() {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const isNew = !entryId || entryId === 'new';

  const [entry, setEntry] = useState<JournalEntry>({
    id: entryId || 'new',
    number: '',
    date: new Date().toISOString().slice(0, 10),
    concept: '',
    currency: 'COP',
    status: 'DRAFT',
    lines: [],
    totals: { debit: 0, credit: 0 },
    createdAt: new Date().toISOString(),
    createdBy: 'user@ally360.io'
  });

  const accounts = mockChartAccounts.filter((a) => a.allowMovements || a.level === 'SUBACCOUNT');

  const addLine = () => {
    const newLine: JournalLine = {
      id: Math.random().toString(36).slice(2),
      accountId: accounts[0]?.id || '110505',
      accountCode: accounts[0]?.code || '110505',
      accountName: accounts[0]?.name || 'Caja general',
      debit: 0,
      credit: 0
    };
    setEntry((e) => ({ ...e, lines: [...e.lines, newLine] }));
  };

  const removeLine = (lineId: string) => setEntry((e) => ({ ...e, lines: e.lines.filter((l) => l.id !== lineId) }));

  const updateLine = (lineId: string, patch: Partial<JournalLine>) =>
    setEntry((e) => ({
      ...e,
      lines: e.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l))
    }));

  const totals = useMemo(() => {
    const debit = entry.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const credit = entry.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
    return { debit, credit };
  }, [entry.lines]);

  const isBalanced = totals.debit === totals.credit && totals.debit > 0;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">{isNew ? 'Nuevo asiento' : `Editar asiento ${entry.number || entry.id}`}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Icon icon="mdi:arrow-left" />} onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button variant="contained" startIcon={<Icon icon="mdi:content-save" />} disabled={!isBalanced}>
            Guardar
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Fecha"
                type="date"
                value={entry.date}
                onChange={(e) => setEntry((x) => ({ ...x, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Referencia"
                value={entry.reference || ''}
                onChange={(e) => setEntry((x) => ({ ...x, reference: e.target.value }))}
              />
              <TextField
                label="Concepto"
                value={entry.concept}
                onChange={(e) => setEntry((x) => ({ ...x, concept: e.target.value }))}
                sx={{ minWidth: 280 }}
              />
            </Stack>

            <Divider />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1">Líneas</Typography>
              <Button startIcon={<Icon icon="mdi:plus" />} onClick={addLine}>
                Agregar línea
              </Button>
            </Stack>

            <Stack spacing={1}>
              {entry.lines.map((l) => (
                <Stack key={l.id} direction="row" spacing={1} alignItems="center">
                  <TextField
                    select
                    label="Cuenta"
                    SelectProps={{ native: true }}
                    value={l.accountId}
                    onChange={(e) => {
                      const sel = accounts.find((a) => a.id === e.target.value);
                      if (!sel) return;
                      updateLine(l.id, { accountId: sel.id, accountCode: sel.code, accountName: sel.name });
                    }}
                    sx={{ minWidth: 260 }}
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </TextField>

                  <TextField
                    label="Descripción"
                    value={l.description || ''}
                    onChange={(e) => updateLine(l.id, { description: e.target.value })}
                    sx={{ flex: 1 }}
                  />

                  <TextField
                    label="Débito"
                    type="number"
                    value={l.debit}
                    onChange={(e) => updateLine(l.id, { debit: Number(e.target.value) || 0, credit: 0 })}
                    sx={{ width: 140 }}
                  />
                  <TextField
                    label="Crédito"
                    type="number"
                    value={l.credit}
                    onChange={(e) => updateLine(l.id, { credit: Number(e.target.value) || 0, debit: 0 })}
                    sx={{ width: 140 }}
                  />

                  <IconButton onClick={() => removeLine(l.id)}>
                    <Icon icon="mdi:delete" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>

            <Divider />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Chip label={`Total débito: ${totals.debit.toLocaleString()}`} />
              <Chip label={`Total crédito: ${totals.credit.toLocaleString()}`} />
              <Chip
                color={isBalanced ? 'success' : 'warning'}
                label={isBalanced ? 'Asiento cuadrado' : 'Descuadrado'}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
