import { Stack, Typography, Chip, Box } from '@mui/material';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

interface TimelineEventMetaProps {
  eventType: string;
  metadata?: Record<string, any>;
}

export default function TimelineEventMeta({ eventType, metadata }: TimelineEventMetaProps) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }

  const typeUpper = eventType.toUpperCase();

  // Render metadata based on event type
  const renderImportMeta = () => {
    if (!metadata) return null;

    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {metadata.lines_count && <Chip size="small" label={`${metadata.lines_count} líneas`} color="info" />}
        {metadata.source_format && <Chip size="small" label={metadata.source_format} variant="outlined" />}
        {metadata.file_name && (
          <Typography variant="caption" color="text.secondary">
            {metadata.file_name}
          </Typography>
        )}
      </Stack>
    );
  };

  const renderAutoMatchMeta = () => {
    if (!metadata) return null;

    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {metadata.matched_count !== undefined && (
          <Chip size="small" label={`${metadata.matched_count} matches`} color="success" />
        )}
        {metadata.candidates !== undefined && (
          <Chip size="small" label={`${metadata.candidates} candidatos`} variant="outlined" color="info" />
        )}
        {metadata.avg_score !== undefined && (
          <Chip size="small" label={`Score: ${(metadata.avg_score * 100).toFixed(0)}%`} variant="outlined" />
        )}
      </Stack>
    );
  };

  const renderManualMatchMeta = () => {
    if (!metadata) return null;

    return (
      <Stack spacing={0.5}>
        {metadata.statement_line_id && (
          <Typography variant="caption" color="text.secondary">
            Línea: {metadata.statement_line_id}
          </Typography>
        )}
        {metadata.movement_id && (
          <Typography variant="caption" color="text.secondary">
            Movimiento: {metadata.movement_id}
          </Typography>
        )}
        {metadata.notes && (
          <Typography variant="caption" color="text.secondary" fontStyle="italic">
            &ldquo;{metadata.notes}&rdquo;
          </Typography>
        )}
      </Stack>
    );
  };

  const renderCompletedMeta = () => {
    if (!metadata) return null;

    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {metadata.balance_difference !== undefined && (
          <Chip
            size="small"
            label={`Diferencia: ${fCurrency(metadata.balance_difference)}`}
            color={parseFloat(metadata.balance_difference) === 0 ? 'success' : 'warning'}
          />
        )}
        {metadata.adjustment_journal_entry_id && (
          <Chip
            size="small"
            label={`Asiento: ${metadata.adjustment_journal_entry_id}`}
            variant="outlined"
            color="warning"
          />
        )}
      </Stack>
    );
  };

  const renderReversedMeta = () => {
    if (!metadata) return null;

    return (
      <Box
        sx={{
          p: 1,
          borderRadius: 1,
          bgcolor: 'error.lighter',
          borderLeft: 3,
          borderColor: 'error.main'
        }}
      >
        <Typography variant="caption" color="error.dark" fontWeight={600}>
          Razón de reversión:
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {metadata.reversal_reason || metadata.reason || 'No especificada'}
        </Typography>
      </Box>
    );
  };

  // Generic fallback for unknown event types
  const renderGenericMeta = () => {
    const keys = Object.keys(metadata || {}).filter((k) => k !== 'timestamp');

    if (keys.length === 0) return null;

    return (
      <Stack spacing={0.5}>
        {keys.slice(0, 3).map((key) => (
          <Typography key={key} variant="caption" color="text.secondary">
            {key}: {String(metadata[key])}
          </Typography>
        ))}
      </Stack>
    );
  };

  // Route to appropriate renderer
  switch (typeUpper) {
    case 'STATEMENT_IMPORTED':
      return renderImportMeta();
    case 'AUTO_MATCH_RUN':
      return renderAutoMatchMeta();
    case 'MANUAL_MATCH':
      return renderManualMatchMeta();
    case 'COMPLETED':
      return renderCompletedMeta();
    case 'REVERSED':
      return renderReversedMeta();
    default:
      return renderGenericMeta();
  }
}
