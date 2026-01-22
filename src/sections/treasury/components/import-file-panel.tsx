import { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent, Stack, Button, Typography, Alert, LinearProgress, Box } from '@mui/material';
import { useSnackbar } from 'notistack';

import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useImportStatementFileMutation } from 'src/redux/services/bankReconciliationsApi';

// ----------------------------------------------------------------------

type Props = {
  reconciliationId: string;
  onSuccess: () => void;
  hasExistingLines: boolean;
};

export default function ImportFilePanel({ reconciliationId, onSuccess, hasExistingLines }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [file, setFile] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [importFile, { isLoading }] = useImportStatementFileMutation();

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0];
      if (uploadedFile) {
        setFile(uploadedFile);

        // Si ya hay líneas, mostrar confirmación
        if (hasExistingLines) {
          setShowConfirm(true);
        }
      }
    },
    [hasExistingLines]
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setShowConfirm(false);
  }, []);

  const handleImport = async () => {
    if (!file) return;

    try {
      const result = await importFile({
        reconciliationId,
        file
      }).unwrap();

      enqueueSnackbar(result.message || `${result.imported_lines} líneas importadas exitosamente`, {
        variant: 'success'
      });

      setFile(null);
      setShowConfirm(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error importing file:', error);

      const errorMessage = error?.data?.detail || error?.data?.message || 'Error al importar el archivo';

      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000
      });
    }
  };

  return (
    <Card>
      <CardHeader
        title="Importar desde archivo"
        subheader="Sube un archivo CSV o XLSX con las líneas del extracto bancario"
        avatar={<Iconify icon="solar:upload-bold-duotone" width={32} />}
      />

      <CardContent>
        <Stack spacing={3}>
          {/* Help text */}
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
            <Typography variant="body2">
              El sistema detecta automáticamente el formato (Bancolombia, Davivienda, o genérico). Columnas esperadas:
              Fecha, Descripción, Referencia, Débito/Crédito o Monto, Saldo.
            </Typography>
          </Alert>

          {/* Confirmation warning */}
          {showConfirm && (
            <Alert
              severity="warning"
              action={
                <Button size="small" color="inherit" onClick={() => setShowConfirm(false)}>
                  Cancelar
                </Button>
              }
            >
              <Typography variant="subtitle2" gutterBottom>
                Ya existen líneas importadas
              </Typography>
              <Typography variant="body2">
                Al importar de nuevo, las líneas existentes podrían ser reemplazadas o complementadas según la
                configuración del servidor. ¿Deseas continuar?
              </Typography>
            </Alert>
          )}

          {/* Upload area */}
          <Upload
            file={file}
            onDrop={handleDrop}
            onDelete={handleRemoveFile}
            accept={{
              'text/csv': ['.csv'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
            }}
            disabled={isLoading}
          />

          {/* File info */}
          {file && (
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.neutral'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="solar:file-text-bold" width={40} sx={{ color: 'primary.main' }} />
                <Stack flex={1}>
                  <Typography variant="subtitle2">{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* Loading state */}
          {isLoading && (
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Importando archivo...
                </Typography>
                <Typography variant="body2" color="primary.main">
                  Procesando
                </Typography>
              </Stack>
              <LinearProgress />
            </Box>
          )}

          {/* Import button */}
          <Button
            size="large"
            variant="contained"
            disabled={!file || isLoading}
            onClick={handleImport}
            startIcon={<Iconify icon="solar:cloud-upload-bold" />}
          >
            {isLoading ? 'Importando...' : 'Importar extracto'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
