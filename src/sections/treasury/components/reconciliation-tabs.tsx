import { Tabs, Tab, Badge, Box } from '@mui/material';

import Iconify from 'src/components/iconify';

import type { BankReconciliation } from '../types';

// ----------------------------------------------------------------------

type TabValue = 'summary' | 'import' | 'auto-match' | 'manual' | 'complete' | 'report' | 'timeline';

type Props = {
  currentTab: TabValue;
  onChange: (tab: TabValue) => void;
  reconciliation: BankReconciliation;
  isReadOnly: boolean;
  isCompleted: boolean;
};

// ----------------------------------------------------------------------

export default function ReconciliationTabs({ currentTab, onChange, reconciliation, isReadOnly, isCompleted }: Props) {
  const tabs = [
    {
      value: 'summary' as const,
      label: 'Resumen',
      icon: 'solar:chart-bold-duotone'
    },
    {
      value: 'import' as const,
      label: 'Extracto',
      icon: 'solar:upload-bold-duotone',
      disabled: isReadOnly || isCompleted,
      badge: reconciliation.total_statement_lines
    },
    {
      value: 'auto-match' as const,
      label: 'Auto-Match',
      icon: 'solar:magic-stick-bold-duotone',
      disabled: isReadOnly || isCompleted
    },
    {
      value: 'manual' as const,
      label: 'Matching Manual',
      icon: 'solar:hand-stars-bold-duotone',
      disabled: isReadOnly || isCompleted,
      badge: reconciliation.unreconciled_lines
    },
    {
      value: 'complete' as const,
      label: 'Completar',
      icon: 'solar:check-circle-bold-duotone',
      disabled: isReadOnly
    },
    {
      value: 'report' as const,
      label: 'Reporte',
      icon: 'solar:document-text-bold-duotone',
      disabled: reconciliation.status === 'draft'
    },
    {
      value: 'timeline' as const,
      label: 'Timeline',
      icon: 'solar:history-bold-duotone'
    }
  ];

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={currentTab}
        onChange={(_, value) => onChange(value as TabValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            label={
              tab.badge !== undefined && tab.badge > 0 ? (
                <Badge badgeContent={tab.badge} color="primary" max={999}>
                  {tab.label}
                </Badge>
              ) : (
                tab.label
              )
            }
            icon={<Iconify icon={tab.icon} width={20} />}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  );
}
