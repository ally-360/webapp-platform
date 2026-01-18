/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format} from 'date-fns';
import { es } from 'date-fns/locale';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// redux
import { useGetDebitNoteByIdQuery, useVoidDebitNoteMutation } from 'src/redux/services/debitNotesApi';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSnackbar } from 'src/components/snackbar';
// utils
import { fCurrency } from 'src/utils/format-number';
import DebitNoteJournalEntry from '../debit-note-journal-entry';

// ----------------------------------------------------------------------

export default function DebitNoteDetailsView() {
  const params = useParams();
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const { id } = params;

  const { data: debitNote, isLoading } = useGetDebitNoteByIdQuery(id!, {
    skip: !id
  });

  const [voidDebitNote] = useVoidDebitNoteMutation();

  const handleVoid = async () => {
    if (!id) return;
    try {
      await voidDebitNote(id!).unwrap();
      enqueueSnackbar('Nota débito anulada exitosamente', { variant: 'success' });
    } catch (error) {
      console.error('Error voiding debit note:', error);
      enqueueSnackbar('Error al anular la nota débito', { variant: 'error' });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!debitNote) {
    return <Typography>Nota débito no encontrada</Typography>;
  }

  const renderType = (noteType: string) => {
    const typeMap: Record<string, string> = {
      interest: 'Intereses',
      price_adjustment: 'Ajuste de Precio',
      additional_charge: 'Cargo Adicional',
      other: 'Otro'
    };
    return typeMap[noteType] || noteType;
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={debitNote.number}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Notas Débito', href: paths.dashboard.debitNotes.root },
          { name: debitNote.number }
        ]}
        icon="solar:document-text-bold"
        action={
          <Stack direction="row" spacing={1}>
            {debitNote.status === 'open' && (
              <Button
                component={RouterLink}
                href={paths.dashboard.debitNotes.edit(debitNote.id)}
                variant="outlined"
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Editar
              </Button>
            )}
            {debitNote.status !== 'void' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:close-circle-bold" />}
                onClick={handleVoid}
              >
                Anular
              </Button>
            )}
          </Stack>
        }
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <Card sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h6">{debitNote.number}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {format(new Date(debitNote.issue_date), 'dd MMMM yyyy', { locale: es })}
            </Typography>
          </Stack>

          <Label
            variant="soft"
            color={
              (debitNote.status === 'applied' && 'success') ||
              (debitNote.status === 'open' && 'warning') ||
              (debitNote.status === 'void' && 'error') ||
              'default'
            }
          >
            {debitNote.status === 'applied' && 'Aplicada'}
            {debitNote.status === 'open' && 'Abierta'}
            {debitNote.status === 'void' && 'Anulada'}
          </Label>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Información principal */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2}>
            <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
              Cliente:
            </Typography>
            <Typography variant="body2">{debitNote.customer_name || 'N/A'}</Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
              Factura:
            </Typography>
            <Typography variant="body2">{debitNote.invoice_number || 'N/A'}</Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
              Tipo:
            </Typography>
            <Label variant="soft" color="info">
              {renderType(debitNote.type)}
            </Label>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
              Razón:
            </Typography>
            <Typography variant="body2">{debitNote.reason}</Typography>
          </Stack>

          {debitNote.notes && (
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
                Notas:
              </Typography>
              <Typography variant="body2">{debitNote.notes}</Typography>
            </Stack>
          )}

          {debitNote.cost_center && (
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 120 }}>
                Centro de Costo:
              </Typography>
              <Typography variant="body2">
                {debitNote.cost_center.code
                  ? `${debitNote.cost_center.code} · ${debitNote.cost_center.name}`
                  : debitNote.cost_center.name}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Line Items */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Líneas de Cobro
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Precio Unit.</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell align="right">Impuestos</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {debitNote.line_items?.map((item, index) => {
                const lineTaxTotal = (item.line_taxes || []).reduce((sum, tax) => sum + (tax.tax_amount || 0), 0);
                const lineTotal = (item.subtotal || 0) + lineTaxTotal;

                return (
                  <TableRow key={index}>
                    <TableCell>{item.name || item.description || '-'}</TableCell>
                    <TableCell align="right">{item.quantity || '-'}</TableCell>
                    <TableCell align="right">{item.unit_price ? fCurrency(item.unit_price) : '-'}</TableCell>
                    <TableCell align="right">{fCurrency(item.subtotal || 0)}</TableCell>
                    <TableCell align="right">
                      {item.line_taxes && item.line_taxes.length > 0 ? (
                        item.line_taxes.map((tax, taxIndex) => (
                          <Typography key={taxIndex} variant="caption" display="block">
                            {tax.tax_name} ({tax.tax_rate}%): {fCurrency(tax.tax_amount || 0)}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sin impuestos
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{fCurrency(lineTotal)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        {/* Totales */}
        <Stack spacing={2} alignItems="flex-end">
          <Stack direction="row" spacing={3} sx={{ minWidth: 300 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Subtotal:
            </Typography>
            <Typography variant="subtitle2">{fCurrency(parseFloat(debitNote.subtotal))}</Typography>
          </Stack>

          <Stack direction="row" spacing={3} sx={{ minWidth: 300 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Impuestos:
            </Typography>
            <Typography variant="subtitle2">{fCurrency(parseFloat(debitNote.tax_amount))}</Typography>
          </Stack>

          <Stack direction="row" spacing={3} sx={{ minWidth: 300 }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              {fCurrency(parseFloat(debitNote.total_amount))}
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* Asiento Contable */}
      <DebitNoteJournalEntry debitNoteId={id!} />
    </Container>
  );
}
