/* eslint-disable import/no-duplicates */
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// redux
import { useGetPurchaseOrderByIdQuery } from 'src/redux/services/billsApi';

// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CompanyLogo from 'src/components/company-logo';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSettingsContext } from 'src/components/settings';
import { fCurrency } from 'src/utils/format-number';
import ConvertPOToBillDialog from '../convert-po-to-bill-dialog';
import VoidPurchaseOrderDialog from '../void-purchase-order-dialog';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  approved: 'Aprobada',
  closed: 'Cerrada',
  void: 'Anulada'
};

const STATUS_COLORS: Record<string, any> = {
  draft: 'default',
  sent: 'info',
  approved: 'success',
  closed: 'warning',
  void: 'error'
};

export default function PurchaseOrderDetailsView() {
  const params = useParams();
  const id = params.id || '';

  const settings = useSettingsContext();
  const router = useRouter();
  const popover = usePopover();

  const { data, isLoading, isError } = useGetPurchaseOrderByIdQuery(id, { skip: !id });

  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);

  const canEdit = data?.status === 'draft' || data?.status === 'sent';
  const canConvertToBill = data?.status === 'sent' || data?.status === 'approved';
  const canVoid = data?.status !== 'void' && data?.status !== 'closed';

  const totals = useMemo(() => {
    const subtotal = Number(data?.subtotal || 0);
    const taxes = Number(data?.taxes_total || 0);
    const total = Number(data?.total_amount || 0);

    return { subtotal, taxes, total };
  }, [data]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        icon=""
        heading={`Orden de Compra ${data?.order_number ? `#${data.order_number}` : ''}`}
        subHeading="Revisa el detalle completo de la orden de compra, incluyendo proveedor, fechas, productos y totales."
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Gastos', href: paths.dashboard.bill.root },
          { name: 'Órdenes de Compra', href: paths.dashboard.expenses.purchaseOrders.root },
          { name: 'Detalle' }
        ]}
        action={
          <Stack direction="row" spacing={1}>
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={() => router.push(paths.dashboard.expenses.purchaseOrders.edit(id))}
              >
                Editar
              </Button>
            )}

            <Button
              color="inherit"
              variant="outlined"
              startIcon={<Iconify icon="eva:more-vertical-fill" />}
              onClick={popover.onOpen}
            >
              Acciones
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
              onClick={() => router.push(paths.dashboard.expenses.purchaseOrders.root)}
            >
              Volver
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && (
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Cargando...
          </Typography>
        </Card>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          No fue posible cargar el detalle de la orden.
        </Alert>
      )}

      {!!data && (
        <Stack spacing={3}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <CompanyLogo width={100} height={67} disabledLink />
                <Stack spacing={0.5} flexGrow={1}>
                  <Typography variant="h6">Orden de Compra #{data.order_number || id.substring(0, 8)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Emitida el {format(new Date(data.issue_date), 'dd MMM yyyy', { locale: es })}
                  </Typography>
                </Stack>
                <Label variant="soft" color={STATUS_COLORS[data.status] || 'default'}>
                  {STATUS_LABELS[data.status] || data.status}
                </Label>
              </Stack>

              <Divider />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Proveedor
                  </Typography>
                  <Typography variant="h6">{data.supplier_name || data.supplier?.name || 'Sin proveedor'}</Typography>
                  {!!(data.supplier_email || data.supplier?.email) && (
                    <Typography variant="body2" color="text.secondary">
                      {data.supplier_email || data.supplier?.email}
                    </Typography>
                  )}
                </Stack>

                <Stack spacing={0.5} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    PDV
                  </Typography>
                  <Typography variant="body2">{data.pdv?.name || data.pdv_id}</Typography>
                </Stack>
              </Stack>

              <Divider />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                {!!data.expected_delivery_date && (
                  <Stack spacing={0.5} sx={{ minWidth: 220 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Entrega esperada
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(data.expected_delivery_date), 'dd MMM yyyy', { locale: es })}
                    </Typography>
                  </Stack>
                )}

                <Stack spacing={0.5} sx={{ minWidth: 220 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Moneda
                  </Typography>
                  <Typography variant="body2">{data.currency || 'COP'}</Typography>
                </Stack>
              </Stack>

              {!!data.notes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Notas
                  </Typography>
                  <Typography variant="body2">{data.notes}</Typography>
                </Box>
              )}
            </Stack>
          </Card>

          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Productos</Typography>

              <TableContainer>
                <Scrollbar>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell>Cantidad</TableCell>
                        <TableCell>Precio unitario</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {(data.items || []).map((item) => {
                        const qty = Number(item.quantity || 0);
                        const unit = Number(item.unit_price || 0);
                        const lineSubtotal = item.line_subtotal ? Number(item.line_subtotal) : qty * unit;

                        return (
                          <TableRow key={`${item.id ?? item.product_id}`}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {item.name || item.product?.name || 'Producto'}
                              </Typography>
                              {!!item.product?.sku && (
                                <Typography variant="caption" color="text.secondary">
                                  SKU: {item.product.sku}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell>{qty}</TableCell>
                            <TableCell>{fCurrency(unit)}</TableCell>
                            <TableCell align="right">{fCurrency(lineSubtotal)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>

              <Divider />

              <Stack spacing={1} sx={{ maxWidth: 420, ml: 'auto' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fCurrency(totals.subtotal)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" color="text.secondary">
                    Impuestos
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fCurrency(totals.taxes)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary.main">
                    {fCurrency(totals.total)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      )}

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="top-right">
        {canConvertToBill && (
          <MenuItem
            onClick={() => {
              setConvertDialogOpen(true);
              popover.onClose();
            }}
          >
            <Iconify icon="solar:document-add-bold" />
            Convertir a Factura
          </MenuItem>
        )}

        {canVoid && (
          <MenuItem
            onClick={() => {
              setVoidDialogOpen(true);
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Anular Orden
          </MenuItem>
        )}
      </CustomPopover>

      <ConvertPOToBillDialog
        open={convertDialogOpen}
        onClose={() => setConvertDialogOpen(false)}
        poId={id}
        poNumber={data?.order_number}
      />

      <VoidPurchaseOrderDialog
        open={voidDialogOpen}
        onClose={() => setVoidDialogOpen(false)}
        poId={id}
        poNumber={data?.order_number}
      />
    </Container>
  );
}
