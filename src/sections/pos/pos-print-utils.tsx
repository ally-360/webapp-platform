import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import theme from 'src/theme';
import type { CompletedSale } from 'src/redux/pos/posSlice';
import PosReceiptTemplate from './pos-receipt-template';

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

export const printReceipt = async (options: PrintReceiptOptions) => {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      console.error('Could not open print window. Check popup blocker.');
      return false;
    }

    // Create the HTML structure
    const printDocument = printWindow.document;
    printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Venta - ${options.sale.id}</title>
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
              line-height: 1.2;
              background: white;
              color: black;
              padding: 10mm;
            }
            
            .receipt {
              max-width: 80mm;
              margin: 0 auto;
              background: white;
            }
            
            .center {
              text-align: center;
            }
            
            .bold {
              font-weight: bold;
            }
            
            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            
            .flex {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 2px 0;
            }
            
            .product-line {
              margin-bottom: 4px;
            }
            
            .small {
              font-size: 10px;
            }
            
            .total-line {
              border-top: 2px solid #000;
              margin-top: 4px;
              padding-top: 4px;
              font-weight: bold;
            }
            
            @media print {
              body {
                padding: 0;
              }
              .receipt {
                max-width: none;
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div id="receipt-root"></div>
        </body>
      </html>
    `);
    printDocument.close();

    // Wait for the document to load
    await new Promise((resolve) => {
      printWindow.addEventListener('load', resolve);
    });

    // Create React root in the new window and render the receipt
    const receiptRoot = printWindow.document.getElementById('receipt-root');
    if (receiptRoot) {
      const root = createRoot(receiptRoot);

      // Render the receipt component
      root.render(
        <ThemeProvider theme={theme}>
          <PosReceiptTemplate
            sale={options.sale}
            registerInfo={options.registerInfo}
            companyInfo={options.companyInfo}
          />
        </ThemeProvider>
      );

      // Wait a bit for rendering and then print
      setTimeout(() => {
        printWindow.print();
        // Close after printing (optional)
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    }

    return true;
  } catch (error) {
    console.error('Error printing receipt:', error);
    return false;
  }
};

// Alternative simple HTML receipt without React (for better compatibility)
export const printSimpleReceipt = (options: PrintReceiptOptions) => {
  const { sale, registerInfo, companyInfo } = options;
  const saleDate = new Date(sale.sale_date || sale.created_at);
  const isElectronicInvoice = sale.pos_type === 'electronic' && sale.customer?.document;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);

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

  const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
  const change = totalPaid - sale.total;

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket de Venta - ${sale.id}</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            line-height: 1.3; 
            background: white; 
            color: black; 
            padding: 5mm; 
            max-width: 80mm;
            margin: 0 auto;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .flex { display: flex; justify-content: space-between; margin: 2px 0; }
          .small { font-size: 10px; }
          .total-line { border-top: 2px solid #000; margin-top: 4px; padding-top: 4px; font-weight: bold; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="bold">${companyInfo?.name || 'Mi Empresa POS'}</div>
          <div class="small">NIT: ${companyInfo?.nit || '900.123.456-7'}</div>
          <div class="small">${companyInfo?.address || 'Dirección no disponible'}</div>
          <div class="small">Tel: ${companyInfo?.phone || 'Tel no disponible'}</div>
          <div class="small">${companyInfo?.email || 'Email no disponible'}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="center bold">
          ${isElectronicInvoice ? 'FACTURA ELECTRÓNICA' : 'TICKET DE VENTA'}
          ${sale.invoice_number ? `<br>No. ${sale.invoice_number}` : ''}
        </div>
        
        <div class="divider"></div>
        
        <div class="flex"><span>Fecha:</span><span>${saleDate.toLocaleDateString(
          'es-CO'
        )} ${saleDate.toLocaleTimeString('es-CO')}</span></div>
        <div class="flex"><span>PDV:</span><span>${registerInfo.pdv_name}</span></div>
        <div class="flex"><span>Cajero:</span><span>${sale.seller_name || registerInfo.user_name}</span></div>
        <div class="flex"><span>Venta:</span><span>${sale.id}</span></div>
        
        ${
          sale.customer
            ? `
          <div class="divider"></div>
          <div class="bold">CLIENTE:</div>
          <div>${sale.customer.name}</div>
          ${sale.customer.document ? `<div>${sale.customer.document_type}: ${sale.customer.document}</div>` : ''}
        `
            : ''
        }
        
        <div class="divider"></div>
        
        <div class="bold">PRODUCTOS:</div>
        ${sale.products
          .map(
            (product) => `
          <div style="margin: 4px 0;">
            <div>${product.name}</div>
            <div class="flex">
              <span>${product.quantity} x ${formatCurrency(product.price)}</span>
              <span class="bold">${formatCurrency(product.price * product.quantity)}</span>
            </div>
          </div>
        `
          )
          .join('')}
        
        <div class="divider"></div>
        
        <div class="flex"><span>Subtotal:</span><span>${formatCurrency(sale.subtotal)}</span></div>
        ${
          sale.discount_amount && sale.discount_amount > 0
            ? `<div class="flex"><span>Descuento:</span><span>-${formatCurrency(sale.discount_amount)}</span></div>`
            : ''
        }
        ${
          sale.tax_amount > 0
            ? `<div class="flex"><span>IVA:</span><span>${formatCurrency(sale.tax_amount)}</span></div>`
            : ''
        }
        
        <div class="flex total-line"><span>TOTAL:</span><span>${formatCurrency(sale.total)}</span></div>
        
        <div class="divider"></div>
        
        <div class="bold">PAGOS:</div>
        ${sale.payments
          .map(
            (payment) => `
          <div class="flex">
            <span>${getPaymentMethodName(payment.method)}:</span>
            <span>${formatCurrency(payment.amount)}</span>
          </div>
        `
          )
          .join('')}
        
        ${change > 0 ? `<div class="flex bold"><span>Cambio:</span><span>${formatCurrency(change)}</span></div>` : ''}
        
        ${
          sale.notes
            ? `
          <div class="divider"></div>
          <div class="bold">Observaciones:</div>
          <div>${sale.notes}</div>
        `
            : ''
        }
        
        <div class="divider"></div>
        
        <div class="center">
          <div class="small">¡Gracias por su compra!</div>
          <div class="small">${
            isElectronicInvoice
              ? 'Factura electrónica válida como documento tributario'
              : 'Documento no válido como factura'
          }</div>
          <div class="small">Sistema POS - ${new Date().getFullYear()}</div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 1000);
    }, 500);

    return true;
  }

  return false;
};
