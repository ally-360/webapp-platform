import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

export default function JournalReversalPage() {
  const navigate = useNavigate();
  const { entryId } = useParams();

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Reversar asiento {entryId}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Icon icon="mdi:arrow-left" />} onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Icon icon="mdi:repeat" />}
            onClick={() => navigate(-1)}
          >
            Confirmar reversión
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Esta acción creará un asiento inverso con las mismas líneas en sentido contrario. Esta es una vista de
            confirmación mock para validar el flujo de UX.
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    </Box>
  );
}
