import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
//
import QuotesToolbar from './quotes-toolbar';

// ----------------------------------------------------------------------

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}));

// ----------------------------------------------------------------------

const STATUS_LABELS = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  expired: 'Vencida',
  converted: 'Convertida'
};

const STATUS_COLORS = {
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  expired: 'warning',
  converted: 'primary'
};

// ----------------------------------------------------------------------

export default function QuotesDetails({ quote }) {
  if (!quote) {
    return (
      <Card sx={{ pt: 5, px: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <Typography>Cargando cotización...</Typography>
        </Box>
      </Card>
    );
  }

  const renderTotal = (
    <>
      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>
          <Box sx={{ mt: 2 }} />
          Subtotal
        </TableCell>
        <TableCell width={120} sx={{ typography: 'subtitle2' }}>
          <Box sx={{ mt: 2 }} />
          {fCurrency(parseFloat(quote.subtotal || '0'))}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Impuestos</TableCell>
        <TableCell width={120}>{fCurrency(parseFloat(quote.taxes_total || '0'))}</TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
        <TableCell width={140} sx={{ typography: 'subtitle1' }}>
          {fCurrency(parseFloat(quote.total_amount || '0'))}
        </TableCell>
      </StyledTableRow>
    </>
  );

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Table sx={{ minWidth: 960 }}>
        <TableHead>
          <TableRow>
            <TableCell width={40}>#</TableCell>
            <TableCell sx={{ typography: 'subtitle2' }}>Producto</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell align="right">Precio Unitario</TableCell>
            <TableCell align="right">Subtotal</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {quote.line_items?.map((row, index) => (
            <TableRow key={row.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Box sx={{ maxWidth: 560 }}>
                  <Typography variant="subtitle2">{row.name}</Typography>
                  {row.reference && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                      REF: {row.reference}
                    </Typography>
                  )}
                  {row.description && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {row.description}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>{parseFloat(row.quantity)}</TableCell>
              <TableCell align="right">{fCurrency(parseFloat(row.unit_price))}</TableCell>
              <TableCell align="right">{fCurrency(parseFloat(row.line_total || '0'))}</TableCell>
            </TableRow>
          ))}

          {renderTotal}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <QuotesToolbar quote={quote} />

      <Card sx={{ pt: 5, px: 5 }}>
        <Box
          rowGap={5}
          display="grid"
          alignItems="center"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
        >
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {quote.quote_number}
            </Typography>
            <Label
              variant="soft"
              color={
                (STATUS_COLORS[quote.status] as
                  | 'default'
                  | 'primary'
                  | 'secondary'
                  | 'info'
                  | 'success'
                  | 'warning'
                  | 'error') || 'default'
              }
            >
              {STATUS_LABELS[quote.status] || quote.status}
            </Label>
          </Box>
        </Box>

        <Stack
          spacing={2}
          alignItems={{ sm: 'flex-end' }}
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          sx={{ mt: 5 }}
        >
          <Box sx={{ width: 1 }}>
            <Typography paragraph variant="overline" sx={{ color: 'text.disabled', mb: 1 }}>
              Cliente
            </Typography>

            <Typography variant="body2">{quote.customer?.name || 'N/A'}</Typography>
            {quote.customer?.email && <Typography variant="body2">{quote.customer.email}</Typography>}
            {quote.customer?.id_type && quote.customer?.id_number && (
              <Typography variant="body2">
                {quote.customer.id_type}: {quote.customer.id_number}
                {quote.customer.dv && `-${quote.customer.dv}`}
              </Typography>
            )}
            {quote.customer?.billing_address?.address && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {quote.customer.billing_address.address}
                {quote.customer.billing_address.city && `, ${quote.customer.billing_address.city}`}
              </Typography>
            )}
          </Box>

          <Box sx={{ width: 1, textAlign: { sm: 'right' } }}>
            <Typography paragraph variant="overline" sx={{ color: 'text.disabled', mb: 1 }}>
              Información
            </Typography>

            <Stack spacing={1} sx={{ typography: 'body2' }}>
              <Stack direction="row" justifyContent={{ sm: 'flex-end' }} spacing={0.5}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Fecha de Emisión:
                </Typography>
                <Typography variant="body2">{fDate(quote.issue_date, 'dd/MM/yyyy')}</Typography>
              </Stack>

              <Stack direction="row" justifyContent={{ sm: 'flex-end' }} spacing={0.5}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Fecha de Vencimiento:
                </Typography>
                <Typography variant="body2">{fDate(quote.expiration_date, 'dd/MM/yyyy')}</Typography>
              </Stack>

              {quote.converted_at && (
                <Stack direction="row" justifyContent={{ sm: 'flex-end' }} spacing={0.5}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Convertida el:
                  </Typography>
                  <Typography variant="body2">{fDate(quote.converted_at, 'dd/MM/yyyy')}</Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>

        {renderList}

        <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

        <Grid container sx={{ py: 3 }}>
          <Grid xs={12} md={9} sx={{ py: { md: 3 } }}>
            {quote.notes && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Notas
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {quote.notes}
                </Typography>
              </Box>
            )}
            {quote.internal_comments && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Comentarios Internos
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {quote.internal_comments}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>
    </>
  );
}

QuotesDetails.propTypes = {
  quote: PropTypes.object
};
