import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { RHFSelect } from 'src/components/hook-form';
import { useGetCostCentersQuery } from 'src/redux/services/accountingApi';

type Props = {
  name?: string;
  label?: string;
  size?: 'small' | 'medium';
  sx?: any;
  hideIfEmpty?: boolean;
};

export default function CostCenterSelectField({
  name = 'cost_center_id',
  label = 'Centro de costo',
  size = 'small',
  sx,
  hideIfEmpty = false
}: Props) {
  const { data: costCenters = [], isFetching } = useGetCostCentersQuery();

  const hasCostCenters = (costCenters?.length || 0) > 0;

  if (!hasCostCenters) {
    if (hideIfEmpty) return null;

    return <Alert severity="info">No hay centros de costo configurados para esta empresa.</Alert>;
  }

  return (
    <Stack spacing={1} sx={sx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <RHFSelect name={name} label={label} size={size} disabled={isFetching}>
            <MenuItem value="">Ninguno</MenuItem>
            {costCenters.map((cc) => (
              <MenuItem key={cc.id} value={cc.id}>
                {cc.code ? `${cc.code} · ${cc.name}` : cc.name}
              </MenuItem>
            ))}
          </RHFSelect>
        </Box>
        <Tooltip title="Organiza gastos e ingresos por departamento o proyecto para un mejor control financiero" arrow>
          <IconButton size="small" sx={{ mt: size === 'small' ? 0 : 0.5 }}>
            <Iconify icon="solar:info-circle-bold" width={20} />
          </IconButton>
        </Tooltip>
      </Box>
    </Stack>
  );
}
