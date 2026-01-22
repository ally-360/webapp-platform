/* eslint-disable import/no-duplicates */
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Stack,
  Button,
  Box
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type StatementLine = {
  id?: string;
  date: string;
  description: string;
  reference?: string;
  amount: number;
  balance?: number;
  is_matched?: boolean;
};

type Props = {
  lines: StatementLine[];
  total: number;
  onContinueToAutoMatch: () => void;
};

export default function ImportedLinesPreview({ lines, total, onContinueToAutoMatch }: Props) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'success.main';
    if (amount < 0) return 'error.main';
    return 'text.primary';
  };

  return (
    <Card>
      <CardHeader
        title="Líneas del extracto importadas"
        subheader={`Mostrando ${lines.length} de ${total} líneas importadas`}
        avatar={<Iconify icon="solar:check-circle-bold-duotone" width={32} sx={{ color: 'success.main' }} />}
        action={
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onContinueToAutoMatch}
            startIcon={<Iconify icon="solar:play-circle-bold" />}
          >
            Continuar con Auto-Match
          </Button>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={120}>Fecha</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell width={150}>Referencia</TableCell>
                  <TableCell width={140} align="right">
                    Monto
                  </TableCell>
                  <TableCell width={140} align="right">
                    Saldo
                  </TableCell>
                  <TableCell width={120} align="center">
                    Estado
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Stack spacing={1} alignItems="center" sx={{ py: 5 }}>
                        <Iconify icon="solar:inbox-line-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                          No hay líneas para mostrar
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((line, index) => (
                    <TableRow key={line.id || index} hover>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {formatDate(line.date)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {line.description}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {line.reference || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: getAmountColor(line.amount)
                          }}
                        >
                          {fCurrency(line.amount)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {line.balance !== undefined && line.balance !== null ? fCurrency(line.balance) : '-'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={line.is_matched ? 'Matched' : 'Sin match'}
                          color={line.is_matched ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        {total > lines.length && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'background.neutral',
              borderRadius: 1,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Hay {total - lines.length} líneas más. Ve al tab de matching manual para verlas todas.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
