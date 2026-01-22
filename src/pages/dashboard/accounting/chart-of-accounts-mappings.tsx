import React, { useState } from 'react';
import { Autocomplete, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';

// Simple mock catalog for selector
const mockAccounts = [
  { code: '110505', name: 'Caja general' },
  { code: '220505', name: 'Banco corriente' },
  { code: '413505', name: 'Servicios profesionales' },
  { code: '130505', name: 'Clientes nacionales' },
  { code: '240805', name: 'IVA generado' }
];

function AccountSelector({ label, value, onChange }: { label: string; value: any; onChange: (v: any) => void }) {
  return (
    <Autocomplete
      options={mockAccounts}
      getOptionLabel={(o) => `${o.code} - ${o.name}`}
      value={value}
      onChange={(_, v) => onChange(v)}
      renderInput={(params) => <TextField {...params} label={label} />}
      fullWidth
    />
  );
}

function Section({
  title,
  fields,
  form,
  setForm
}: {
  title: string;
  fields: Array<{ key: string; label: string }>;
  form: Record<string, any>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
        <Grid container spacing={2}>
          {fields.map((f) => (
            <Grid item xs={12} md={6} key={f.key}>
              <AccountSelector
                label={f.label}
                value={form[f.key] || null}
                onChange={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default function ChartOfAccountsMappingsPage() {
  const [form, setForm] = useState<Record<string, any>>({});

  const handleSave = () => {
    enqueueSnackbar('Parámetros guardados (mock). Listo para integrar con GraphQL.', {
      variant: 'success'
    });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Parámetros Contables</Typography>
        <Button variant="contained" onClick={handleSave}>
          Guardar
        </Button>
      </Stack>

      <Section
        title="Ventas / Devoluciones"
        fields={[
          { key: 'ventas', label: 'Ventas' },
          { key: 'devolucionesVentas', label: 'Devoluciones en ventas' }
        ]}
        form={form}
        setForm={setForm}
      />

      <Section
        title="Cuentas por cobrar (CxC)"
        fields={[
          { key: 'cxc', label: 'Cuenta por cobrar' },
          { key: 'interesesCxc', label: 'Intereses CxC' }
        ]}
        form={form}
        setForm={setForm}
      />

      <Section
        title="Cuentas por pagar (CxP)"
        fields={[
          { key: 'cxp', label: 'Cuenta por pagar' },
          { key: 'retencionesCxp', label: 'Retenciones CxP' }
        ]}
        form={form}
        setForm={setForm}
      />

      <Section
        title="Inventario / Costo de ventas"
        fields={[
          { key: 'inventario', label: 'Inventario' },
          { key: 'costoVentas', label: 'Costo de ventas' }
        ]}
        form={form}
        setForm={setForm}
      />

      <Section
        title="Impuestos"
        fields={[
          { key: 'ivaPorPagar', label: 'IVA por pagar' },
          { key: 'ivaDescontable', label: 'IVA descontable' },
          { key: 'retencionFuente', label: 'Retención en la fuente' },
          { key: 'retencionIva', label: 'Retención IVA' }
        ]}
        form={form}
        setForm={setForm}
      />

      <Section
        title="Bancos / Caja"
        fields={[
          { key: 'caja', label: 'Caja' },
          { key: 'bancos', label: 'Bancos' }
        ]}
        form={form}
        setForm={setForm}
      />

      <Section
        title="Ajustes y redondeos"
        fields={[
          { key: 'ajustes', label: 'Ajustes' },
          { key: 'redondeos', label: 'Redondeos' }
        ]}
        form={form}
        setForm={setForm}
      />
    </Box>
  );
}
