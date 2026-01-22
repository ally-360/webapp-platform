import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  Popover,
  Box
} from '@mui/material';
import { useSnackbar } from 'notistack';

import Iconify from 'src/components/iconify';
import { useImportStatementJsonMutation } from 'src/redux/services/bankReconciliationsApi';

// ----------------------------------------------------------------------

type Props = {
  reconciliationId: string;
  onSuccess: () => void;
  hasExistingLines: boolean;
};

const EXAMPLE_JSON = `[
  {
    "date": "2024-01-15",
    "description": "Pago cliente ABC",
    "reference": "TRF001234",
    "amount": 1500000,
    "balance": 5800000
  },
  {
    "date": "2024-01-16",
    "description": "Retiro cajero",
    "reference": "RET567890",
    "amount": -200000,
    "balance": 5600000
  }
]`;

export default function ImportJsonPanel({ reconciliationId, onSuccess, hasExistingLines }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [jsonText, setJsonText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [importJson, { isLoading }] = useImportStatementJsonMutation();

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(jsonText);

      if (!Array.isArray(parsed)) {
        setValidationError('El JSON debe ser un array de líneas');
        return false;
      }

      if (parsed.length === 0) {
        setValidationError('El array no puede estar vacío');
        return false;
      }

      // Validar estructura básica
      const requiredFields = ['date', 'description', 'amount'];
      const firstLine = parsed[0];

      const missingField = requiredFields.find((field) => !(field in firstLine));
      if (missingField) {
        setValidationError(`Campo requerido faltante: ${missingField}`);
        return false;
      }

      setValidationError(null);
      enqueueSnackbar(`JSON válido: ${parsed.length} líneas detectadas`, { variant: 'success' });
      return true;
    } catch (error: any) {
      setValidationError(error.message);
      return false;
    }
  };

  const handleImport = async () => {
    if (!handleValidate()) {
      enqueueSnackbar('Por favor valida el JSON antes de importar', { variant: 'warning' });
      return;
    }

    if (hasExistingLines) {
      const confirmed = window.confirm(
        'Ya existen líneas importadas. ¿Deseas importar de nuevo? Las líneas existentes podrían ser reemplazadas.'
      );
      if (!confirmed) return;
    }

    try {
      const lines = JSON.parse(jsonText);

      const result = await importJson({
        reconciliationId,
        lines
      }).unwrap();

      enqueueSnackbar(result.message || `${result.imported_lines} líneas importadas exitosamente`, {
        variant: 'success'
      });

      setJsonText('');
      setValidationError(null);
      onSuccess();
    } catch (error: any) {
      console.error('Error importing JSON:', error);

      const errorMessage = error?.data?.detail || error?.data?.message || 'Error al importar el JSON';

      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000
      });
    }
  };

  const handleShowExample = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseExample = () => {
    setAnchorEl(null);
  };

  const handleUseExample = () => {
    setJsonText(EXAMPLE_JSON);
    handleCloseExample();
  };

  const openExample = Boolean(anchorEl);

  return (
    <Card>
      <CardHeader
        title="Importar desde JSON"
        subheader="Pega un JSON estructurado con las líneas del extracto (avanzado)"
        avatar={<Iconify icon="solar:code-bold-duotone" width={32} />}
        action={
          <IconButton onClick={handleShowExample}>
            <Iconify icon="solar:question-circle-bold" />
          </IconButton>
        }
      />

      <CardContent>
        <Stack spacing={3}>
          {/* Help text */}
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
            <Typography variant="body2">
              Campos requeridos: <strong>date</strong> (YYYY-MM-DD), <strong>description</strong>,{' '}
              <strong>amount</strong> (número). Opcionales: reference, balance, debit, credit.
            </Typography>
          </Alert>

          {/* JSON textarea */}
          <TextField
            multiline
            rows={12}
            fullWidth
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Pega aquí tu JSON..."
            disabled={isLoading}
            error={Boolean(validationError)}
            helperText={validationError}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }
            }}
          />

          {/* Action buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={handleValidate}
              disabled={!jsonText || isLoading}
              startIcon={<Iconify icon="solar:shield-check-bold" />}
            >
              Validar JSON
            </Button>

            <Button
              variant="contained"
              onClick={handleImport}
              disabled={!jsonText || isLoading}
              startIcon={<Iconify icon="solar:cloud-upload-bold" />}
            >
              {isLoading ? 'Importando...' : 'Importar extracto'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>

      {/* Example popover */}
      <Popover
        open={openExample}
        anchorEl={anchorEl}
        onClose={handleCloseExample}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Box sx={{ p: 3, maxWidth: 500 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Ejemplo de JSON</Typography>

            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'background.neutral',
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.75rem',
                fontFamily: 'monospace'
              }}
            >
              {EXAMPLE_JSON}
            </Box>

            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={handleUseExample}>
                Usar este ejemplo
              </Button>
              <Button size="small" onClick={handleCloseExample}>
                Cerrar
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </Card>
  );
}
