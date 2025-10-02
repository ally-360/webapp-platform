import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Page, View, Text, Document, Font, StyleSheet } from '@react-pdf/renderer';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }]
});

const STATUS_LABELS = {
  draft: 'Borrador',
  open: 'Abierta',
  paid: 'Pagada',
  partial: 'Parcial',
  void: 'Anulada'
};

const COLORS = {
  primary: '#E87117',
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

        // Sección superior con proveedor y total
        cardHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20
        },

        // Información del proveedor
        supplierSection: {
          maxWidth: 240
        },

        sectionTitle: {
          fontSize: 11,
          fontWeight: 700,
          color: '#1A1C21',
          marginBottom: 8
        },

        infoText: {
          fontSize: 10,
          color: '#5E6470',
          marginBottom: 3
        },

        // Resumen de total en naranja
        totalCard: {
          backgroundColor: '#FFF4ED',
          borderRadius: 8,
          padding: 12,
          minWidth: 160,
          alignItems: 'flex-end'
        },

        statusBadge: {
          backgroundColor: '#E87117',
          borderRadius: 12,
          paddingVertical: 4,
          paddingHorizontal: 12,
          marginBottom: 8
        },

        statusText: {
          fontSize: 9,
          color: '#FFFFFF',
          fontWeight: 600
        },

        totalLabel: {
          fontSize: 9,
          color: '#5E6470',
          marginBottom: 4
        },

        totalAmount: {
          fontSize: 20,
          fontWeight: 700,
          color: '#E87117'
        },

        // Sección de fechas e información de factura
        infoRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#D7DAE0'
        },

        infoBox: {
          flex: 1
        },

        infoLabel: {
          fontSize: 9,
          color: '#5E6470',
          marginBottom: 4
        },

        infoValue: {
          fontSize: 10,
          color: '#1A1C21',
          fontWeight: 600
        },

        // Tabla de productos
        table: {
          marginTop: 16
        },

        tableHeader: {
          flexDirection: 'row',
          backgroundColor: '#F9FAFC',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 12,
          marginBottom: 8
        },

        tableHeaderCell: {
          fontSize: 9,
          fontWeight: 700,
          color: '#5E6470',
          textTransform: 'uppercase'
        },

        tableRow: {
          flexDirection: 'row',
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#F1F3F5'
        },

        tableCell: {
          fontSize: 10,
          color: '#1A1C21'
        },

        // Columnas de la tabla con posiciones absolutas
        colProduct: {
          position: 'absolute',
          left: 12,
          maxWidth: 240
        },

        colQty: {
          position: 'absolute',
          left: 275,
          width: 60,
          textAlign: 'right'
        },

        colPrice: {
          position: 'absolute',
          left: 350,
          width: 80,
          textAlign: 'right'
        },

        colTotal: {
          position: 'absolute',
          left: 450,
          width: 90,
          textAlign: 'right'
        },

        // Sección de totales al final
        totalsSection: {
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 2,
          borderTopColor: '#D7DAE0'
        },

        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 6,
          paddingHorizontal: 12
        },

        totalRowLabel: {
          fontSize: 10,
          color: '#5E6470',
          textAlign: 'right',
          flex: 1
        },

        totalRowValue: {
          fontSize: 10,
          color: '#1A1C21',
          fontWeight: 600,
          width: 100,
          textAlign: 'right'
        },

        grandTotalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: '#FFF4ED',
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 12,
          marginTop: 8
        },

        grandTotalLabel: {
          fontSize: 12,
          fontWeight: 700,
          color: '#1A1C21',
          textAlign: 'right',
          flex: 1
        },

        grandTotalValue: {
          fontSize: 16,
          fontWeight: 700,
          color: '#E87117',
          width: 100,
          textAlign: 'right'
        },

        // Notas al final
        notesSection: {
          backgroundColor: '#F9FAFC',
          borderRadius: 8,
          padding: 12,
          marginTop: 16
        },

        notesTitle: {
          fontSize: 10,
          fontWeight: 700,
          color: '#1A1C21',
          marginBottom: 6
        },

        notesText: {
          fontSize: 9,
          color: '#5E6470',
          lineHeight: 1.4
        },

        // Footer
        footer: {
          position: 'absolute',
          bottom: 24,
          left: 32,
          right: 32,
          textAlign: 'center',
          fontSize: 8,
          color: '#5E6470',
          borderTopWidth: 1,
          borderTopColor: '#D7DAE0',
          paddingTop: 12
        }
      }),
    []
  );

// ----------------------------------------------------------------------

export default function BillPDF({ bill, currentStatus }) {
  const styles = useStyles();
  const { user } = useAuthContext();

  const statusLabel = STATUS_LABELS[currentStatus?.toLowerCase()] || currentStatus;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Factura de Compra</Text>
            <Text style={styles.companyInfo}>Número: {bill?.number || 'N/A'}</Text>
          </View>
        </View>

        {/* Business Info - Top Right */}
        <View style={styles.businessInfo}>
          <Text style={styles.businessText}>{user?.company?.name || 'Mi Empresa'}</Text>
          <Text style={styles.businessText}>{user?.company?.document_number || ''}</Text>
          <Text style={styles.businessText}>{user?.company?.email || ''}</Text>
          <Text style={styles.businessText}>{user?.company?.phone || ''}</Text>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Header Card: Proveedor y Total */}
          <View style={styles.cardHeader}>
            {/* Supplier Info */}
            <View style={styles.supplierSection}>
              <Text style={styles.sectionTitle}>Proveedor</Text>
              <Text style={styles.infoText}>{bill?.supplier?.name || 'Proveedor no especificado'}</Text>
              {bill?.supplier?.document_number && (
                <Text style={styles.infoText}>NIT: {bill.supplier.document_number}</Text>
              )}
              {bill?.supplier?.email && <Text style={styles.infoText}>{bill.supplier.email}</Text>}
              {bill?.supplier?.phone && <Text style={styles.infoText}>Tel: {bill.supplier.phone}</Text>}
            </View>

            {/* Total Summary */}
            <View style={styles.totalCard}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{fCurrency(parseFloat(bill?.total_amount || '0'))}</Text>
            </View>
          </View>

          {/* Info Row: Dates and PDV */}
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Fecha de Emisión</Text>
              <Text style={styles.infoValue}>{fDate(bill?.issue_date, 'dd/MM/yyyy')}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Fecha de Vencimiento</Text>
              <Text style={styles.infoValue}>{fDate(bill?.due_date, 'dd/MM/yyyy')}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Punto de Venta</Text>
              <Text style={styles.infoValue}>{bill?.pdv?.name || 'N/A'}</Text>
            </View>
          </View>

          {/* Products Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colProduct]}>Producto</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Cant.</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Precio Unit.</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>

            {/* Table Rows */}
            {bill?.line_items?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colProduct]} numberOfLines={2}>
                  {item.product?.name || `Producto ${index + 1}`}
                  {item.product?.sku && (
                    <Text style={{ fontSize: 8, color: '#5E6470' }}>
                      {'\n'}
                      SKU: {item.product.sku}
                    </Text>
                  )}
                </Text>
                <Text style={[styles.tableCell, styles.colQty]}>{Math.round(item.quantity)}</Text>
                <Text style={[styles.tableCell, styles.colPrice]}>{fCurrency(parseFloat(item.unit_price || '0'))}</Text>
                <Text style={[styles.tableCell, styles.colTotal]}>{fCurrency(parseFloat(item.line_total || '0'))}</Text>
              </View>
            ))}
          </View>

          {/* Totals Section */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Subtotal</Text>
              <Text style={styles.totalRowValue}>{fCurrency(parseFloat(bill?.subtotal || '0'))}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Impuestos</Text>
              <Text style={styles.totalRowValue}>{fCurrency(parseFloat(bill?.taxes_total || '0'))}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Pagado</Text>
              <Text style={styles.totalRowValue}>{fCurrency(parseFloat(bill?.paid_amount || '0'))}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Saldo Pendiente</Text>
              <Text style={styles.totalRowValue}>{fCurrency(parseFloat(bill?.balance_due || '0'))}</Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{fCurrency(parseFloat(bill?.total_amount || '0'))}</Text>
            </View>
          </View>

          {/* Notes */}
          {bill?.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>Notas</Text>
              <Text style={styles.notesText}>{bill.notes}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generado el {fDate(new Date(), 'dd/MM/yyyy HH:mm')} - {user?.company?.name || 'Mi Empresa'}
        </Text>
      </Page>
    </Document>
  );
}

BillPDF.propTypes = {
  bill: PropTypes.object,
  currentStatus: PropTypes.string
};
