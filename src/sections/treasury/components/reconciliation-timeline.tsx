/* eslint-disable import/no-duplicates */
import { Card, CardHeader, CardContent, Typography, Stack, Box } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import type { ReconciliationActivity, ReconciliationActivityType } from '../types';

// ----------------------------------------------------------------------

type Props = {
  activities: ReconciliationActivity[];
};

const ACTIVITY_CONFIG: Record<
  ReconciliationActivityType,
  { icon: string; color: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' }
> = {
  created: { icon: 'solar:add-circle-bold', color: 'info' },
  statement_imported: { icon: 'solar:import-bold', color: 'primary' },
  auto_matched: { icon: 'solar:verified-check-bold', color: 'success' },
  manual_matched: { icon: 'solar:hand-money-bold', color: 'info' },
  match_removed: { icon: 'solar:close-circle-bold', color: 'warning' },
  adjustment_created: { icon: 'solar:document-add-bold', color: 'secondary' },
  completed: { icon: 'solar:check-circle-bold', color: 'success' },
  reversed: { icon: 'solar:undo-left-bold', color: 'error' },
  status_changed: { icon: 'solar:refresh-bold', color: 'info' }
};

export default function ReconciliationTimeline({ activities }: Props) {
  const formatDateTime = (date: string) => {
    try {
      return format(new Date(date), "dd MMM yyyy 'a las' HH:mm", { locale: es });
    } catch {
      return date;
    }
  };

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader
        title="Historial de Actividad"
        subheader="Registro de auditoría de todas las acciones realizadas"
        avatar={<Iconify icon="solar:history-3-bold-duotone" width={32} />}
      />
      <CardContent>
        {sortedActivities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Iconify
              icon="solar:history-3-bold-duotone"
              width={48}
              sx={{ color: 'text.disabled', opacity: 0.3, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              No hay actividad registrada
            </Typography>
          </Box>
        ) : (
          <Timeline>
            {sortedActivities.map((activity, index) => {
              const config = ACTIVITY_CONFIG[activity.activity_type];
              const isLast = index === sortedActivities.length - 1;

              return (
                <TimelineItem key={activity.id}>
                  <TimelineSeparator>
                    <TimelineDot color={config.color}>
                      <Iconify icon={config.icon} width={20} />
                    </TimelineDot>
                    {!isLast && <TimelineConnector />}
                  </TimelineSeparator>

                  <TimelineContent>
                    <Stack spacing={0.5} sx={{ pb: 3 }}>
                      <Typography variant="subtitle2">{activity.description}</Typography>

                      <Typography variant="caption" color="text.secondary">
                        {activity.user_name} · {formatDateTime(activity.created_at)}
                      </Typography>

                      {/* Activity Details */}
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: 'background.neutral',
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          {Object.entries(activity.details).map(([key, value]) => (
                            <Typography key={key} variant="caption" display="block">
                              <strong>{key}:</strong> {String(value)}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </Stack>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </CardContent>
    </Card>
  );
}
