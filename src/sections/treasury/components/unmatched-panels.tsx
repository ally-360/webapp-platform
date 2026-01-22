import { Grid, Card, CardHeader, Divider, Stack, Typography, Box, Button, Chip } from '@mui/material';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { fCurrency } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import EmptyContent from 'src/components/empty-content';

import type { UnmatchedLine, UnmatchedMovement } from 'src/sections/treasury/types';

// ----------------------------------------------------------------------

interface Props {
  unmatchedLines: UnmatchedLine[];
  unmatchedMovements: UnmatchedMovement[];
  totalLines: number;
  totalMovements: number;
  isLoadingLines?: boolean;
  isLoadingMovements?: boolean;
  onGoToManual: () => void;
}

export default function UnmatchedPanels({
  unmatchedLines,
  unmatchedMovements,
  totalLines,
  totalMovements,
  isLoadingLines,
  isLoadingMovements,
  onGoToManual,
}: Props) {
  return (
    <Grid container spacing={3}>
      {/* Unmatched Lines */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6">Líneas sin match</Typography>
                <Chip label={totalLines} size="small" color="warning" />
              </Stack>
            }
            subheader="Líneas del extracto bancario sin conciliar"
          />
          <Divider />

          <Scrollbar sx={{ maxHeight: 400 }}>
            {isLoadingLines ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Cargando...
                </Typography>
              </Box>
            ) : unmatchedLines.length === 0 ? (
              <EmptyContent
                filled
                title="Sin pendientes"
                description="Todas las líneas han sido conciliadas"
                sx={{ py: 6 }}
              />
            ) : (
              <Stack divider={<Divider />}>
                {unmatchedLines.map((line) => (
                  <Box key={line.id} sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold" noWrap>
                            {line.description}
                          </Typography>
                          {line.reference && (
                            <Typography variant="caption" color="text.secondary">
                              Ref: {line.reference}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                          {fCurrency(parseFloat(line.amount))}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.disabled">
                          {format(new Date(line.statement_date), 'dd MMM yyyy', { locale: es })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Saldo: {fCurrency(parseFloat(line.balance))}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Scrollbar>

          {unmatchedLines.length > 0 && (
            <>
              <Divider />
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  variant="text"
                  color="primary"
                  endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                  onClick={onGoToManual}
                >
                  Conciliar manualmente ({totalLines})
                </Button>
              </Box>
            </>
          )}
        </Card>
      </Grid>

      {/* Unmatched Movements */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6">Movimientos sin match</Typography>
                <Chip label={totalMovements} size="small" color="info" />
              </Stack>
            }
            subheader="Movimientos internos sin conciliar"
          />
          <Divider />

          <Scrollbar sx={{ maxHeight: 400 }}>
            {isLoadingMovements ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Cargando...
                </Typography>
              </Box>
            ) : unmatchedMovements.length === 0 ? (
              <EmptyContent
                filled
                title="Sin pendientes"
                description="Todos los movimientos han sido conciliados"
                sx={{ py: 6 }}
              />
            ) : (
              <Stack divider={<Divider />}>
                {unmatchedMovements.map((movement) => (
                  <Box key={movement.id} sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold" noWrap>
                            {movement.description}
                          </Typography>
                          {movement.reference && (
                            <Typography variant="caption" color="text.secondary">
                              Ref: {movement.reference}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="body2" fontWeight="bold" color="info.main">
                          {fCurrency(parseFloat(movement.amount))}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Typography variant="caption" color="text.disabled">
                          {format(new Date(movement.movement_date), 'dd MMM yyyy', { locale: es })}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {movement.payment_method && (
                            <Chip label={movement.payment_method} size="small" variant="outlined" />
                          )}
                          <Chip label={movement.source_module} size="small" />
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Scrollbar>

          {unmatchedMovements.length > 0 && (
            <>
              <Divider />
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  variant="text"
                  color="primary"
                  endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                  onClick={onGoToManual}
                >
                  Conciliar manualmente ({totalMovements})
                </Button>
              </Box>
            </>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}
