import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { fDate } from 'src/utils/format-time';
import { enqueueSnackbar } from 'notistack';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: { padding: 24, fontSize: 10 },
  title: { fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 6,
    fontWeight: 'bold'
  },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, paddingVertical: 4 },
  cell: { flex: 1, paddingRight: 6 },
  small: { flex: 0.7 },
  large: { flex: 1.3 }
});

// PDF Component
function InvoicesPDF({ rows }: { rows: any[] }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>Listado de Facturas</Text>
        <View style={pdfStyles.header}>
          <Text style={[pdfStyles.cell, pdfStyles.small]}>Número</Text>
          <Text style={[pdfStyles.cell, pdfStyles.large]}>Cliente</Text>
          <Text style={pdfStyles.cell}>Fecha</Text>
          <Text style={pdfStyles.cell}>Vencimiento</Text>
          <Text style={pdfStyles.cell}>Total</Text>
          <Text style={pdfStyles.cell}>Pagado</Text>
          <Text style={pdfStyles.cell}>Pendiente</Text>
          <Text style={[pdfStyles.cell, pdfStyles.small]}>Estado</Text>
        </View>
        {(rows || []).map((invoice) => (
          <View key={invoice.id} style={pdfStyles.row}>
            <Text style={[pdfStyles.cell, pdfStyles.small]}>{invoice.number}</Text>
            <Text style={[pdfStyles.cell, pdfStyles.large]}>{invoice.customer?.name || 'Sin cliente'}</Text>
            <Text style={pdfStyles.cell}>{fDate(invoice.issue_date, 'dd/MM/yyyy')}</Text>
            <Text style={pdfStyles.cell}>{fDate(invoice.due_date, 'dd/MM/yyyy')}</Text>
            <Text style={pdfStyles.cell}>{fCurrency(parseFloat(invoice.total_amount))}</Text>
            <Text style={pdfStyles.cell}>{fCurrency(parseFloat(invoice.paid_amount))}</Text>
            <Text style={pdfStyles.cell}>{fCurrency(parseFloat(invoice.balance_due))}</Text>
            <Text style={[pdfStyles.cell, pdfStyles.small]}>{invoice.status}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export default function InvoiceTableToolbar({
  filters,
  onFilters,
  dateError,
  serviceOptions: _serviceOptions,
  dataFiltered
}) {
  const popover = usePopover();
  const { t } = useTranslation();

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue) => {
      onFilters('startDate', newValue);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue) => {
      onFilters('endDate', newValue);
    },
    [onFilters]
  );

  // Función para exportar a Excel
  const handleExportExcel = useCallback(() => {
    try {
      const worksheetData = (dataFiltered || []).map((invoice) => ({
        Número: invoice.number,
        Cliente: invoice.customer?.name || 'Sin cliente',
        'Fecha Emisión': fDate(invoice.issue_date, 'dd/MM/yyyy'),
        Vencimiento: fDate(invoice.due_date, 'dd/MM/yyyy'),
        'Total (COP)': parseFloat(invoice.total_amount),
        'Pagado (COP)': parseFloat(invoice.paid_amount),
        'Pendiente (COP)': parseFloat(invoice.balance_due),
        Estado: invoice.status,
        'ID Cliente': invoice.customer?.id_number || '',
        Email: invoice.customer?.email || '',
        Notas: invoice.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Facturas');
      XLSX.writeFile(workbook, `facturas-${fDate(new Date(), 'yyyy-MM-dd')}.xlsx`);

      enqueueSnackbar('Facturas exportadas a Excel exitosamente', { variant: 'success' });
      popover.onClose();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      enqueueSnackbar('Error al exportar a Excel', { variant: 'error' });
    }
  }, [dataFiltered, popover]);

  // PDF download link element
  const pdfLink = useMemo(
    () => (
      <PDFDownloadLink
        document={<InvoicesPDF rows={dataFiltered || []} />}
        fileName={`facturas-${fDate(new Date(), 'yyyy-MM-dd')}.pdf`}
        style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
      >
        <MenuItem onClick={popover.onClose}>
          <Iconify icon="solar:document-bold" /> PDF
        </MenuItem>
      </PDFDownloadLink>
    ),
    [dataFiltered, popover]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row'
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 }
        }}
      >
        {/* <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 180 }
          }}
        >
          <InputLabel>Service</InputLabel>

          <Select
            multiple
            value={filters.service}
            onChange={handleFilterService}
            input={<OutlinedInput label="Service" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            sx={{ textTransform: 'capitalize' }}
          >
            {serviceOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.service.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}

        <DatePicker
          label={t('Start date')}
          value={filters.startDate}
          onChange={handleFilterStartDate}
          slotProps={{ textField: { fullWidth: true } }}
          sx={{
            maxWidth: { md: 180 }
          }}
        />

        <DatePicker
          label={t('End date')}
          value={filters.endDate}
          onChange={handleFilterEndDate}
          slotProps={{
            textField: {
              fullWidth: true,
              error: dateError
            }
          }}
          sx={{
            maxWidth: { md: 180 }
          }}
        />

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder={t('Search customer or invoice number...')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 160 }}>
        {pdfLink}

        <MenuItem onClick={handleExportExcel}>
          <Iconify icon="solar:export-bold" />
          Excel
        </MenuItem>
      </CustomPopover>
    </>
  );
}

InvoiceTableToolbar.propTypes = {
  dateError: PropTypes.bool,
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  serviceOptions: PropTypes.array,
  dataFiltered: PropTypes.array
};
