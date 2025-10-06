import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Page, View, Text, Image, Document, Font, StyleSheet } from '@react-pdf/renderer';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// api
import { useGetCompanyLogoQuery } from 'src/redux/services/userProfileApi';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }]
});

// Mapeo de estados en inglés a español
const STATUS_LABELS = {
  DRAFT: 'Borrador',
  OPEN: 'Abierta',
  PAID: 'Pagada',
  VOID: 'Cancelada',
  OVERDUE: 'Vencida'
};

// Colores del diseño Figma
const COLORS = {
  primary: '#E87117', // Naranja
  gray900: '#1A1C21',
  gray600: '#5E6470',
  gray100: '#D7DAE0',
  gray0: '#F9FAFC',
  white: '#FFFFFF'
};

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        // Page - Fondo gris claro como Figma
        page: {
          padding: 16,
          fontSize: 10,
          fontFamily: 'Roboto',
          backgroundColor: '#F9FAFC'
        },

        // Header con logo y empresa
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          paddingHorizontal: 16
        },

        companyName: {
          fontSize: 18,
          fontWeight: 600,
          color: '#E87117',
          marginBottom: 2
        },

        companyInfo: {
          fontSize: 10,
          color: '#5E6470'
        },

        // Información de negocio en esquina superior derecha
        businessInfo: {
          position: 'absolute',
          top: 50,
          right: 32,
          alignItems: 'flex-end'
        },

        businessText: {
          fontSize: 10,
          color: '#5E6470',
          textAlign: 'right',
          marginBottom: 2
        },

        // Tarjeta principal con bordes redondeados
        mainCard: {
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 0.5,
          borderColor: '#D7DAE0',
          padding: 20,
          marginHorizontal: 16,
          marginBottom: 24
        },

        // Sección superior con cliente y total
        cardHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20
        },

        // Billed to
        billedToLabel: {
          fontSize: 10,
          fontWeight: 500,
          color: '#5E6470',
          marginBottom: 4
        },

        clientName: {
          fontSize: 10,
          fontWeight: 600,
          color: '#1A1C21',
          marginBottom: 2
        },

        clientInfo: {
          fontSize: 10,
          color: '#5E6470',
          marginBottom: 2
        },

        // Total destacado
        totalLabel: {
          fontSize: 10,
          fontWeight: 500,
          color: '#5E6470',
          textAlign: 'right'
        },

        totalAmount: {
          fontSize: 20,
          fontWeight: 700,
          color: '#E87117',
          textAlign: 'right'
        },

        // Línea separadora
        separator: {
          width: '100%',
          height: 0.5,
          backgroundColor: '#D7DAE0',
          marginVertical: 16
        },

        // Información de factura
        invoiceInfo: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20
        },

        infoItem: {
          marginRight: 20
        },

        infoLabel: {
          fontSize: 10,
          fontWeight: 500,
          color: '#5E6470',
          marginBottom: 4
        },

        infoValue: {
          fontSize: 10,
          fontWeight: 600,
          color: '#1A1C21'
        },

        // Tabla de items
        itemDetailLabel: {
          fontSize: 8,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: '#5E6470',
          marginBottom: 12
        },

        tableHeader: {
          flexDirection: 'row',
          marginBottom: 8
        },

        qtyLabel: {
          position: 'absolute',
          left: 275,
          width: 30,
          fontSize: 8,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: '#5E6470'
        },

        rateLabel: {
          position: 'absolute',
          left: 320,
          width: 90,
          fontSize: 8,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: '#5E6470',
          textAlign: 'right'
        },

        amountLabel: {
          position: 'absolute',
          left: 425,
          width: 106,
          fontSize: 8,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: '#5E6470',
          textAlign: 'right'
        },

        // Item row
        itemRow: {
          marginBottom: 16,
          position: 'relative'
        },

        itemName: {
          fontSize: 10,
          fontWeight: 600,
          color: '#1A1C21',
          marginBottom: 2,
          maxWidth: 260
        },

        itemDescription: {
          fontSize: 10,
          color: '#5E6470',
          maxWidth: 260
        },

        itemQty: {
          position: 'absolute',
          left: 275,
          width: 30,
          fontSize: 10,
          color: '#1A1C21'
        },

        itemRate: {
          position: 'absolute',
          left: 320,
          width: 90,
          fontSize: 10,
          color: '#1A1C21',
          textAlign: 'right'
        },

        itemAmount: {
          position: 'absolute',
          left: 425,
          width: 106,
          fontSize: 10,
          color: '#1A1C21',
          textAlign: 'right'
        },

        // Separador para totales
        totalsSeparator: {
          width: 240,
          height: 0.5,
          backgroundColor: '#D7DAE0',
          marginLeft: 'auto',
          marginVertical: 16
        },

        // Sección de totales
        totalsSection: {
          alignItems: 'flex-end',
          marginTop: 20
        },

        totalRow: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          width: 240,
          marginBottom: 8
        },

        totalRowLabel: {
          fontSize: 10,
          fontWeight: 500,
          color: '#1A1C21',
          flex: 1
        },

        totalRowValue: {
          fontSize: 10,
          fontWeight: 500,
          color: '#1A1C21',
          width: 60,
          textAlign: 'right'
        },

        finalTotal: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          width: 240,
          borderTopWidth: 0.5,
          borderTopColor: '#D7DAE0',
          paddingTop: 8,
          marginTop: 8
        },

        finalTotalLabel: {
          fontSize: 10,
          fontWeight: 700,
          color: '#1A1C21',
          flex: 1
        },

        finalTotalValue: {
          fontSize: 10,
          fontWeight: 700,
          color: '#1A1C21',
          width: 60,
          textAlign: 'right'
        },

        // Mensaje de agradecimiento
        thankYou: {
          fontSize: 10,
          fontWeight: 600,
          color: '#1A1C21',
          marginTop: 20,
          paddingLeft: 20
        },

        // Términos
        termsSection: {
          paddingHorizontal: 16,
          marginTop: 20
        },

        termsTitle: {
          fontSize: 10,
          fontWeight: 500,
          color: '#5E6470',
          marginBottom: 4
        },

        termsText: {
          fontSize: 10,
          color: '#1A1C21'
        }
      }),
    []
  );

// ----------------------------------------------------------------------

export default function InvoicePDF({ invoice, currentStatus }) {
  const styles = useStyles();
  const { company } = useAuthContext();
  const { data: logoData } = useGetCompanyLogoQuery();

  // Determinar la URL del logo a usar
  const logoUrl = logoData?.logo_url || (company as any)?.logo_url || '/logo/logoFondoTransparentesvg.svg';

  // Normalize data from API structure
  const line_items = invoice?.line_items || [];
  const subtotal = parseFloat(invoice?.subtotal || '0');
  const taxes_total = parseFloat(invoice?.taxes_total || '0');
  const total_amount = parseFloat(invoice?.total_amount || '0');
  const paid_amount = parseFloat(invoice?.paid_amount || '0');
  const balance_due = parseFloat(invoice?.balance_due || '0');

  // Traducir estado al español
  const statusInSpanish = STATUS_LABELS[currentStatus] || currentStatus || 'Borrador';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header con logo y empresa */}
        <View style={styles.header}>
          <Image source={logoUrl} style={{ width: 48, height: 48 }} />
          <View style={{ alignItems: 'flex-start', marginLeft: 16 }}>
            <Text style={styles.companyName}>{company?.name || 'Nombre Empresa'}</Text>
            <Text style={styles.companyInfo}>{company?.website || 'www.empresa.com'}</Text>
            <Text style={styles.companyInfo}>{company?.phoneNumber || '+57 300 000 0000'}</Text>
          </View>
        </View>

        {/* Información de negocio en esquina superior derecha */}
        <View style={styles.businessInfo}>
          <Text style={styles.businessText}>{company?.address || 'Dirección de la empresa'}</Text>
          <Text style={styles.businessText}>Ciudad, Estado, País</Text>
          <Text style={styles.businessText}>NIT: {company?.nit || '000000000-0'}</Text>
        </View>

        {/* Tarjeta principal */}
        <View style={styles.mainCard}>
          {/* Header con cliente y total */}
          <View style={styles.cardHeader}>
            {/* Billed to */}
            <View>
              <Text style={styles.billedToLabel}>Facturar a</Text>
              <Text style={styles.clientName}>{invoice?.customer?.name || 'Nombre del Cliente'}</Text>
              <Text style={styles.clientInfo}>
                {invoice?.customer?.billing_address?.address || 'Dirección del cliente'}
              </Text>
              <Text style={styles.clientInfo}>
                {invoice?.customer?.billing_address?.city || 'Ciudad'}
                {', '}
                {invoice?.customer?.billing_address?.country || 'País'}
                {' - '}
                {invoice?.customer?.billing_address?.postal_code || '00000'}
              </Text>
              <Text style={styles.clientInfo}>{invoice?.customer?.phone || '+57 (300) 000-0000'}</Text>
            </View>

            {/* Total destacado */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalLabel}>Factura de (COP)</Text>
              <Text style={styles.totalAmount}>{fCurrency(total_amount)}</Text>
            </View>
          </View>

          {/* Separador */}
          <View style={styles.separator} />

          {/* Información de factura */}
          <View style={styles.invoiceInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Número de factura</Text>
              <Text style={styles.infoValue}>#{invoice?.invoice_number || 'AB2324-01'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Referencia</Text>
              <Text style={styles.infoValue}>{invoice?.reference || 'INV-057'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de factura</Text>
              <Text style={styles.infoValue}>{fDate(invoice?.issue_date, 'dd MMM, yyyy')}</Text>
            </View>
          </View>

          <View style={styles.invoiceInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Asunto</Text>
              <Text style={styles.infoValue}>{invoice?.subject || 'Sistema de Diseño'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de vencimiento</Text>
              <Text style={styles.infoValue}>{fDate(invoice?.due_date, 'dd MMM, yyyy')}</Text>
            </View>
          </View>

          {/* Separador */}
          <View style={styles.separator} />

          {/* Tabla de items */}
          <View>
            <Text style={styles.itemDetailLabel}>DETALLE DE ARTÍCULOS</Text>

            {/* Headers */}
            <View style={styles.tableHeader}>
              <Text style={styles.qtyLabel}>CANT</Text>
              <Text style={styles.rateLabel}>PRECIO</Text>
              <Text style={styles.amountLabel}>MONTO</Text>
            </View>

            {/* Separador */}
            <View style={styles.separator} />

            {/* Items */}
            {line_items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name || 'Nombre del artículo'}</Text>
                <Text style={styles.itemDescription}>{item.description || 'Descripción del artículo'}</Text>
                <Text style={styles.itemQty}>{Math.round(item.quantity || 1)}</Text>
                <Text style={styles.itemRate}>{fCurrency(parseFloat(item.unit_price || '0'))}</Text>
                <Text style={styles.itemAmount}>{fCurrency(parseFloat(item.line_total || '0'))}</Text>
              </View>
            ))}

            {/* Separador para totales */}
            <View style={styles.totalsSeparator} />

            {/* Totales */}
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalRowLabel}>Subtotal</Text>
                <Text style={styles.totalRowValue}>{fCurrency(subtotal)}</Text>
              </View>

              {taxes_total > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalRowLabel}>Impuesto (10%)</Text>
                  <Text style={styles.totalRowValue}>{fCurrency(taxes_total)}</Text>
                </View>
              )}

              <View style={styles.finalTotal}>
                <Text style={styles.finalTotalLabel}>Total</Text>
                <Text style={styles.finalTotalValue}>{fCurrency(total_amount)}</Text>
              </View>
            </View>
          </View>

          {/* Mensaje de agradecimiento */}
          <Text style={styles.thankYou}>Gracias por su preferencia.</Text>
        </View>

        {/* Términos y condiciones */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Términos y Condiciones</Text>
          <Text style={styles.termsText}>Por favor pague dentro de 15 días de recibir esta factura.</Text>
        </View>
      </Page>
    </Document>
  );
}

InvoicePDF.propTypes = {
  currentStatus: PropTypes.string,
  invoice: PropTypes.object
};
