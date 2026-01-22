import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Alert, AlertTitle, Typography, Card, CardContent, Tabs, Tab, Box } from '@mui/material';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useLazyGetUnmatchedLinesQuery } from 'src/redux/services/bankReconciliationsApi';

import type { BankReconciliation } from '../types';
import ImportFilePanel from './import-file-panel';
import ImportJsonPanel from './import-json-panel';
import ImportedLinesPreview from './imported-lines-preview';

// ----------------------------------------------------------------------

type Props = {
  reconciliation: BankReconciliation;
  onRefresh: () => void;
};

type ImportMode = 'file' | 'json';

export default function ReconciliationImportTab({ reconciliation, onRefresh }: Props) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ImportMode>('file');
  const [showPreview, setShowPreview] = useState(false);

  const [fetchUnmatchedLines, { data: unmatchedData }] = useLazyGetUnmatchedLinesQuery();

  // Check if import is allowed
  const isReadOnly = reconciliation.status === 'completed' || reconciliation.status === 'reversed';
  const hasExistingLines = (reconciliation.total_statement_lines || 0) > 0;

  const handleImportSuccess = async () => {
    // Refresh reconciliation data
    onRefresh();

    // Fetch unmatched lines for preview
    try {
      await fetchUnmatchedLines({
        reconciliationId: reconciliation.id,
        limit: 20
      }).unwrap();
      setShowPreview(true);
    } catch (error) {
      console.error('Error fetching unmatched lines:', error);
      // Still show preview even if fetch fails
      setShowPreview(true);
    }
  };

  const handleContinueToAutoMatch = () => {
    navigate(`${paths.dashboard.treasury.reconciliationDetails(reconciliation.id)}?step=auto-match`);
  };

  // If status doesn't allow import, show warning
  if (isReadOnly) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning" icon={<Iconify icon="solar:lock-bold" width={24} />}>
            <AlertTitle>Importación no disponible</AlertTitle>
            <Typography variant="body2">
              No se puede importar el extracto en una conciliación con estado{' '}
              <strong>{reconciliation.status === 'completed' ? 'Completada' : 'Revertida'}</strong>. Solo las
              conciliaciones en estado <strong>Borrador</strong> o <strong>En Proceso</strong> permiten importación.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header info */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Iconify icon="solar:upload-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
              <Box flex={1}>
                <Typography variant="h6">Importar extracto bancario</Typography>
                <Typography variant="body2" color="text.secondary">
                  {reconciliation.bank_account?.name || 'Cuenta bancaria'}
                  {reconciliation.bank_account?.code && ` · ${reconciliation.bank_account.code}`}
                  {reconciliation.bank_account?.account_number && ` · ${reconciliation.bank_account.account_number}`}
                </Typography>
              </Box>
            </Stack>

            {hasExistingLines && (
              <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                <Typography variant="body2">
                  Esta conciliación ya tiene <strong>{reconciliation.total_statement_lines} líneas</strong> importadas.
                  Al importar nuevamente, se pueden agregar o reemplazar según la configuración.
                </Typography>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Import mode selector */}
      <Card>
        <Tabs
          value={mode}
          onChange={(e, newValue) => setMode(newValue)}
          sx={{
            px: 3,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Tab
            value="file"
            label="Importar desde archivo"
            icon={<Iconify icon="solar:file-text-bold" width={20} />}
            iconPosition="start"
          />
          <Tab
            value="json"
            label="Importar desde JSON"
            icon={<Iconify icon="solar:code-bold" width={20} />}
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {mode === 'file' && (
            <ImportFilePanel
              reconciliationId={reconciliation.id}
              onSuccess={handleImportSuccess}
              hasExistingLines={hasExistingLines}
            />
          )}

          {mode === 'json' && (
            <ImportJsonPanel
              reconciliationId={reconciliation.id}
              onSuccess={handleImportSuccess}
              hasExistingLines={hasExistingLines}
            />
          )}
        </Box>
      </Card>

      {/* Preview of imported lines */}
      {showPreview && unmatchedData && (
        <ImportedLinesPreview
          lines={unmatchedData.lines || []}
          total={unmatchedData.total || 0}
          onContinueToAutoMatch={handleContinueToAutoMatch}
        />
      )}
    </Stack>
  );
}
