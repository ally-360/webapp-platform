/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import {
  Drawer,
  Stack,
  Typography,
  IconButton,
  List,
  ListItem,
  Box,
  Chip,
  Button,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Skeleton
} from '@mui/material';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { ReconciliationMatch } from '../types';
// ----------------------------------------------------------------------

interface MatchesDrawerProps {
  open: boolean;
  onClose: () => void;
  matches: ReconciliationMatch[];
  onDeleteMatch: (matchId: string) => void;
  isLoading?: boolean;
  isDeletingId?: string | null;
  readOnly?: boolean;
}

export default function MatchesDrawer({
  open,
  onClose,
  matches,
  onDeleteMatch,
  isLoading = false,
  isDeletingId = null,
  readOnly = false,
}: MatchesDrawerProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<ReconciliationMatch | null>(null);

  const handleOpenDeleteDialog = (match: ReconciliationMatch) => {
    setMatchToDelete(match);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMatchToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (matchToDelete) {
      onDeleteMatch(matchToDelete.id);
      handleCloseDeleteDialog();
    }
  };

  const getMatchTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; color: string; icon: string }> = {
      auto: {
        label: 'Automático',
        color: 'info',
        icon: 'solar:magic-stick-3-bold-duotone',
      },
      manual: {
        label: 'Manual',
        color: 'warning',
        icon: 'solar:hand-shake-bold-duotone',
      },
      adjustment: {
        label: 'Ajuste',
        color: 'default',
        icon: 'solar:settings-bold-duotone',
      },
    };
    return configs[type] || configs.manual;
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 480 } },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2.5, bgcolor: 'background.neutral' }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify
                icon="solar:link-circle-bold-duotone"
                width={24}
                sx={{ color: 'primary.main' }}
              />
            </Box>
            <Box>
              <Typography variant="h6">Conciliaciones Actuales</Typography>
              <Typography variant="caption" color="text.secondary">
                {matches.length} {matches.length === 1 ? 'coincidencia' : 'coincidencias'}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        <Divider />

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {isLoading ? (
            <Stack spacing={2}>
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          ) : matches.length === 0 ? (
            <Alert severity="info" icon={<Iconify icon="eva:info-fill" />}>
              No hay conciliaciones registradas aún.
            </Alert>
          ) : (
            <List disablePadding>
              {matches.map((match, index) => {
                const typeConfig = getMatchTypeConfig(match.match_type || 'manual');
                const isDeleting = isDeletingId === match.id;

                return (
                  <Box key={match.id}>
                    <ListItem
                      disableGutters
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                        mb: 1.5,
                      }}
                    >
                      <Stack spacing={2} sx={{ width: '100%' }}>
                        {/* Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Chip
                            label={typeConfig.label}
                            icon={<Iconify icon={typeConfig.icon} width={16} />}
                            size="small"
                            color={typeConfig.color as any}
                          />
                          {match.score !== undefined && (
                            <Chip
                              label={`Score: ${Math.round(match.score)}%`}
                              size="small"
                              variant="outlined"
                              color={
                                match.score >= 85
                                  ? 'success'
                                  : match.score >= 70
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          )}
                        </Stack>

                        {/* Extracto */}
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                            <Iconify
                              icon="solar:document-text-bold"
                              width={16}
                              sx={{ color: 'info.main' }}
                            />
                            <Typography variant="caption" color="info.main" fontWeight={600}>
                              Extracto
                            </Typography>
                          </Stack>
                          <Typography variant="body2" noWrap>
                            {match.statement_line_description || 'Sin descripción'}
                          </Typography>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {match.statement_line_date &&
                                format(new Date(match.statement_line_date), 'dd MMM yyyy', {
                                  locale: es,
                                })}
                            </Typography>
                            <Typography variant="subtitle2" color="info.main">
                              {fCurrency(match.statement_amount || 0)}
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Divider visual */}
                        <Stack direction="row" alignItems="center" justifyContent="center">
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: 'primary.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Iconify
                              icon="solar:transfer-vertical-bold"
                              width={16}
                              sx={{ color: 'primary.main' }}
                            />
                          </Box>
                        </Stack>

                        {/* Movimiento */}
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                            <Iconify
                              icon="solar:book-bold"
                              width={16}
                              sx={{ color: 'success.main' }}
                            />
                            <Typography variant="caption" color="success.main" fontWeight={600}>
                              Movimiento
                            </Typography>
                          </Stack>
                          <Typography variant="body2" noWrap>
                            {match.internal_reference ||
                              match.internal_description ||
                              'Sin referencia'}
                          </Typography>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {match.movement_date &&
                                format(new Date(match.movement_date), 'dd MMM yyyy', {
                                  locale: es,
                                })}
                            </Typography>
                            <Typography variant="subtitle2" color="success.main">
                              {fCurrency(match.movement_amount || 0)}
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Diferencia */}
                        {match.difference !== undefined && Math.abs(match.difference) > 0.01 && (
                          <Alert severity="warning" sx={{ py: 0.5 }}>
                            <Typography variant="caption">
                              Diferencia: <strong>{fCurrency(match.difference)}</strong>
                            </Typography>
                          </Alert>
                        )}

                        {/* Nota */}
                        {match.note && (
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: 'background.paper',
                              borderRadius: 0.5,
                              border: (theme) => `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Nota: {match.note}
                            </Typography>
                          </Box>
                        )}

                        {/* Footer */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {match.matched_at &&
                              format(new Date(match.matched_at), "dd MMM yyyy 'a las' HH:mm", {
                                locale: es,
                              })}
                          </Typography>

                          {!readOnly && (
                            <Button
                              size="small"
                              color="error"
                              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                              onClick={() => handleOpenDeleteDialog(match)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deshaciendo...' : 'Deshacer'}
                            </Button>
                          )}
                        </Stack>

                        {/* Usuario */}
                        {match.matched_by_user && (
                          <Typography variant="caption" color="text.secondary">
                            Por: {match.matched_by_user}
                          </Typography>
                        )}
                      </Stack>
                    </ListItem>

                    {index < matches.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          )}
        </Box>
      </Drawer>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify
              icon="solar:danger-triangle-bold-duotone"
              width={24}
              sx={{ color: 'error.main' }}
            />
            <Typography variant="h6">Deshacer Conciliación</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas deshacer esta conciliación? Esta acción no se puede revertir
            y las líneas volverán a estar sin conciliar.
          </DialogContentText>
          {matchToDelete && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'background.neutral',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Extracto:
              </Typography>
              <Typography variant="body2" gutterBottom>
                {matchToDelete.statement_line_description}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Movimiento:
              </Typography>
              <Typography variant="body2">
                {matchToDelete.internal_reference || matchToDelete.internal_description}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          >
            Deshacer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
