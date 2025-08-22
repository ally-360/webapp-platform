import type { CompletedSale } from 'src/redux/pos/posSlice';

interface PrintReceiptOptions {
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

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);

const getPaymentMethodName = (method: string): string => {
  const methods: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    nequi: 'Nequi',
    transfer: 'Transferencia'
  };
  return methods[method] || 'Crédito';
};

export const printReceipt = (options: PrintReceiptOptions): boolean => {
  const { sale, registerInfo, companyInfo = defaultCompanyInfo } = options;
  const saleDate = new Date(sale.sale_date || sale.created_at);
  const isElectronicInvoice = sale.pos_type === 'electronic' && sale.customer?.document;

  const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
  const change = totalPaid - sale.total;

  // Build products HTML
  const productsHTML = sale.products
    .map(
      (product) => `
    <div style="margin: 4px 0; border-bottom: 1px dotted #ccc; padding-bottom: 2px;">
      <div style="font-weight: bold;">${product.name}</div>
      <div style="display: flex; justify-content: space-between; font-size: 11px;">
        <span>${product.quantity} x ${formatCurrency(product.price)}</span>
        <span style="font-weight: bold;">${formatCurrency(product.price * product.quantity)}</span>
      </div>
    </div>
  `
    )
    .join('');

  // Build payments HTML
  const paymentsHTML = sale.payments
    .map(
      (payment) => `
    <div style="display: flex; justify-content: space-between; margin: 2px 0;">
      <span>${getPaymentMethodName(payment.method)}:</span>
      <span>${formatCurrency(payment.amount)}</span>
    </div>
  `
    )
    .join('');

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket de Venta - ${sale.id}</title>
        <meta charset="utf-8">
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            line-height: 1.4; 
            background: white; 
            color: black; 
            padding: 8mm; 
            max-width: 80mm;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 12px;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
          }
          .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .company-info {
            font-size: 10px;
            margin: 1px 0;
          }
          .receipt-type {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin: 8px 0;
            padding: 4px;
            border: 1px solid #000;
          }
          .sale-info {
            margin: 8px 0;
            padding: 4px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: 11px;
          }
          .customer-section {
            margin: 8px 0;
            padding: 4px;
            background: #f5f5f5;
            border: 1px solid #ddd;
          }
          .products-section {
            margin: 8px 0;
          }
          .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 4px;
          }
          .totals-section {
            margin: 8px 0;
            padding-top: 4px;
            border-top: 2px solid #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .total-final {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 4px;
            margin-top: 4px;
          }
          .payments-section {
            margin: 8px 0;
            padding: 4px;
            background: #e8f5e8;
            border: 1px solid #4caf50;
          }
          .change-row {
            font-weight: bold;
            font-size: 13px;
            color: #f44336;
            border-top: 1px solid #f44336;
            padding-top: 4px;
            margin-top: 4px;
          }
          .notes-section {
            margin: 8px 0;
            padding: 4px;
            background: #fff3cd;
            border: 1px solid #ffc107;
            font-style: italic;
          }
          .footer {
            text-align: center;
            margin-top: 12px;
            padding-top: 8px;
            border-top: 2px solid #000;
            font-size: 10px;
          }
          @media print {
            body { 
              padding: 2mm; 
              font-size: 11px;
            }
            .receipt { 
              max-width: none; 
              width: 100%; 
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div class="company-name">${companyInfo.name}</div>
          <div class="company-info">NIT: ${companyInfo.nit}</div>
          <div class="company-info">${companyInfo.address}</div>
          <div class="company-info">Tel: ${companyInfo.phone}</div>
          <div class="company-info">${companyInfo.email}</div>
        </div>
        
        <!-- Receipt Type -->
        <div class="receipt-type">
          ${isElectronicInvoice ? 'FACTURA ELECTRÓNICA' : 'TICKET DE VENTA'}
          ${sale.invoice_number ? `<br><small>No. ${sale.invoice_number}</small>` : ''}
        </div>
        
        <!-- Sale Info -->
        <div class="sale-info">
          <div class="info-row">
            <span><strong>Fecha:</strong></span>
            <span>${saleDate.toLocaleDateString('es-CO')} ${saleDate.toLocaleTimeString('es-CO')}</span>
          </div>
          <div class="info-row">
            <span><strong>PDV:</strong></span>
            <span>${registerInfo.pdv_name}</span>
          </div>
          <div class="info-row">
            <span><strong>Cajero:</strong></span>
            <span>${sale.seller_name || registerInfo.user_name}</span>
          </div>
          <div class="info-row">
            <span><strong>Venta No:</strong></span>
            <span>${sale.id}</span>
          </div>
        </div>
        
        <!-- Customer -->
        ${
          sale.customer
            ? `
          <div class="customer-section">
            <div class="section-title">CLIENTE</div>
            <div><strong>${sale.customer.name}</strong></div>
            ${
              sale.customer.document
                ? `
              <div>${sale.customer.document_type}: ${sale.customer.document}</div>
            `
                : ''
            }
            ${
              sale.customer.phone
                ? `
              <div>Tel: ${sale.customer.phone}</div>
            `
                : ''
            }
          </div>
        `
            : ''
        }
        
        <!-- Products -->
        <div class="products-section">
          <div class="section-title">PRODUCTOS (${sale.products.length})</div>
          ${productsHTML}
        </div>
        
        <!-- Totals -->
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(sale.subtotal)}</span>
          </div>
          
          ${
            sale.discount_amount && sale.discount_amount > 0
              ? `
            <div class="total-row" style="color: #f44336;">
              <span>Descuento:</span>
              <span>-${formatCurrency(sale.discount_amount)}</span>
            </div>
          `
              : ''
          }
          
          ${
            sale.tax_amount > 0
              ? `
            <div class="total-row">
              <span>IVA (${Math.round(
                (sale.tax_amount / (sale.subtotal - (sale.discount_amount || 0))) * 100
              )}%):</span>
              <span>${formatCurrency(sale.tax_amount)}</span>
            </div>
          `
              : ''
          }
          
          <div class="total-row total-final">
            <span><strong>TOTAL:</strong></span>
            <span><strong>${formatCurrency(sale.total)}</strong></span>
          </div>
        </div>
        
        <!-- Payments -->
        <div class="payments-section">
          <div class="section-title">FORMA DE PAGO</div>
          ${paymentsHTML}
          
          ${
            change > 0
              ? `
            <div class="total-row change-row">
              <span><strong>CAMBIO:</strong></span>
              <span><strong>${formatCurrency(change)}</strong></span>
            </div>
          `
              : ''
          }
        </div>
        
        <!-- Notes -->
        ${
          sale.notes
            ? `
          <div class="notes-section">
            <div class="section-title">OBSERVACIONES</div>
            <div>${sale.notes}</div>
          </div>
        `
            : ''
        }
        
        <!-- Footer -->
        <div class="footer">
          <div style="font-size: 12px; margin-bottom: 4px;"><strong>¡Gracias por su compra!</strong></div>
          <div>${
            isElectronicInvoice
              ? 'Factura electrónica válida como documento tributario'
              : 'Documento no válido como factura'
          }</div>
          <div style="margin-top: 4px;">Sistema POS - ${new Date().getFullYear()}</div>
        </div>
      </body>
    </html>
  `;

  try {
    const printWindow = window.open('', '_blank', 'width=400,height=700,menubar=no,toolbar=no,location=no,status=no');

    if (!printWindow) {
      alert('No se pudo abrir la ventana de impresión. Verifique que no esté bloqueada por el navegador.');
      return false;
    }

    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        printWindow.print();

        // Close window after printing (optional)
        setTimeout(() => {
          printWindow.close();
        }, 1500);
      }, 500);
    });

    return true;
  } catch (error) {
    console.error('Error al imprimir ticket:', error);
    alert('Error al generar el ticket de impresión');
    return false;
  }
};
