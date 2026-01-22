/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  Stack,
  TextField,
  MenuItem,
  CardHeader,
  Divider,
  Avatar
} from '@mui/material';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { fCurrency, fNumber } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { TableSkeleton } from 'src/components/table';
import Label from 'src/components/label';

import type { ReconciliationMatch, MatchesFilters, MatchType } from 'src/sections/treasury/types';

// ----------------------------------------------------------------------

interface Props {
  matches: ReconciliationMatch[];
  total: number;
  filters: MatchesFilters;
  onFilterChange: (filters: Partial<MatchesFilters>) => void;
  isLoading?: boolean;
}

const MATCH_TYPE_OPTIONS: { value: MatchType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'auto', label: 'Automático' },
  { value: 'manual', label: 'Manual' },
  { value: 'adjustment', label: 'Ajuste' },
];

const SCORE_RANGE_OPTIONS = [
  { value: 'all', label: 'Todos los scores', min: 0, max: 100 },
  { value: 'high', label: 'Score alto (≥ 85)', min: 85, max: 100 },
  { value: 'medium', label: 'Score medio (70-84)', min: 70, max: 84 },
  { value: 'low', label: 'Score bajo (< 70)', min: 0, max: 69 },
];

const getMatchTypeColor = (type: MatchType): 'success' | 'info' | 'warning' => {
  switch (type) {
    case 'auto':
      return 'success';
    case 'manual':
      return 'info';
    case 'adjustment':
      return 'warning';
    default:
      return 'info';
  }
};

const getMatchTypeLabel = (type: MatchType): string => {
  switch (type) {
    case 'auto':
      return 'Auto';
    case 'manual':
      return 'Manual';
    case 'adjustment':
      return 'Ajuste';
    default:
      return type;
  }
};

const getInternalTypeLabel = (type: string): string => {
  switch (type) {
    case 'treasury_movement':
      return 'Movimiento Tesorería';
    case 'invoice_payment':
      return 'Pago Factura';
    case 'purchase_payment':
      return 'Pago Compra';
    case 'adjustment':
      return 'Ajuste';
    default:
      return type;
  }
};

const getInternalTypeIcon = (type: string): string => {
  switch (type) {
    case 'treasury_movement':
      return 'solar:wallet-bold';
    case 'invoice_payment':
      return 'solar:bill-list-bold';
    case 'purchase_payment':
      return 'solar:cart-large-bold';
    case 'adjustment':
      return 'solar:settings-bold';
    default:
      return 'solar:document-text-bold';
  }
};

// ----------------------------------------------------------------------

export default function MatchesTable({
  matches,
  total,
  filters,
  onFilterChange,
  isLoading,
}: Props) {
  const [matchTypeFilter, setMatchTypeFilter] = useState<string>('all');
  const [scoreRangeFilter, setScoreRangeFilter] = useState<string>('all');

  const handleMatchTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setMatchTypeFilter(value);
    onFilterChange({
      match_type: value === 'all' ? undefined : (value as MatchType),
      offset: 0,
    });
  };

  const handleScoreRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setScoreRangeFilter(value);
    const range = SCORE_RANGE_OPTIONS.find((opt) => opt.value === value);
    if (range && value !== 'all') {
      onFilterChange({
        min_score: range.min,
        max_score: range.max,
        offset: 0,
      });
    } else {
      onFilterChange({
        min_score: undefined,
        max_score: undefined,
        offset: 0,
      });
    }
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    onFilterChange({
      offset: newPage * (filters.limit || 50),
    });
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      limit: parseInt(event.target.value, 10),
      offset: 0,
    });
  };

  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 50));

  return (
    <>
      <CardHeader
        title={`Matches encontrados (${fNumber(total)})`}
        subheader="Coincidencias entre extracto y movimientos internos"
        action={
          <Stack direction="row" spacing={2}>
            <TextField
              select
              size="small"
              label="Tipo"
              value={matchTypeFilter}
              onChange={handleMatchTypeChange}
              sx={{ minWidth: 150 }}
            >
              {MATCH_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Score"
              value={scoreRangeFilter}
              onChange={handleScoreRangeChange}
              sx={{ minWidth: 180 }}
            >
              {SCORE_RANGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        }
      />

      <Divider />

      <Scrollbar>
        <TableContainer sx={{ minWidth: 960 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Descripción Extracto</TableCell>
                <TableCell align="right">Monto Extracto</TableCell>
                <TableCell>Match a</TableCell>
                <TableCell>Referencia</TableCell>
                <TableCell align="right">Monto Interno</TableCell>
                <TableCell align="right">Diferencia</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Usuario / Fecha</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={10} cols={10} />
              ) : matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No se encontraron matches
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                matches.map((match) => (
                  <TableRow key={match.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(match.statement_date), 'dd MMM yyyy', { locale: es })}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {match.statement_description}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {fCurrency(parseFloat(match.statement_amount))}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'background.neutral',
                            color: 'text.secondary',
                          }}
                        >
                          <Iconify icon={getInternalTypeIcon(match.internal_type)} width={20} />
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {getInternalTypeLabel(match.internal_type)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {match.internal_reference || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2">
                        {fCurrency(parseFloat(match.internal_amount))}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={parseFloat(match.difference) === 0 ? 'success.main' : 'warning.main'}
                        fontWeight="bold"
                      >
                        {fCurrency(Math.abs(parseFloat(match.difference)))}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      {match.match_score !== undefined && match.match_score !== null ? (
                        <Chip
                          label={`${match.match_score}%`}
                          size="small"
                          color={
                            match.match_score >= 85
                              ? 'success'
                              : match.match_score >= 70
                              ? 'warning'
                              : 'error'
                          }
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Label color={getMatchTypeColor(match.match_type)} variant="soft">
                        {getMatchTypeLabel(match.match_type)}
                      </Label>
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.5}>
                        {match.matched_by_user && (
                          <Typography variant="caption" color="text.secondary">
                            {match.matched_by_user.name}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.disabled">
                          {format(new Date(match.matched_at), 'dd MMM yyyy HH:mm', { locale: es })}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      <Divider />

      <TablePagination
        component="div"
        count={total}
        page={currentPage}
        rowsPerPage={filters.limit || 50}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[25, 50, 100]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </>
  );
}
