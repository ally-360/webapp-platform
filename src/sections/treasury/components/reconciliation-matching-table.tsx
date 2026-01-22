/* eslint-disable import/no-duplicates */
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Box,
  Typography,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Button,
  Checkbox,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { BankStatementLine, AccountingTransaction, ReconciliationMatch } from '../types';

// ----------------------------------------------------------------------

type Props = {
  statementLines: BankStatementLine[];
  transactions: AccountingTransaction[];
  matches: ReconciliationMatch[];
  onMatch: (statementLineId: string, transactionIds: string[]) => Promise<void>;
  onRemoveMatch: (matchId: string) => Promise<void>;
  isReadOnly?: boolean;
};

export default function ReconciliationMatchingTable({
  statementLines,
  transactions,
  matches,
  onMatch,
  onRemoveMatch,
  isReadOnly = false
}: Props) {
  const { t } = useTranslation();
  const [selectedStatementLine, setSelectedStatementLine] = useState<string | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMatching, setIsMatching] = useState(false);

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: es });
    } catch {
      return date;
    }
  };

  // Get matched transaction IDs for a statement line
  const getMatchedTransactions = (lineId: string) =>
    matches.filter((m) => m.statement_line_id === lineId).map((m) => m.transaction_id);

  // Check if transaction is matched
  const isTransactionMatched = (transactionId: string) => matches.some((m) => m.transaction_id === transactionId);

  // Filter unreconciled statement lines
  const unreconciledLines = statementLines.filter((line) => line.status === 'unreconciled');
  const reconciledLines = statementLines.filter((line) => line.status === 'reconciled');

  // Filter unreconciled transactions
  const unreconciledTransactions = transactions.filter((t) => !t.is_reconciled);

  // Filter transactions by search
  const filteredTransactions = unreconciledTransactions.filter((t) =>
    searchQuery
      ? t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.reference?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Handle statement line selection
  const handleSelectStatementLine = (lineId: string) => {
    if (isReadOnly) return;
    setSelectedStatementLine(lineId);
    setSelectedTransactions([]);
  };

  // Handle transaction selection
  const handleToggleTransaction = (transactionId: string) => {
    if (isReadOnly || !selectedStatementLine) return;

    setSelectedTransactions((prev) =>
      prev.includes(transactionId) ? prev.filter((id) => id !== transactionId) : [...prev, transactionId]
    );
  };

  // Handle match action
  const handleMatch = async () => {
    if (!selectedStatementLine || selectedTransactions.length === 0) return;

    setIsMatching(true);
    try {
      await onMatch(selectedStatementLine, selectedTransactions);
      enqueueSnackbar('Transacciones conciliadas exitosamente', { variant: 'success' });
      setSelectedStatementLine(null);
      setSelectedTransactions([]);
    } catch (error) {
      enqueueSnackbar('Error al conciliar transacciones', { variant: 'error' });
    } finally {
      setIsMatching(false);
    }
  };

  // Handle remove match
  const handleRemoveMatch = async (matchId: string) => {
    if (isReadOnly) return;

    try {
      await onRemoveMatch(matchId);
      enqueueSnackbar('Conciliación removida exitosamente', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al remover conciliación', { variant: 'error' });
    }
  };

  // Calculate selected amount
  const selectedAmount = selectedTransactions.reduce((sum, id) => {
    const transaction = transactions.find((t) => t.id === id);
    const amount = parseFloat(transaction?.debit || transaction?.credit || '0');
    return sum + amount;
  }, 0);

  const selectedLineAmount =
    selectedStatementLine &&
    parseFloat(
      statementLines.find((l) => l.id === selectedStatementLine)?.debit ||
        statementLines.find((l) => l.id === selectedStatementLine)?.credit ||
        '0'
    );

  const amountMatches = selectedLineAmount && Math.abs(selectedAmount - selectedLineAmount) < 0.01;

  return (
    <Card>
      <CardHeader
        title="Conciliación de Transacciones"
        subheader="Selecciona una línea del extracto y luego las transacciones contables correspondientes"
        avatar={<Iconify icon="solar:transfer-horizontal-bold-duotone" width={32} />}
      />
      <CardContent>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ minHeight: 500 }}>
          {/* Left Column - Bank Statement Lines */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Extracto Bancario
              </Typography>
              <Chip
                label={`${unreconciledLines.length} sin conciliar`}
                size="small"
                color={unreconciledLines.length > 0 ? 'warning' : 'success'}
              />
            </Stack>

            <Stack spacing={1} sx={{ flex: 1, overflow: 'auto', maxHeight: 600 }}>
              {unreconciledLines.length === 0 && (
                <Alert severity="success">Todas las líneas del extracto están conciliadas</Alert>
              )}

              {unreconciledLines.map((line) => {
                const isSelected = selectedStatementLine === line.id;
                const amount = parseFloat(line.debit || line.credit || '0');

                return (
                  <Box
                    key={line.id}
                    onClick={() => handleSelectStatementLine(line.id)}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      bgcolor: isSelected ? 'action.selected' : 'background.paper',
                      cursor: isReadOnly ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: isReadOnly ? 'divider' : 'primary.main',
                        bgcolor: isReadOnly ? 'background.paper' : 'action.hover'
                      }
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(line.statement_date)}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: line.debit !== '0' ? 'success.main' : 'error.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {fCurrency(amount)}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" noWrap>
                        {line.description}
                      </Typography>

                      {line.reference && (
                        <Typography variant="caption" color="text.secondary">
                          Ref: {line.reference}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                );
              })}

              {/* Reconciled Lines - Collapsed */}
              {reconciledLines.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                    {reconciledLines.length} línea(s) conciliada(s)
                  </Typography>
                </>
              )}
            </Stack>
          </Box>

          {/* Center - Action Column */}
          <Stack justifyContent="center" alignItems="center" spacing={2} sx={{ px: 2, minWidth: { lg: 200 } }}>
            <Iconify icon="solar:arrow-right-bold-duotone" width={40} sx={{ color: 'text.disabled' }} />

            {selectedStatementLine && (
              <>
                <Divider flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Seleccionado
                  </Typography>
                  <Typography variant="h6" color={amountMatches ? 'success.main' : 'warning.main'}>
                    {fCurrency(selectedAmount)}
                  </Typography>
                  {selectedTransactions.length > 0 && (
                    <Typography variant="caption" display="block">
                      {selectedTransactions.length} transacción(es)
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  color={amountMatches ? 'success' : 'warning'}
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                  onClick={handleMatch}
                  disabled={selectedTransactions.length === 0 || isMatching || isReadOnly}
                  fullWidth
                >
                  Conciliar
                </Button>

                {!amountMatches && selectedTransactions.length > 0 && (
                  <Alert severity="warning" sx={{ fontSize: '0.75rem' }}>
                    Los montos no coinciden exactamente
                  </Alert>
                )}
              </>
            )}
          </Stack>

          {/* Right Column - Accounting Transactions */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Transacciones Contables
              </Typography>
              <Chip
                label={`${unreconciledTransactions.length} disponibles`}
                size="small"
                color={unreconciledTransactions.length > 0 ? 'info' : 'default'}
              />
            </Stack>

            {/* Search */}
            <TextField
              size="small"
              placeholder="Buscar transacciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
              disabled={!selectedStatementLine || isReadOnly}
            />

            <Stack spacing={1} sx={{ flex: 1, overflow: 'auto', maxHeight: 600 }}>
              {!selectedStatementLine && <Alert severity="info">Selecciona una línea del extracto para comenzar</Alert>}

              {selectedStatementLine && filteredTransactions.length === 0 && (
                <Alert severity="warning">No se encontraron transacciones disponibles para conciliar</Alert>
              )}

              {selectedStatementLine &&
                filteredTransactions.map((transaction) => {
                  const isSelected = selectedTransactions.includes(transaction.id);
                  const isAlreadyMatched = isTransactionMatched(transaction.id);
                  const amount = parseFloat(transaction.debit || transaction.credit || '0');

                  return (
                    <Box
                      key={transaction.id}
                      onClick={() => !isAlreadyMatched && handleToggleTransaction(transaction.id)}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: isSelected ? 'info.main' : 'divider',
                        borderRadius: 1,
                        bgcolor: isSelected
                          ? 'action.selected'
                          : isAlreadyMatched
                          ? 'action.disabledBackground'
                          : 'background.paper',
                        cursor: isAlreadyMatched || isReadOnly ? 'not-allowed' : 'pointer',
                        opacity: isAlreadyMatched ? 0.5 : 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: isAlreadyMatched || isReadOnly ? 'divider' : 'info.main',
                          bgcolor: isAlreadyMatched || isReadOnly ? 'action.disabledBackground' : 'action.hover'
                        }
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Checkbox checked={isSelected} disabled={isAlreadyMatched || isReadOnly} size="small" />

                        <Stack spacing={1} sx={{ flex: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(transaction.transaction_date)}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: transaction.debit !== '0' ? 'success.main' : 'error.main',
                                fontWeight: 'bold'
                              }}
                            >
                              {fCurrency(amount)}
                            </Typography>
                          </Stack>

                          <Typography variant="body2" noWrap>
                            {transaction.description}
                          </Typography>

                          {transaction.reference && (
                            <Typography variant="caption" color="text.secondary">
                              Ref: {transaction.reference}
                            </Typography>
                          )}

                          {transaction.document_type && (
                            <Chip
                              label={transaction.document_type}
                              size="small"
                              variant="outlined"
                              sx={{ width: 'fit-content' }}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
