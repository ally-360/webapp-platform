import React, { useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField
} from '@mui/material';
import { Icon } from '@iconify/react';
import { ChartAccountNode, AccountNature } from '../types';
import { LEVEL_CODE_LENGTH, TAX_TAGS, USAGE_TAGS, ACCOUNT_NATURES } from '../constants';

export type AccountWizardDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<ChartAccountNode, 'id' | 'status' | 'parentId'>) => void;
  initial?: ChartAccountNode;
  existingCodes: string[];
};

export const AccountWizardDialog: React.FC<AccountWizardDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initial,
  existingCodes
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<Omit<ChartAccountNode, 'id' | 'status' | 'parentId'>>({
    code: initial?.code || '',
    name: initial?.name || '',
    level: initial?.level || 'CLASS',
    nature: initial?.nature || 'DEBIT',
    requiresThirdParty: initial?.requiresThirdParty || false,
    requiresCostCenter: initial?.requiresCostCenter || false,
    reconcilable: initial?.reconcilable || false,
    allowMovements: initial?.allowMovements || false,
    taxTags: initial?.taxTags || [],
    usage: initial?.usage || []
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const isEdit = Boolean(initial);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string | null> = {};
    if (step === 0) {
      if (!form.code) newErrors.code = 'Requerido';
      if (!form.name) newErrors.name = 'Requerido';
      const expected = LEVEL_CODE_LENGTH[form.level];
      if (form.code && form.code.length !== expected)
        newErrors.code = `El código debe tener ${expected} dígito(s) para nivel ${form.level.toLowerCase()}`;
      if (!isEdit && form.code && existingCodes.includes(form.code)) newErrors.code = 'Código ya existe';
    }
    if (step === 1) {
      // Reglas: no-op validations here
    }
    if (step === 2) {
      // Impuestos/uso: no-op required validations
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    if (activeStep === 2) {
      onSubmit(form);
    } else {
      setActiveStep((s) => s + 1);
    }
  };

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  const handleClose = () => {
    setActiveStep(0);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar cuenta' : 'Crear cuenta'}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 2 }}>
          <Step>
            <StepLabel>Identificación</StepLabel>
          </Step>
          <Step>
            <StepLabel>Reglas</StepLabel>
          </Step>
          <Step>
            <StepLabel>Impuestos / Uso</StepLabel>
          </Step>
        </Stepper>

        {activeStep === 0 && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="level-label">Nivel</InputLabel>
              <Select
                labelId="level-label"
                label="Nivel"
                value={form.level}
                onChange={(e) => {
                  const level = e.target.value as ChartAccountNode['level'];
                  setForm((prev) => ({ ...prev, level }));
                }}
              >
                <MenuItem value="CLASS">Clase</MenuItem>
                <MenuItem value="GROUP">Grupo</MenuItem>
                <MenuItem value="ACCOUNT">Cuenta</MenuItem>
                <MenuItem value="SUBACCOUNT">Subcuenta</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Código"
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              error={Boolean(errors.code)}
              helperText={errors.code || `Longitud esperada: ${LEVEL_CODE_LENGTH[form.level]}`}
            />
            <TextField
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              error={Boolean(errors.name)}
              helperText={errors.name || ''}
            />
            <FormControl fullWidth>
              <InputLabel id="nature-label">Naturaleza</InputLabel>
              <Select
                labelId="nature-label"
                label="Naturaleza"
                value={form.nature}
                onChange={(e) => setForm((prev) => ({ ...prev, nature: e.target.value as AccountNature }))}
              >
                {ACCOUNT_NATURES.map((n) => (
                  <MenuItem key={n.value} value={n.value}>
                    {n.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}

        {activeStep === 1 && (
          <Stack spacing={1} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(form.requiresThirdParty)}
                  onChange={(e) => setForm((prev) => ({ ...prev, requiresThirdParty: e.target.checked }))}
                />
              }
              label="Requiere tercero"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(form.requiresCostCenter)}
                  onChange={(e) => setForm((prev) => ({ ...prev, requiresCostCenter: e.target.checked }))}
                />
              }
              label="Requiere centro de costos"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(form.reconcilable)}
                  onChange={(e) => setForm((prev) => ({ ...prev, reconcilable: e.target.checked }))}
                />
              }
              label="Conciliable"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(form.allowMovements)}
                  onChange={(e) => setForm((prev) => ({ ...prev, allowMovements: e.target.checked }))}
                />
              }
              label="Permitir movimientos"
            />
            <Alert severity="info">
              Las reglas aplican según políticas internas. Validaciones adicionales se integrarán con backend.
            </Alert>
          </Stack>
        )}

        {activeStep === 2 && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="tax-label">Etiquetas de impuestos</InputLabel>
              <Select
                labelId="tax-label"
                label="Etiquetas de impuestos"
                multiple
                value={form.taxTags || []}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, taxTags: e.target.value as ChartAccountNode['taxTags'] }))
                }
                renderValue={(selected) => (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(selected as string[]).map((t) => (
                      <Chip key={t} size="small" label={t} sx={{ mr: 0.5 }} />
                    ))}
                  </Stack>
                )}
              >
                {TAX_TAGS.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="usage-label">Uso / Mapeo</InputLabel>
              <Select
                labelId="usage-label"
                label="Uso / Mapeo"
                multiple
                value={form.usage || []}
                onChange={(e) => setForm((prev) => ({ ...prev, usage: e.target.value as ChartAccountNode['usage'] }))}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(selected as string[]).map((u) => (
                      <Chip key={u} size="small" label={u} sx={{ mr: 0.5 }} />
                    ))}
                  </Stack>
                )}
              >
                {USAGE_TAGS.map((u) => (
                  <MenuItem key={u.value} value={u.value}>
                    {u.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} startIcon={<Icon icon="mdi:chevron-left" />}>
            Atrás
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
          endIcon={activeStep === 2 ? undefined : <Icon icon="mdi:chevron-right" />}
        >
          {(() => {
            let submitLabel = 'Siguiente';
            if (activeStep === 2) submitLabel = isEdit ? 'Guardar' : 'Crear';
            return submitLabel;
          })()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
