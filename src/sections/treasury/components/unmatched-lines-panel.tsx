import { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
  Stack,
  Alert,
  Skeleton,
  IconButton,
  Collapse
} from '@mui/material';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { BankStatementLine } from '../types';

// ----------------------------------------------------------------------

interface UnmatchedLinesPanelProps {
  lines: BankStatementLine[];
  selectedLine: BankStatementLine | null;
  onSelectLine: (line: BankStatementLine) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  preselectedLineId?: string;
}

export default function UnmatchedLinesPanel({
  lines,
  selectedLine,
  onSelectLine,
  isLoading = false,
  readOnly = false,
  preselectedLineId,
}: UnmatchedLinesPanelProps) {
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(preselectedLineId || null);

  // Filtrar líneas por búsqueda
  const filteredLines = useMemo(() => {
    if (!searchText) return lines;
    const search = searchText.toLowerCase();
    return lines.filter(
      (line) =>
        line.description?.toLowerCase().includes(search) ||
        line.reference?.toLowerCase().includes(search) ||
        (parseFloat(line.debit) || parseFloat(line.credit))?.toString().includes(search)
    );
  }, [lines, searchText]);

  const handleToggleExpand = (lineId: string) => {
    setExpandedId(expandedId === lineId ? null : lineId);
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title="Extracto Bancario"
          subheader="Líneas sin conciliar"
          avatar={<Iconify icon="solar:document-text-bold-duotone" width={24} />}
        />
        <CardContent>
          <Stack spacing={2}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Extracto Bancario</Typography>
            <Chip label={filteredLines.length} size="small" color="info" />
          </Stack>
        }
        subheader="Selecciona una línea del extracto"
        avatar={
          <Iconify icon="solar:document-text-bold-duotone" width={24} sx={{ color: 'info.main' }} />
        }
      />

      <CardContent sx={{ flex: 1, overflow: 'auto', pt: 0 }}>
        {/* Search */}
        <Box
          sx={{ mb: 2, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, pt: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por descripción, referencia o monto..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchText('')}>
                    <Iconify icon="eva:close-fill" width={20} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Empty state */}
        {filteredLines.length === 0 && (
          <Alert severity="success" icon={<Iconify icon="eva:checkmark-circle-2-fill" />}>
            {searchText
              ? 'No se encontraron líneas con esos criterios'
              : '¡Perfecto! No hay líneas pendientes por conciliar'}
          </Alert>
        )}

        {/* Lines list */}
        <List disablePadding>
          {filteredLines.map((line) => {
            const isSelected = selectedLine?.id === line.id;
            const isExpanded = expandedId === line.id;
            const amount = parseFloat(line.debit) || -parseFloat(line.credit) || 0;
            const isNegative = amount < 0;

            return (
              <Box key={line.id} sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => !readOnly && onSelectLine(line)}
                  disabled={readOnly}
                  sx={{
                    borderRadius: 1,
                    border: (theme) =>
                      isSelected
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${theme.palette.divider}`,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.lighter',
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" noWrap sx={{ flex: 1, mr: 1 }}>
                          {line.description || 'Sin descripción'}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            color: isNegative ? 'error.main' : 'success.main',
                            fontWeight: 600,
                          }}
                        >
                          {fCurrency(amount)}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Chip
                          size="small"
                          label={format(new Date(line.statement_date), 'dd MMM yyyy', {
                            locale: es,
                          })}
                          icon={<Iconify icon="solar:calendar-bold-duotone" width={16} />}
                          sx={{ height: 22 }}
                        />
                        {line.reference && (
                          <Chip
                            size="small"
                            label={line.reference}
                            variant="outlined"
                            sx={{ height: 22 }}
                          />
                        )}
                        <Chip
                          size="small"
                          label={isNegative ? 'Salida' : 'Entrada'}
                          color={isNegative ? 'error' : 'success'}
                          sx={{ height: 22 }}
                        />
                      </Stack>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExpand(line.id);
                    }}
                  >
                    <Iconify
                      icon={
                        isExpanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'
                      }
                    />
                  </IconButton>
                </ListItemButton>

                {/* Expanded details */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Detalles adicionales:
                      </Typography>
                      {line.balance !== undefined && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Saldo después:
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {fCurrency(line.balance)}
                          </Typography>
                        </Stack>
                      )}
                      {line.notes && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Notas:
                          </Typography>
                          <Typography variant="body2">{line.notes}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}
