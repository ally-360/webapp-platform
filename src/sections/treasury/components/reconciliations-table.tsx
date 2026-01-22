/* eslint-disable import/no-duplicates */

import { useState } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Stack,
  Tooltip,
  TablePagination,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Box
} from '@mui/material';
//

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { BankReconciliation, ReconciliationStatus } from '../types';

// ----------------------------------------------------------------------

type Props = {
  reconciliations: BankReconciliation[];
  isLoading?: boolean;
  total: number;
  page: number;
  rowsPerPage: number;
  onView: (id: string) => void;
  onDelete: (id: string, accountName: string) => void;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const STATUS_CONFIG: Record<
  ReconciliationStatus,
  {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }
> = {
  draft: { label: 'Borrador', color: 'default' },
  in_progress: { label: 'En Proceso', color: 'info' },
  completed: { label: 'Completada', color: 'success' },
  reversed: { label: 'Revertida', color: 'error' }
};

// ----------------------------------------------------------------------

export default function ReconciliationsTable({
  reconciliations,
  isLoading,
  total,
  page,
  rowsPerPage,
  onView,
  onDelete,
  onPageChange,
  onRowsPerPageChange
}: Props) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReconciliation, setSelectedReconciliation] = useState<BankReconciliation | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, reconciliation: BankReconciliation) => {
    setAnchorEl(event.currentTarget);
    setSelectedReconciliation(reconciliation);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedReconciliation(null);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    try {
      const start = format(new Date(startDate), 'dd MMM yyyy', { locale: es });
      const end = format(new Date(endDate), 'dd MMM yyyy', { locale: es });
      return `${start} - ${end}`;
    } catch {
      return `${startDate} - ${endDate}`;
    }
  };

  const formatLastUpdate = (date: string, userName?: string) => {
    try {
      const formattedDate = format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
      return userName ? `${formattedDate} por ${userName}` : formattedDate;
    } catch {
      return date;
    }
  };

  const getBalanceColor = (diff: number) => {
    if (diff === 0) return 'success.main';
    if (diff > 0) return 'error.main';
    return 'warning.main';
  };

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('treasury.bankReconciliations.bankAccount', 'Cuenta Bancaria')}</TableCell>
              <TableCell>{t('treasury.bankReconciliations.period', 'Período')}</TableCell>
              <TableCell align="center">{t('common.status', 'Estado')}</TableCell>
              <TableCell align="center">Avance</TableCell>
              <TableCell align="right">
                {t('treasury.bankReconciliations.currentDifference', 'Diferencia Actual')}
              </TableCell>
              <TableCell>{t('treasury.bankReconciliations.lastUpdate', 'Última Actualización')}</TableCell>
              <TableCell align="right">{t('common.actions', 'Acciones')}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                  <Stack spacing={2} alignItems="center">
                    <Iconify icon="svg-spinners:blocks-shuffle-3" width={48} />
                    <Typography variant="body2" color="text.secondary">
                      {t('common.loading', 'Cargando...')}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              reconciliations.map((reconciliation) => (
                <TableRow key={reconciliation.id} hover>
                  {/* Bank Account */}
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">{reconciliation.bank_account?.name || 'N/A'}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {reconciliation.bank_account?.code && (
                          <Typography variant="caption" color="text.secondary">
                            {reconciliation.bank_account.code}
                          </Typography>
                        )}
                        {reconciliation.bank_account?.account_number && reconciliation.bank_account?.code && (
                          <Typography variant="caption" color="text.secondary">
                            •
                          </Typography>
                        )}
                        {reconciliation.bank_account?.account_number && (
                          <Typography variant="caption" color="text.secondary">
                            {reconciliation.bank_account.account_number}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </TableCell>

                  {/* Period */}
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateRange(reconciliation.period_start_date, reconciliation.period_end_date)}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell align="center">
                    <Chip
                      label={STATUS_CONFIG[reconciliation.status].label}
                      color={STATUS_CONFIG[reconciliation.status].color}
                      size="small"
                    />
                  </TableCell>

                  {/* Progress/Avance */}
                  <TableCell align="center">
                    <Stack spacing={1} sx={{ minWidth: 120 }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                        <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
                          {reconciliation.reconciliation_percentage?.toFixed(1) || 0}%
                        </Typography>
                      </Stack>
                      <Box sx={{ width: '100%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={reconciliation.reconciliation_percentage || 0}
                          sx={{
                            height: 6,
                            borderRadius: 1,
                            backgroundColor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 1
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" align="center">
                        {reconciliation.reconciled_lines || 0} / {reconciliation.total_statement_lines || 0} líneas
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Balance Difference */}
                  <TableCell align="right">
                    <Typography variant="subtitle2" sx={{ color: getBalanceColor(reconciliation.balance_difference) }}>
                      {fCurrency(reconciliation.balance_difference)}
                    </Typography>
                    {reconciliation.is_balanced && (
                      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                        <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'success.main' }} />
                        <Typography variant="caption" color="success.main">
                          Balanceada
                        </Typography>
                      </Stack>
                    )}
                  </TableCell>

                  {/* Last Update */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                      {formatLastUpdate(reconciliation.updated_at, reconciliation.created_by_user?.name)}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {/* View/Continue */}
                      <Tooltip
                        title={
                          reconciliation.status === 'in_progress'
                            ? t('treasury.bankReconciliations.continue', 'Continuar')
                            : t('common.viewDetail', 'Ver detalle')
                        }
                      >
                        <IconButton size="small" onClick={() => onView(reconciliation.id)} color="primary">
                          <Iconify
                            icon={reconciliation.status === 'in_progress' ? 'solar:play-circle-bold' : 'solar:eye-bold'}
                          />
                        </IconButton>
                      </Tooltip>

                      {/* Kebab Menu */}
                      <Tooltip title={t('common.moreActions', 'Más acciones')}>
                        <IconButton size="small" onClick={(e) => handleOpenMenu(e, reconciliation)} color="default">
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && reconciliations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('treasury.bankReconciliations.noResults', 'No se encontraron conciliaciones')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {selectedReconciliation?.status === 'draft' && [
          <MenuItem
            key="edit"
            onClick={() => {
              if (selectedReconciliation) onView(selectedReconciliation.id);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:pen-bold" />
            </ListItemIcon>
            <ListItemText primary="Editar" />
          </MenuItem>,
          <MenuItem
            key="delete"
            onClick={() => {
              if (selectedReconciliation) {
                onDelete(selectedReconciliation.id, selectedReconciliation.bank_account?.name || 'N/A');
              }
              handleCloseMenu();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Iconify icon="solar:trash-bin-trash-bold" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Eliminar" />
          </MenuItem>
        ]}

        {selectedReconciliation?.status === 'completed' && [
          <MenuItem
            key="report"
            onClick={() => {
              if (selectedReconciliation) onView(selectedReconciliation.id);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:document-text-bold" />
            </ListItemIcon>
            <ListItemText primary="Ver Reporte" />
          </MenuItem>,
          <MenuItem
            key="download"
            onClick={() => {
              console.log('Download report');
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:download-minimalistic-bold" />
            </ListItemIcon>
            <ListItemText primary="Descargar Reporte" />
          </MenuItem>
        ]}

        {selectedReconciliation?.status === 'reversed' && (
          <MenuItem
            onClick={() => {
              if (selectedReconciliation) onView(selectedReconciliation.id);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:info-circle-bold" />
            </ListItemIcon>
            <ListItemText primary="Ver Motivo de Reversión" />
          </MenuItem>
        )}

        {selectedReconciliation?.status === 'in_progress' && (
          <MenuItem
            onClick={() => {
              if (selectedReconciliation) onView(selectedReconciliation.id);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:play-circle-bold" />
            </ListItemIcon>
            <ListItemText primary="Continuar Conciliación" />
          </MenuItem>
        )}
      </Menu>

      {/* Pagination */}
      {!isLoading && total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage={t('common.rowsPerPage', 'Filas por página')}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Card>
  );
}
