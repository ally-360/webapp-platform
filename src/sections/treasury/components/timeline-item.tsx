import { Stack, Typography, Box, Button } from '@mui/material';
import React from 'react';
/* eslint-disable import/no-duplicates */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import type { TimelineEvent } from 'src/sections/treasury/types';
import TimelineEventBadge from './timeline-event-badge';
import TimelineEventMeta from './timeline-event-meta';

// ----------------------------------------------------------------------

interface TimelineItemProps {
  event: TimelineEvent;
  onViewMatches?: (eventId: string) => void;
  onViewImport?: (eventId: string) => void;
  onViewAdjustment?: (journalEntryId: string) => void;
}

export default function TimelineItem({ event, onViewMatches, onViewImport, onViewAdjustment }: TimelineItemProps) {
  const getEventTitle = (type: string) => {
    const typeUpper = type.toUpperCase();
    const titles: Record<string, string> = {
      CREATED: 'Conciliación Creada',
      STATEMENT_IMPORTED: 'Extracto Importado',
      AUTO_MATCH_RUN: 'Conciliación Automática Ejecutada',
      MANUAL_MATCH: 'Match Manual Creado',
      MATCH_DELETED: 'Match Eliminado',
      COMPLETED: 'Conciliación Completada',
      REVERSED: 'Conciliación Revertida',
      ADJUSTMENT_CREATED: 'Asiento de Ajuste Creado'
    };

    return titles[typeUpper] || type.replace(/_/g, ' ');
  };

  const eventTime = event.occurred_at ? format(new Date(event.occurred_at), 'HH:mm:ss', { locale: es }) : '';

  const getUserDisplay = () => {
    if (event.user_name) return event.user_name;
    if (event.user_email) return event.user_email;
    if (event.user_id) return `Usuario ${event.user_id}`;
    return 'Sistema';
  };

  const renderActions = () => {
    const typeUpper = event.type.toUpperCase();
    const actions: React.ReactElement[] = [];

    if (typeUpper === 'AUTO_MATCH_RUN' && onViewMatches && event.id) {
      actions.push(
        <Button
          key="matches"
          size="small"
          startIcon={<Iconify icon="solar:eye-bold" />}
          onClick={() => onViewMatches(event.id!)}
        >
          Ver Matches
        </Button>
      );
    }

    if (typeUpper === 'STATEMENT_IMPORTED' && onViewImport && event.id) {
      actions.push(
        <Button
          key="import"
          size="small"
          startIcon={<Iconify icon="solar:document-text-bold" />}
          onClick={() => onViewImport(event.id!)}
        >
          Ver Extracto
        </Button>
      );
    }

    if (
      (typeUpper === 'COMPLETED' || typeUpper === 'ADJUSTMENT_CREATED') &&
      onViewAdjustment &&
      event.metadata?.adjustment_journal_entry_id
    ) {
      actions.push(
        <Button
          key="adjustment"
          size="small"
          startIcon={<Iconify icon="solar:calculator-bold" />}
          onClick={() => onViewAdjustment(event.metadata!.adjustment_journal_entry_id)}
        >
          Ver Asiento
        </Button>
      );
    }

    return actions.length > 0 ? (
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {actions}
      </Stack>
    ) : null;
  };

  return (
    <Stack direction="row" spacing={2}>
      {/* Event Badge */}
      <TimelineEventBadge eventType={event.type} />

      {/* Event Content */}
      <Box sx={{ flex: 1, pb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
          <Typography variant="subtitle2">{getEventTitle(event.type)}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60, textAlign: 'right' }}>
            {eventTime}
          </Typography>
        </Stack>

        {/* Message */}
        {event.message && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {event.message}
          </Typography>
        )}

        {/* User */}
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
          <Iconify icon="solar:user-circle-bold" width={16} sx={{ color: 'text.disabled' }} />
          <Typography variant="caption" color="text.disabled">
            {getUserDisplay()}
          </Typography>
        </Stack>

        {/* Metadata */}
        <TimelineEventMeta eventType={event.type} metadata={event.metadata} />

        {/* Actions */}
        {renderActions()}
      </Box>
    </Stack>
  );
}
