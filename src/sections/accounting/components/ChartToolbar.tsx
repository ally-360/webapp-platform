import React from 'react';
import { Button, Chip, IconButton, Stack, Tooltip } from '@mui/material';
import { Icon } from '@iconify/react';

export type ChartToolbarProps = {
  onCreate: () => void;
  onImport: () => void;
  onExport: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onOpenAudit: () => void;
  onOpenFilters: () => void;
  filterActive: boolean;
  onClearFilter: () => void;
};

export const ChartToolbar = React.memo((props: ChartToolbarProps) => {
  const {
    onCreate,
    onImport,
    onExport,
    onExpandAll,
    onCollapseAll,
    onOpenAudit,
    onOpenFilters,
    filterActive,
    onClearFilter
  } = props;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={onCreate}>
        Crear cuenta
      </Button>
      <Button variant="outlined" startIcon={<Icon icon="mdi:file-upload-outline" />} onClick={onImport}>
        Importar
      </Button>
      <Button variant="outlined" startIcon={<Icon icon="mdi:file-download-outline" />} onClick={onExport}>
        Exportar
      </Button>
      <Tooltip title="Filtros">
        <IconButton onClick={onOpenFilters}>
          <Icon icon="mdi:filter-variant" />
        </IconButton>
      </Tooltip>
      {filterActive && <Chip size="small" label="Filtro activo" onDelete={onClearFilter} sx={{ ml: 0.5 }} />}
      <Tooltip title="Expandir todo">
        <IconButton onClick={onExpandAll}>
          <Icon icon="mdi:unfold-more-horizontal" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Colapsar todo">
        <IconButton onClick={onCollapseAll}>
          <Icon icon="mdi:unfold-less-horizontal" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Historial">
        <IconButton onClick={onOpenAudit}>
          <Icon icon="mdi:history" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
});
