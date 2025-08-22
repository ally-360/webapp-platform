import React from 'react';
// @mui
import { Box, Typography, Divider, Stack, Paper } from '@mui/material';

// utils
import { formatCurrency } from 'src/redux/pos/posUtils';
import type { CompletedSale } from 'src/redux/pos/posSlice';

interface Props {
  sale: CompletedSale;
  registerInfo: {
    pdv_name: string;
    user_name: string;
  };
  companyInfo?: {
    name: string;
    nit: string;
    address: string;
    phone: string;
    email: string;
  };
}

const defaultCompanyInfo = {
  name: 'Mi Empresa POS',
  nit: '900.123.456-7',
  address: 'Calle 123 #45-67, Palmira, Valle del Cauca',
  phone: '(+57) 2 123 4567',
  email: 'ventas@miempresa.com'
};

const getPaymentMethodName = (method: string) => {
  switch (method) {
    case 'cash':
      return 'Efectivo';
    case 'card':
      return 'Tarjeta';
    case 'nequi':
      return 'Nequi';
    case 'transfer':
      return 'Transferencia';
    default:
      return 'Crédito';
  }
};

export default function PosReceiptTemplate({ sale, registerInfo, companyInfo = defaultCompanyInfo }: Props) {
  const saleDate = new Date(sale.sale_date || sale.created_at);
  const isElectronicInvoice = sale.pos_type === 'electronic' && sale.customer?.document;

  return (
    <Paper
      sx={{
        maxWidth: '80mm',
        mx: 'auto',
        p: 2,
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: 1.2,
        backgroundColor: 'white',
        color: 'black'
      }}
    >
      {/* Header - Company Info */}
      <Box textAlign="center" mb={2}>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '14px' }}>
          {companyInfo.name}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '10px' }}>
          NIT: {companyInfo.nit}
        </Typography>
        <br />
        <Typography variant="caption" sx={{ fontSize: '10px' }}>
          {companyInfo.address}
        </Typography>
        <br />
        <Typography variant="caption" sx={{ fontSize: '10px' }}>
          Tel: {companyInfo.phone}
        </Typography>
        <br />
        <Typography variant="caption" sx={{ fontSize: '10px' }}>
          {companyInfo.email}
        </Typography>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* Receipt Type */}
      <Box textAlign="center" mb={1}>
        <Typography variant="subtitle2" fontWeight="bold">
          {isElectronicInvoice ? 'FACTURA ELECTRÓNICA' : 'TICKET DE VENTA'}
        </Typography>
        {sale.invoice_number && <Typography variant="caption">No. {sale.invoice_number}</Typography>}
      </Box>

      {/* Sale Info */}
      <Stack spacing={0.5} mb={1} sx={{ fontSize: '10px' }}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="caption">Fecha:</Typography>
          <Typography variant="caption">
            {saleDate.toLocaleDateString('es-CO')} {saleDate.toLocaleTimeString('es-CO')}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="caption">PDV:</Typography>
          <Typography variant="caption">{registerInfo.pdv_name}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="caption">Cajero:</Typography>
          <Typography variant="caption">{sale.seller_name || registerInfo.user_name}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="caption">Venta:</Typography>
          <Typography variant="caption">{sale.id}</Typography>
        </Box>
      </Stack>

      {/* Customer Info */}
      {sale.customer && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box mb={1}>
            <Typography variant="caption" fontWeight="bold">
              CLIENTE:
            </Typography>
            <br />
            <Typography variant="caption">{sale.customer.name}</Typography>
            {sale.customer.document && (
              <>
                <br />
                <Typography variant="caption">
                  {sale.customer.document_type}: {sale.customer.document}
                </Typography>
              </>
            )}
            {sale.customer.phone && (
              <>
                <br />
                <Typography variant="caption">Tel: {sale.customer.phone}</Typography>
              </>
            )}
          </Box>
        </>
      )}

      <Divider sx={{ my: 1 }} />

      {/* Products */}
      <Box mb={2}>
        <Typography variant="caption" fontWeight="bold" mb={1} display="block">
          PRODUCTOS:
        </Typography>

        {sale.products.map((product, index) => (
          <Box key={index} mb={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" sx={{ flex: 1, pr: 1 }}>
                {product.name}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">
                {product.quantity} x {formatCurrency(product.price)}
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {formatCurrency(product.price * product.quantity)}
              </Typography>
            </Box>
            {product.tax_rate && product.tax_rate > 0 && (
              <Typography variant="caption" color="text.secondary">
                IVA: {(product.tax_rate * 100).toFixed(1)}%
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* Totals */}
      <Stack spacing={0.5} mb={2}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="caption">Subtotal:</Typography>
          <Typography variant="caption">{formatCurrency(sale.subtotal)}</Typography>
        </Box>

        {sale.discount_amount && sale.discount_amount > 0 && (
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption">Descuento:</Typography>
            <Typography variant="caption">-{formatCurrency(sale.discount_amount)}</Typography>
          </Box>
        )}

        {sale.tax_amount > 0 && (
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption">IVA:</Typography>
            <Typography variant="caption">{formatCurrency(sale.tax_amount)}</Typography>
          </Box>
        )}

        <Divider />

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" fontWeight="bold">
            TOTAL:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {formatCurrency(sale.total)}
          </Typography>
        </Box>
      </Stack>

      {/* Payments */}
      <Box mb={2}>
        <Typography variant="caption" fontWeight="bold" mb={1} display="block">
          PAGOS:
        </Typography>
        {sale.payments.map((payment, index) => (
          <Box key={index} display="flex" justifyContent="space-between">
            <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
              {getPaymentMethodName(payment.method)}:
            </Typography>
            <Typography variant="caption">{formatCurrency(payment.amount)}</Typography>
          </Box>
        ))}

        {/* Change calculation */}
        {(() => {
          const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
          const change = totalPaid - sale.total;
          return (
            change > 0 && (
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption" fontWeight="bold">
                  Cambio:
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {formatCurrency(change)}
                </Typography>
              </Box>
            )
          );
        })()}
      </Box>

      {/* Notes */}
      {sale.notes && (
        <Box mb={2}>
          <Typography variant="caption" fontWeight="bold">
            Observaciones:
          </Typography>
          <br />
          <Typography variant="caption">{sale.notes}</Typography>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Footer */}
      <Box textAlign="center">
        <Typography variant="caption" sx={{ fontSize: '10px' }}>
          ¡Gracias por su compra!
        </Typography>
        <br />
        <Typography variant="caption" sx={{ fontSize: '9px' }}>
          {isElectronicInvoice
            ? 'Factura electrónica válida como documento tributario'
            : 'Documento no válido como factura'}
        </Typography>
        <br />
        <Typography variant="caption" sx={{ fontSize: '9px' }}>
          Sistema POS - {new Date().getFullYear()}
        </Typography>
      </Box>
    </Paper>
  );
}
