import { Stack, Typography, Divider, Paper } from '@mui/material';
/* eslint-disable import/no-duplicates */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimelineEvent } from 'src/sections/treasury/types';
import TimelineItem from './timeline-item';

// ----------------------------------------------------------------------

interface TimelineDayGroupProps {
  date: string;
  events: TimelineEvent[];
  onViewMatches?: (eventId: string) => void;
  onViewImport?: (eventId: string) => void;
  onViewAdjustment?: (journalEntryId: string) => void;
}

export default function TimelineDayGroup({
  date,
  events,
  onViewMatches,
  onViewImport,
  onViewAdjustment
}: TimelineDayGroupProps) {
  const formattedDate = format(new Date(date), 'dd MMMM yyyy', { locale: es });

  return (
    <Stack spacing={2}>
      {/* Day Header */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="subtitle1" color="text.primary" fontWeight={600}>
          {formattedDate}
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Stack>

      {/* Events */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: 'background.neutral',
          borderRadius: 1.5
        }}
      >
        <Stack spacing={0}>
          {events.map((event, index) => (
            <div key={event.id || index}>
              <TimelineItem
                event={event}
                onViewMatches={onViewMatches}
                onViewImport={onViewImport}
                onViewAdjustment={onViewAdjustment}
              />
              {index < events.length - 1 && <Divider sx={{ my: 1 }} />}
            </div>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
