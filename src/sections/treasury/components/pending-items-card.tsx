import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Alert,
  Skeleton,
  Box,
  Divider
} from '@mui/material';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'src/routes/hook/use-router';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import {
  useGetUnmatchedLinesQuery,
  useGetUnmatchedMovementsQuery,
} from 'src/redux/services/bankReconciliationsApi';

interface PendingItemsCardProps {
  reconciliationId: string;
}

export default function PendingItemsCard({ reconciliationId }: PendingItemsCardProps) {
  const router = useRouter();

  const {
    data: unmatchedLines,
    isLoading: isLoadingLines,
    error: errorLines,
  } = useGetUnmatchedLinesQuery({ reconciliationId, limit: 5 });

  const {
    data: unmatchedMovements,
    isLoading: isLoadingMovements,
    error: errorMovements,
  } = useGetUnmatchedMovementsQuery({ reconciliationId, limit: 5 });

  const hasUnmatchedLines = unmatchedLines && unmatchedLines.lines.length > 0;
  const hasUnmatchedMovements = unmatchedMovements && unmatchedMovements.movements.length > 0;
  const hasPendings = hasUnmatchedLines || hasUnmatchedMovements;

  const handleGoToMatching = () => {
    router.push(
      `${paths.dashboard.treasury.reconciliationDetails(reconciliationId)}?step=manual-match`
    );
  };

  if (errorLines || errorMovements) {
    return (
      <Card>
        <CardHeader
          avatar={
            <Iconify icon="eva:alert-triangle-fill" width={24} sx={{ color: 'error.main' }} />
          }
          title="Pendientes"
        />
        <CardContent>
          <Alert severity="error">Error al cargar pendientes</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        avatar={
          <Iconify
            icon="solar:clipboard-list-bold-duotone"
            width={24}
            sx={{ color: hasPendings ? 'warning.main' : 'success.main' }}
          />
        }
        title="Pendientes por Conciliar"
        subheader={
          hasPendings
            ? `${unmatchedLines?.total || 0} líneas + ${unmatchedMovements?.total || 0} movimientos`
            : 'No hay pendientes'
        }
      />

      <CardContent>
        <Stack spacing={3}>
          {/* No pendings message */}
          {!isLoadingLines && !isLoadingMovements && !hasPendings && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ p: 2, borderRadius: 1, bgcolor: 'success.lighter' }}
            >
              <Iconify
                icon="eva:checkmark-circle-2-fill"
                width={20}
                sx={{ color: 'success.main' }}
              />
              <Typography variant="body2" color="success.dark" fontWeight={600}>
                ¡No hay elementos pendientes!
              </Typography>
            </Stack>
          )}

          {/* Unmatched Lines */}
          {(isLoadingLines || hasUnmatchedLines) && (
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2">
                  Líneas del Extracto ({unmatchedLines?.total || 0})
                </Typography>
                {unmatchedLines && unmatchedLines.total > 5 && (
                  <Chip size="small" label={`+${unmatchedLines.total - 5} más`} />
                )}
              </Stack>

              {isLoadingLines ? (
                <Stack spacing={1}>
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} height={60} />
                  ))}
                </Stack>
              ) : (
                <List disablePadding sx={{ bgcolor: 'background.neutral', borderRadius: 1 }}>
                  {unmatchedLines?.lines.slice(0, 5).map((line, index) => {
                    const amount = parseFloat(line.amount || '0');
                    return (
                      <ListItem
                        key={line.id}
                        divider={index < Math.min(4, unmatchedLines.lines.length - 1)}
                        sx={{ py: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="body2" noWrap sx={{ maxWidth: '60%' }}>
                                {line.description}
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="info.main">
                                {fCurrency(Math.abs(amount))}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {line.statement_date &&
                                !Number.isNaN(new Date(line.statement_date).getTime())
                                  ? format(new Date(line.statement_date), 'dd MMM yyyy', {
                                      locale: es,
                                    })
                                  : 'Fecha inválida'}
                              </Typography>
                              {line.reference && (
                                <>
                                  <Typography variant="caption" color="text.disabled">
                                    •
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ maxWidth: 120 }}
                                  >
                                    {line.reference}
                                  </Typography>
                                </>
                              )}
                            </Stack>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          )}

          {/* Divider between sections */}
          {hasPendings && hasUnmatchedLines && hasUnmatchedMovements && <Divider />}

          {/* Unmatched Movements */}
          {(isLoadingMovements || hasUnmatchedMovements) && (
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2">
                  Movimientos Internos ({unmatchedMovements?.total || 0})
                </Typography>
                {unmatchedMovements && unmatchedMovements.total > 5 && (
                  <Chip size="small" label={`+${unmatchedMovements.total - 5} más`} />
                )}
              </Stack>

              {isLoadingMovements ? (
                <Stack spacing={1}>
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} height={60} />
                  ))}
                </Stack>
              ) : (
                <List disablePadding sx={{ bgcolor: 'background.neutral', borderRadius: 1 }}>
                  {unmatchedMovements?.movements.slice(0, 5).map((movement, index) => {
                    const amount = parseFloat(movement.amount || '0');
                    return (
                      <ListItem
                        key={movement.id}
                        divider={index < Math.min(4, unmatchedMovements.movements.length - 1)}
                        sx={{ py: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="body2" noWrap sx={{ maxWidth: '60%' }}>
                                {movement.description}
                              </Typography>
                              <Typography variant="body2" fontWeight={600} color="success.main">
                                {fCurrency(Math.abs(amount))}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {movement.movement_date &&
                                !Number.isNaN(new Date(movement.movement_date).getTime())
                                  ? format(new Date(movement.movement_date), 'dd MMM yyyy', {
                                      locale: es,
                                    })
                                  : 'Fecha inválida'}
                              </Typography>
                              {movement.source_module && (
                                <>
                                  <Typography variant="caption" color="text.disabled">
                                    •
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={movement.source_module.replace('_', ' ')}
                                    sx={{ height: 16, fontSize: 10 }}
                                  />
                                </>
                              )}
                            </Stack>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          )}

          {/* Action Button */}
          {hasPendings && (
            <Button
              fullWidth
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon="solar:link-minimalistic-2-bold-duotone" />}
              onClick={handleGoToMatching}
            >
              Resolver Pendientes
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
