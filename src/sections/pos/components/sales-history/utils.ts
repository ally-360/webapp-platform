import { format } from 'date-fns';
import { fCurrency } from 'src/utils/format-number';

export const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  nequi: 'Nequi',
  transfer: 'Transferencia',
  credit: 'Crédito'
};

export function escapeCsv(value: string) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function printSale(sale: any) {
  const w = window.open('', '_blank');
  if (!w) return;
  const dateStr = format(new Date(sale.created_at), 'yyyy-MM-dd HH:mm');
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Recibo ${sale.invoice_number || ''}</title>
<style>
  body{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; padding: 24px;}
  h1{font-size:18px;margin:0 0 8px}
  .muted{color:#666}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th,td{text-align:left;padding:6px 4px;border-bottom:1px solid #eee}
  tfoot td{font-weight:600}
</style>
</head>
<body>
  <h1>Recibo POS</h1>
  <div class="muted">Fecha: ${dateStr}</div>
  <div class="muted">Factura: ${sale.invoice_number || '-'}</div>
  <div class="muted">Cliente: ${sale.customer?.name || 'Sin cliente'}</div>
  <div class="muted">Vendedor: ${sale.seller_name || '-'}</div>
  <table>
    <thead>
      <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
    </thead>
    <tbody>
      ${sale.products
        .map(
          (p: any) =>
            `<tr><td>${p.name}</td><td>${p.quantity}</td><td>${fCurrency(p.price)}</td><td>${fCurrency(
              p.price * p.quantity
            )}</td></tr>`
        )
        .join('')}
    </tbody>
    <tfoot>
      <tr><td colspan="3">Subtotal</td><td>${fCurrency(sale.subtotal)}</td></tr>
      <tr><td colspan="3">Impuesto</td><td>${fCurrency(sale.tax_amount)}</td></tr>
      ${
        sale.discount_amount
          ? `<tr><td colspan="3">Descuento</td><td>- ${fCurrency(sale.discount_amount)}</td></tr>`
          : ''
      }
      <tr><td colspan="3">Total</td><td>${fCurrency(sale.total)}</td></tr>
    </tfoot>
  </table>
  <div style="margin-top:12px">
    <div class="muted">Pagos:</div>
    ${sale.payments
      .map((p: any) => `<div>${PAYMENT_LABEL[p.method] || p.method}: ${fCurrency(p.amount)}</div>`)
      .join('')}
  </div>
  <script>window.print(); window.onafterprint = () => window.close();</script>
</body>
</html>`;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
