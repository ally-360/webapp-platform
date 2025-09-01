import React from 'react';
import { Box, Button, Card, CardContent, Container, Divider, Stack, Typography } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook/use-router';

export default function ShiftCloseView() {
  const router = useRouter();
  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading="Cierre de turno"
        icon="mdi:door-closed"
        links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Turno' }, { name: 'Cierre' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Turno cerrado correctamente</Typography>
            <Typography variant="body2" color="text.secondary">
              El turno se ha cerrado utilizando datos mock. Aquí puedes volver al POS o revisar el historial de turnos.
            </Typography>
            <Divider />
            <Box>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Button variant="contained" onClick={() => router.push('/pos')}>
                  Ir al POS
                </Button>
                <Button variant="outlined" onClick={() => router.push('/pos/shift/history')}>
                  Ver historial
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
