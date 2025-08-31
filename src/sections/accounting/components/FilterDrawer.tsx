import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Icon } from '@iconify/react';
import { AccountNature, AccountStatus } from '../types';
import { ACCOUNT_NATURES, ACCOUNT_STATUSES } from '../constants';

export type FilterDrawerPayload = {
  text: string;
  sortKey: 'code' | 'name';
  sortDir: 'asc' | 'desc';
  nature: AccountNature | '';
  status: AccountStatus | '';
  flags: { requiresThirdParty: boolean; requiresCostCenter: boolean; reconcilable: boolean; allowMovements: boolean };
};

export type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  initialText: string;
  initialSortKey: 'code' | 'name';
  initialSortDir: 'asc' | 'desc';
  initialNature: AccountNature | '';
  initialStatus: AccountStatus | '';
  initialFlags: {
    requiresThirdParty: boolean;
    requiresCostCenter: boolean;
    reconcilable: boolean;
    allowMovements: boolean;
  };
  onApply: (payload: FilterDrawerPayload) => void;
};

export const FilterDrawer = React.memo((props: FilterDrawerProps) => {
  const {
    open,
    onClose,
    initialText,
    initialSortKey,
    initialSortDir,
    initialNature,
    initialStatus,
    initialFlags,
    onApply
  } = props;
  const [text, setText] = React.useState(initialText);
  const [sk, setSk] = React.useState<'code' | 'name'>(initialSortKey);
  const [sd, setSd] = React.useState<'asc' | 'desc'>(initialSortDir);
  const [nature, setNature] = React.useState<AccountNature | ''>(initialNature);
  const [status, setStatus] = React.useState<AccountStatus | ''>(initialStatus);
  const [flags, setFlags] = React.useState(initialFlags);

  type Preset = {
    name: string;
    text: string;
    sortKey: 'code' | 'name';
    sortDir: 'asc' | 'desc';
    nature: AccountNature | '';
    status: AccountStatus | '';
    flags: { requiresThirdParty: boolean; requiresCostCenter: boolean; reconcilable: boolean; allowMovements: boolean };
  };

  const STORAGE_KEY = 'coaFilterPresets';
  const [presets, setPresets] = React.useState<Preset[]>([]);
  const [presetName, setPresetName] = React.useState('');

  React.useEffect(() => {
    setText(initialText);
    setSk(initialSortKey);
    setSd(initialSortDir);
    setNature(initialNature);
    setStatus(initialStatus);
    setFlags(initialFlags);
  }, [initialText, initialSortKey, initialSortDir, initialNature, initialStatus, initialFlags, open]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPresets(JSON.parse(raw));
    } catch (e) {
      // ignore preset parse errors
    }
  }, []);

  const savePresets = (list: Preset[]) => {
    setPresets(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // ignore preset save errors
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const newPreset: Preset = { name: presetName.trim(), text, sortKey: sk, sortDir: sd, nature, status, flags };
    const exists = presets.some((p) => p.name.toLowerCase() === newPreset.name.toLowerCase());
    const next = exists
      ? presets.map((p) => (p.name.toLowerCase() === newPreset.name.toLowerCase() ? newPreset : p))
      : [...presets, newPreset];
    savePresets(next);
    setPresetName('');
  };

  const applyPreset = (p: Preset) => {
    setText(p.text);
    setSk(p.sortKey);
    setSd(p.sortDir);
    setNature(p.nature);
    setStatus(p.status);
    setFlags(p.flags);
  };

  const deletePreset = (name: string) => {
    savePresets(presets.filter((p) => p.name !== name));
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: 380 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        <Typography variant="h6">Filtros</Typography>
        <IconButton onClick={onClose}>
          <Icon icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Búsqueda rápida
        </Typography>
        <TextField
          fullWidth
          placeholder="Buscar por código o nombre"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Se mostrará el resultado y sus padres para mantener el contexto.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Ordenar
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="order-key-label">Ordenar por</InputLabel>
            <Select
              labelId="order-key-label"
              label="Ordenar por"
              value={sk}
              onChange={(e) => setSk(e.target.value as 'code' | 'name')}
            >
              <MenuItem value="code">Código</MenuItem>
              <MenuItem value="name">Nombre</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="order-dir-label">Dirección</InputLabel>
            <Select
              labelId="order-dir-label"
              label="Dirección"
              value={sd}
              onChange={(e) => setSd(e.target.value as 'asc' | 'desc')}
            >
              <MenuItem value="asc">Ascendente</MenuItem>
              <MenuItem value="desc">Descendente</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Filtros avanzados
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="nature-label-adv">Naturaleza</InputLabel>
            <Select
              labelId="nature-label-adv"
              label="Naturaleza"
              value={nature}
              onChange={(e) => setNature(e.target.value as AccountNature | '')}
            >
              <MenuItem value="">Todos</MenuItem>
              {ACCOUNT_NATURES.map((n) => (
                <MenuItem key={n.value} value={n.value}>
                  {n.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="status-label-adv">Estado</InputLabel>
            <Select
              labelId="status-label-adv"
              label="Estado"
              value={status}
              onChange={(e) => setStatus(e.target.value as AccountStatus | '')}
            >
              <MenuItem value="">Todos</MenuItem>
              {ACCOUNT_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack>
          <FormControlLabel
            control={
              <Checkbox
                checked={flags.requiresThirdParty}
                onChange={(e) => setFlags((f) => ({ ...f, requiresThirdParty: e.target.checked }))}
              />
            }
            label="Requiere tercero"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={flags.requiresCostCenter}
                onChange={(e) => setFlags((f) => ({ ...f, requiresCostCenter: e.target.checked }))}
              />
            }
            label="Requiere centro de costos"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={flags.reconcilable}
                onChange={(e) => setFlags((f) => ({ ...f, reconcilable: e.target.checked }))}
              />
            }
            label="Conciliable"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={flags.allowMovements}
                onChange={(e) => setFlags((f) => ({ ...f, allowMovements: e.target.checked }))}
              />
            }
            label="Permite movimientos"
          />
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>
          Filtros guardados
        </Typography>
        <Stack spacing={1} sx={{ mb: 1 }}>
          {presets.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              Aún no tienes filtros guardados.
            </Typography>
          )}
          {presets.map((p) => (
            <Stack key={p.name} direction="row" spacing={1} alignItems="center">
              <Button size="small" variant="outlined" onClick={() => applyPreset(p)}>
                {p.name}
              </Button>
              <IconButton size="small" onClick={() => deletePreset(p.name)}>
                <Icon icon="mdi:delete-outline" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Nombre del filtro"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
          <Button size="small" onClick={handleSavePreset} startIcon={<Icon icon="mdi:content-save-outline" />}>
            Guardar
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
          <Button
            onClick={() => {
              setText('');
              setNature('');
              setStatus('');
              setFlags({
                requiresThirdParty: false,
                requiresCostCenter: false,
                reconcilable: false,
                allowMovements: false
              });
            }}
          >
            Limpiar
          </Button>
          <Button
            variant="contained"
            onClick={() => onApply({ text, sortKey: sk, sortDir: sd, nature, status, flags })}
          >
            Aplicar
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
});
