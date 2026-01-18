import { useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
// components
import Label from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
// redux
import { useGetDebitNoteJournalEntryQuery } from 'src/redux/services/debitNotesApi';
// utils
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  debitNoteId: string;
  open?: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  POSTED: 'Contabilizado',
  REVERSED: 'Reversado',
  DRAFT: 'Borrador'
};

const STATUS_COLORS: Record<string, any> = {
  POSTED: 'success',
  REVERSED: 'error',
  DRAFT: 'default'
};

export default function DebitNoteJournalEntry({ debitNoteId, open = true }: Props) {
  const {
    data: journalEntry,
    isLoading,
    isError
  } = useGetDebitNoteJournalEntryQuery(debitNoteId, {
    skip: !debitNoteId
  });

  const totals = useMemo(() => {
    if (!journalEntry?.lines) return { debit: 0, credit: 0 };

    const debit = journalEntry.lines.reduce((sum: number, line: any) => sum + Number(line.debit || 0), 0);
    const credit = journalEntry.lines.reduce((sum: number, line: any) => sum + Number(line.credit || 0), 0);

    return { debit, credit };
  }, [journalEntry]);

  if (isLoading) {
    return (
      <Card sx={{ p: 3 }}>
        <LoadingScreen />
      </Card>
    );
  }

  if (isError || !journalEntry) {
    return (
      <Collapse in={open}>
        <Card sx={{ p: 3 }}>
          <Alert severity="info">No se encontró asiento contable para esta nota débito.</Alert>
        </Card>
      </Collapse>
    );
  }

  return (
    <Collapse in={open}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack spacing={0.5}>
              <Typography variant="h6">Asiento Contable</Typography>
              <Typography variant="body2" color="text.secondary">
                Impacto contable generado automáticamente
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              {journalEntry.entry_number && (
                <Typography variant="subtitle2" color="text.secondary">
                  #{journalEntry.entry_number}
                </Typography>
              )}
              <Label variant="soft" color={STATUS_COLORS[journalEntry.status] || 'default'}>
                {STATUS_LABELS[journalEntry.status] || journalEntry.status}
              </Label>
            </Stack>
          </Stack>

          <Divider />

          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Cuenta</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Débito</TableCell>
                  <TableCell align="right">Crédito</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(journalEntry.lines || []).map((line: any, index: number) => (
                  <TableRow key={line.id || index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {line.account_code || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {line.account_name || line.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={line.debit ? 600 : 400}>
                        {line.debit ? fCurrency(line.debit) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={line.credit ? 600 : 400}>
                        {line.credit ? fCurrency(line.credit) : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle2">Totales</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" color="primary.main">
                      {fCurrency(totals.debit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" color="primary.main">
                      {fCurrency(totals.credit)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {journalEntry.notes && (
            <>
              <Divider />
              <Stack>
                <Typography variant="subtitle2">Notas</Typography>
                <Typography variant="body2" color="text.secondary">
                  {journalEntry.notes}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
      </Card>
    </Collapse>
  );
}
