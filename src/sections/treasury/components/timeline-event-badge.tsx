import { Avatar } from '@mui/material';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

interface TimelineEventBadgeProps {
  eventType: string;
}

export default function TimelineEventBadge({ eventType }: TimelineEventBadgeProps) {
  const getEventConfig = (type: string) => {
    const typeUpper = type.toUpperCase();

    // Map event types to icon and color
    const eventConfigs: Record<
      string,
      { icon: string; color: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary' }
    > = {
      CREATED: { icon: 'solar:document-add-bold-duotone', color: 'primary' },
      STATEMENT_IMPORTED: { icon: 'solar:upload-bold-duotone', color: 'info' },
      AUTO_MATCH_RUN: { icon: 'solar:magic-stick-bold-duotone', color: 'secondary' },
      MANUAL_MATCH: { icon: 'solar:link-bold-duotone', color: 'success' },
      MATCH_DELETED: { icon: 'solar:trash-bin-minimalistic-bold-duotone', color: 'warning' },
      COMPLETED: { icon: 'solar:check-circle-bold-duotone', color: 'success' },
      REVERSED: { icon: 'solar:restart-bold-duotone', color: 'error' },
      ADJUSTMENT_CREATED: { icon: 'solar:calculator-bold-duotone', color: 'warning' }
    };

    return eventConfigs[typeUpper] || { icon: 'solar:widget-2-bold-duotone', color: 'primary' as const };
  };

  const config = getEventConfig(eventType);

  return (
    <Avatar
      sx={{
        width: 40,
        height: 40,
        bgcolor: `${config.color}.lighter`,
        color: `${config.color}.main`
      }}
    >
      <Iconify icon={config.icon} width={24} />
    </Avatar>
  );
}
