import sumBy from 'lodash/sumBy';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import {
  Tab,
  Tabs,
  Card,
  Table,
  Stack,
  Button,
  Divider,
  Tooltip,
  Container,
  TableBody,
  IconButton,
  TableContainer,
  useMediaQuery,
  Box,
  CircularProgress,
  Skeleton,
  Typography
} from '@mui/material';
// redux
import { useSelector } from 'react-redux';
import { selectCurrentUser } from 'src/redux/slices/authSlice';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import * as XLSX from 'xlsx';
import { fDate } from 'src/utils/format-time';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
import {
  useTable,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table';
//
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
// Redux
import {
  useGetSalesInvoicesQuery,
  useCancelSalesInvoiceMutation,
  useGetMonthlyStatusReportQuery
} from 'src/redux/services/salesInvoicesApi';
//
import InvoiceAnalytic from '../invoice-analytic';
import InvoiceTableRow from '../invoice-table-row';
import InvoiceTableToolbar from '../invoice-table-toolbar';
import InvoiceTableFiltersResult from '../invoice-table-filters-result';
import InvoicePDF from '../invoice-pdf';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'number', label: 'Número' },
  { id: 'customer', label: 'Cliente' },
  { id: 'issue_date', label: 'Fecha emisión' },
  { id: 'due_date', label: 'Vencimiento' },
  { id: 'total_amount', label: 'Total' },
  { id: 'paid_amount', label: 'Pagado' },
  { id: 'balance_due', label: 'Por pagar' },
  { id: 'status', label: 'Estado' },
  { id: '' }
];

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
  startDate: null as Date | null,
  endDate: null as Date | null
};

// ----------------------------------------------------------------------

export default function InvoiceListView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'issue_date' });
  const confirm = useBoolean(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();

  // Redux selectors
  const user = useSelector(selectCurrentUser);

  const [filters, setFilters] = useState(defaultFilters);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Calcular dateError
  const dateError =
    filters.startDate && filters.endDate ? filters.startDate.getTime() > filters.endDate.getTime() : false;

  // Debounce para búsqueda - solo buscar si tiene al menos 2 caracteres
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.name.length >= 2 || filters.name.length === 0) {
        setDebouncedSearch(filters.name);
      }
    }, 500); // 500ms de debounce

    return () => clearTimeout(timer);
  }, [filters.name]);

  // ========================================
  // 🔥 RTK QUERY - INVOICES & STATISTICS
  // ========================================

  // RTK Query hooks para obtener facturas
  const { data: invoicesData, isLoading } = useGetSalesInvoicesQuery(
    {
      page: table.page + 1, // RTK Query usa paginación desde 1
      limit: table.rowsPerPage,
      status: filters.status === 'all' ? undefined : filters.status,
      start_date: filters.startDate?.toISOString().split('T')[0],
      end_date: filters.endDate?.toISOString().split('T')[0],
      search: debouncedSearch || undefined // Usar búsqueda con debounce
    },
    {
      skip: !user || (debouncedSearch.length > 0 && debouncedSearch.length < 2) // Solo hacer request si hay usuario y búsqueda válida
    }
  );

  // RTK Query hook para obtener estadísticas mensuales
  const {
    data: monthlyStats,
    isLoading: monthlyStatsLoading,
    error: _monthlyStatsError
  } = useGetMonthlyStatusReportQuery(
    {}, // Usa mes y año actual por defecto
    {
      skip: !user
    }
  );

  const [cancelSalesInvoice] = useCancelSalesInvoiceMutation();

  // ========================================
  // 📊 DATOS PROCESADOS
  // ========================================

  // Data processing - Extraer datos de la respuesta paginada del servidor
  const tableData = useMemo(() => invoicesData?.invoices || [], [invoicesData]);
  const totalCount = invoicesData?.total || 0;

  // ========================================
  // 📊 CONSTANTES Y CONFIGURACIÓN
  // ========================================

  const MONTH_NAMES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  // ========================================
  // 📊 ESTADÍSTICAS DESDE API
  // ========================================

  // Optimizar función para obtener conteos desde API
  const getInvoiceCountFromAPI = useCallback(
    (status: string) => {
      const countsByStatus = invoicesData?.counts_by_status;
      if (!countsByStatus) return 0;

      if (status === 'total' || status === 'all') {
        return countsByStatus.reduce((sum, item) => sum + item.count, 0);
      }

      const statusData = countsByStatus.find((item) => item.status === status);
      return statusData?.count || 0;
    },
    [invoicesData?.counts_by_status]
  );

  // Función optimizada para obtener datos de estadísticas
  const getInvoiceLength = useCallback(
    (status: string) => {
      // Priorizar counts_by_status del response actual para tabs
      const apiCount = getInvoiceCountFromAPI(status);
      if (apiCount !== null && apiCount !== undefined) {
        return apiCount;
      }

      // Fallback a estadísticas mensuales si está disponible
      if (monthlyStats) {
        const statusMap = {
          OPEN: monthlyStats.open.count,
          PAID: monthlyStats.paid.count,
          VOID: monthlyStats.void.count,
          DRAFT: 0,
          default: monthlyStats.total.count
        };
        return statusMap[status] || statusMap.default;
      }

      // Fallback final a datos locales
      return tableData.filter((item) => item.status === status).length;
    },
    [getInvoiceCountFromAPI, monthlyStats, tableData]
  );

  // Función optimizada para obtener porcentajes
  const getPercentByStatus = useCallback(
    (status: string) => {
      const total = getInvoiceLength('total');
      const statusCount = getInvoiceLength(status);
      return total > 0 ? (statusCount / total) * 100 : 0;
    },
    [getInvoiceLength]
  );

  // ========================================
  // 📅 NAVEGACIÓN DE MESES
  // ========================================

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Funciones para navegación de meses con restricción de fechas futuras
  const handlePreviousMonth = useCallback(() => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }, [selectedMonth, selectedYear]);

  const handleNextMonth = useCallback(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let nextMonth = selectedMonth + 1;
    let nextYear = selectedYear;

    if (selectedMonth === 12) {
      nextMonth = 1;
      nextYear = selectedYear + 1;
    }

    // No permitir navegar a meses futuros
    if (nextYear > currentYear || (nextYear === currentYear && nextMonth > currentMonth)) {
      return;
    }

    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
  }, [selectedMonth, selectedYear]);

  // Verificar si el botón "siguiente" debe estar deshabilitado
  const isNextMonthDisabled = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let nextMonth = selectedMonth + 1;
    let nextYear = selectedYear;

    if (selectedMonth === 12) {
      nextMonth = 1;
      nextYear = selectedYear + 1;
    }

    return nextYear > currentYear || (nextYear === currentYear && nextMonth > currentMonth);
  }, [selectedMonth, selectedYear]);

  // Actualizar query de estadísticas mensuales cuando cambie mes/año
  const { data: monthlyStatsForPeriod } = useGetMonthlyStatusReportQuery(
    {
      year: selectedYear,
      month: selectedMonth
    },
    {
      skip: !user
    }
  );

  // Usar la constante MONTH_NAMES definida arriba
  const currentMonthName = selectedMonth ? MONTH_NAMES[selectedMonth - 1] : '';

  const currentMonthlyStats = monthlyStatsForPeriod || monthlyStats;

  // Función optimizada para obtener datos del período seleccionado
  const getPeriodData = useCallback(
    (status: string) => {
      if (currentMonthlyStats) {
        const statusMap = {
          OPEN: {
            count: currentMonthlyStats.open.count,
            percentaje: 0,
            amount: parseFloat(currentMonthlyStats.open.recaudado)
          },
          PAID: {
            count: currentMonthlyStats.paid.count,
            percentaje: 0,
            amount: parseFloat(currentMonthlyStats.paid.recaudado)
          },
          VOID: {
            count: currentMonthlyStats.void.count,
            percentaje: 0,
            amount: parseFloat(currentMonthlyStats.void.recaudado)
          },
          DRAFT: { count: 0, percentaje: 0, amount: 0 },
          default: {
            count: currentMonthlyStats.total.count,
            percentaje: 100,
            amount: parseFloat(currentMonthlyStats.total.recaudado)
          }
        };

        return statusMap[status] || statusMap.default;
      }

      // Fallback a datos locales
      const filteredData = tableData.filter((item) => item.status === status);
      return {
        count: filteredData.length,
        percentaje: 0,
        amount: sumBy(filteredData, (item) => parseFloat(item.total_amount))
      };
    },
    [currentMonthlyStats, tableData]
  );

  // ========================================
  // 📊 DATOS OPTIMIZADOS CON MEMOIZACIÓN
  // ========================================

  // Memoizar datos procesados para evitar recálculos
  const processedData = useMemo(() => {
    const data = tableData;
    const total = totalCount;
    const filtered = data; // Ya no necesitamos filtros del lado cliente
    const inPage = filtered;

    const resetConditions = {
      name: !!filters.name,
      service: !!filters.service.length,
      status: filters.status !== 'all',
      dates: !!(filters.startDate && filters.endDate)
    };

    const canReset = Object.values(resetConditions).some(Boolean);
    const notFound = (!filtered.length && canReset) || !filtered.length;

    return {
      tableData: data,
      totalCount: total,
      dataFiltered: filtered,
      dataInPage: inPage,
      canReset,
      notFound
    };
  }, [tableData, totalCount, filters]);

  // Obtener información del mes seleccionado para mostrar en el título
  const selectedMonthName = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth - 1);
    return selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }, [selectedYear, selectedMonth]);

  // Destructuring de datos procesados para uso en el componente
  const {
    tableData: _tableDataProcessed,
    totalCount: _totalCountProcessed,
    dataFiltered,
    dataInPage,
    canReset,
    notFound
  } = processedData;

  // Altura de las filas según densidad
  const denseHeight = table.dense ? 56 : 76;
  const TABS = useMemo(
    () => [
      { value: 'all', label: 'Todas', color: 'default' as const, count: getInvoiceLength('total') },
      { value: 'OPEN', label: 'Abiertas', color: 'info' as const, count: getInvoiceLength('OPEN') },
      { value: 'PAID', label: 'Pagadas', color: 'success' as const, count: getInvoiceLength('PAID') },
      { value: 'VOID', label: 'Canceladas', color: 'error' as const, count: getInvoiceLength('VOID') },
      { value: 'DRAFT', label: 'Borrador', color: 'warning' as const, count: getInvoiceLength('DRAFT') }
    ],
    [getInvoiceLength]
  );

  // ========================================
  // 🔧 HANDLERS OPTIMIZADOS
  // ========================================

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await cancelSalesInvoice({ id, reason: 'Cancelada desde el listado' }).unwrap();
        enqueueSnackbar('Factura cancelada correctamente', { variant: 'success' });
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error('Error canceling invoice:', error);
        enqueueSnackbar('Error al cancelar la factura', { variant: 'error' });
      }
    },
    [cancelSalesInvoice, table, dataInPage]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const cancelPromises = table.selected.map((id) =>
        cancelSalesInvoice({ id, reason: 'Cancelada desde el listado (múltiple)' }).unwrap()
      );
      await Promise.all(cancelPromises);
      enqueueSnackbar('Facturas canceladas correctamente', { variant: 'success' });
      table.onUpdatePageDeleteRows({
        totalRows: totalCount,
        totalRowsInPage: tableData.length,
        totalRowsFiltered: totalCount
      });
    } catch (error) {
      console.error('Error canceling invoices:', error);
      enqueueSnackbar('Error al cancelar las facturas', { variant: 'error' });
    }
  }, [cancelSalesInvoice, table, totalCount, tableData.length]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.sales.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.sales.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Función para exportar a Excel
  const handleExportExcel = useCallback(() => {
    try {
      const selectedInvoices =
        table.selected.length > 0 ? tableData.filter((invoice) => table.selected.includes(invoice.id)) : tableData;

      const worksheetData = selectedInvoices.map((invoice: any) => ({
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

      enqueueSnackbar(`${selectedInvoices.length} factura(s) exportada(s) a Excel`, { variant: 'success' });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      enqueueSnackbar('Error al exportar a Excel', { variant: 'error' });
    }
  }, [table.selected, tableData]);

  // Función para descargar PDFs seleccionados
  const handleDownloadPDFs = useCallback(async () => {
    setIsProcessing(true);
    try {
      const selectedInvoices =
        table.selected.length > 0 ? tableData.filter((invoice) => table.selected.includes(invoice.id)) : tableData;

      if (selectedInvoices.length === 0) {
        enqueueSnackbar('No hay facturas seleccionadas', { variant: 'warning' });
        return;
      }

      // Si solo hay una factura, descargar directamente
      if (selectedInvoices.length === 1) {
        const invoice = selectedInvoices[0];
        const blob = await pdf(<InvoicePDF invoice={invoice} currentStatus={invoice.status} />).toBlob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factura-${invoice.number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Para múltiples facturas, usar Promise.all para generar todos los PDFs
        const pdfPromises = selectedInvoices.map(async (invoice, index) => {
          const blob = await pdf(<InvoicePDF invoice={invoice} currentStatus={invoice.status} />).toBlob();
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `factura-${invoice.number}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              resolve();
            }, index * 500); // Delay escalonado para cada descarga
          });
        });

        await Promise.all(pdfPromises);
      }

      enqueueSnackbar(`${selectedInvoices.length} PDF(s) descargado(s)`, { variant: 'success' });
    } catch (error) {
      console.error('Error downloading PDFs:', error);
      enqueueSnackbar('Error al descargar los PDFs', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [table.selected, tableData]);

  // Función para enviar emails masivos
  const handleSendEmails = useCallback(async () => {
    setIsProcessing(true);
    try {
      const selectedInvoices =
        table.selected.length > 0 ? tableData.filter((invoice) => table.selected.includes(invoice.id)) : [];

      if (selectedInvoices.length === 0) {
        enqueueSnackbar('No hay facturas seleccionadas', { variant: 'warning' });
        setIsProcessing(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      const companyId = localStorage.getItem('companyId');

      // Usar reduce para mantener un contador mutable
      const results = await Promise.all(
        selectedInvoices.map(async (invoice) => {
          try {
            // Primero obtener los detalles completos de la factura
            const detailResponse = await fetch(`${(import.meta as any).env.VITE_HOST_API}/invoices/${invoice.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'X-Company-ID': companyId || ''
              }
            });

            if (!detailResponse.ok) {
              return { success: false };
            }

            const fullInvoice = await detailResponse.json();

            if (!fullInvoice.customer?.email) {
              return { success: false };
            }

            const pdfBlob = await pdf(<InvoicePDF invoice={fullInvoice} currentStatus={fullInvoice.status} />).toBlob();

            const formData = new FormData();
            formData.append('to_email', fullInvoice.customer.email);
            formData.append('subject', `Factura ${fullInvoice.number}`);
            formData.append('message', 'Estimado cliente, adjunto encontrará su factura. Gracias por su preferencia.');
            formData.append('pdf_file', pdfBlob, `factura-${fullInvoice.number}.pdf`);

            const response = await fetch(
              `${(import.meta as any).env.VITE_HOST_API}/invoices/${invoice.id}/send-email`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'X-Company-ID': companyId || ''
                },
                body: formData
              }
            );

            return { success: response.ok };
          } catch (error) {
            console.error(`Error sending email for invoice ${invoice.number}:`, error);
            return { success: false };
          }
        })
      );

      const successCount = results.filter((r) => r.success).length;
      const errorCount = results.filter((r) => !r.success).length;

      if (successCount > 0) {
        enqueueSnackbar(`${successCount} email(s) enviado(s) exitosamente`, { variant: 'success' });
      }
      if (errorCount > 0) {
        enqueueSnackbar(`${errorCount} email(s) fallaron`, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      enqueueSnackbar('Error al enviar los emails', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [table.selected, tableData]);

  // Función para imprimir (abre todas en nuevas ventanas)
  const handlePrintInvoices = useCallback(async () => {
    setIsProcessing(true);
    try {
      const selectedInvoices =
        table.selected.length > 0 ? tableData.filter((invoice) => table.selected.includes(invoice.id)) : tableData;

      if (selectedInvoices.length === 0) {
        enqueueSnackbar('No hay facturas seleccionadas', { variant: 'warning' });
        setIsProcessing(false);
        return;
      }

      // Generar todos los PDFs primero
      const pdfPromises = selectedInvoices.map(async (invoice, index) => {
        const blob = await pdf(<InvoicePDF invoice={invoice} currentStatus={invoice.status} />).toBlob();
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            const url = window.URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');
            if (printWindow) {
              printWindow.onload = () => {
                printWindow.print();
              };
            }
            resolve();
          }, index * 500); // Delay escalonado
        });
      });

      await Promise.all(pdfPromises);

      enqueueSnackbar(`${selectedInvoices.length} factura(s) abiertas para impresión`, { variant: 'info' });
    } catch (error) {
      console.error('Error printing invoices:', error);
      enqueueSnackbar('Error al preparar la impresión', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [table.selected, tableData]);

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('Facturas de venta')}
          subHeading={`Estadísticas del mes actual: ${selectedMonthName}`}
          icon="solar:bill-list-bold-duotone"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root
            },
            {
              name: 'Facturas de venta',
              href: paths.dashboard.sales.root
            },
            {
              name: 'Lista'
            }
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.sales.newSale}
              sx={isMobile ? { width: '100%' } : undefined}
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('Nueva factura')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 }
          }}
        />

        <Card
          sx={{
            mb: { xs: 3, md: 5 }
          }}
        >
          <Box sx={{ overflow: 'auto' }}>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              {monthlyStatsLoading ? (
                // Mostrar esqueletos de carga mientras se obtienen las estadísticas
                Array.from({ length: 4 }).map((_, index) => (
                  <Box key={index} sx={{ flex: 1, p: 2 }}>
                    <Stack spacing={1}>
                      <Skeleton variant="text" height={24} />
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" height={20} />
                    </Stack>
                  </Box>
                ))
              ) : (
                <Stack
                  direction="column"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1, flex: 1, px: 2 }}
                >
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {currentMonthName} {selectedYear}
                  </Typography>
                  <Stack direction="row" alignItems="center" sx={{ mb: 1, flex: 1, width: '100%', gap: 2, mt: 1 }}>
                    <IconButton
                      size="small"
                      onClick={handlePreviousMonth}
                      sx={{
                        width: 28,
                        height: 28,
                        border: 1,
                        borderColor: 'divider',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <Iconify icon="eva:arrow-left-fill" width={16} />
                    </IconButton>
                    <InvoiceAnalytic
                      title="Total"
                      total={getPeriodData('total').count}
                      percent={100}
                      price={getPeriodData('total').amount}
                      icon="solar:bill-list-bold-duotone"
                      color={theme.palette.info.main}
                      onPreviousMonth={handlePreviousMonth}
                      onNextMonth={handleNextMonth}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                    />

                    <InvoiceAnalytic
                      title="Abiertas"
                      total={getPeriodData('OPEN').count}
                      percent={getPercentByStatus('OPEN')}
                      price={getPeriodData('OPEN').amount}
                      icon="solar:file-check-bold-duotone"
                      color={theme.palette.info.main}
                    />

                    <InvoiceAnalytic
                      title="Pagadas"
                      total={getPeriodData('PAID').count}
                      percent={getPercentByStatus('PAID')}
                      price={getPeriodData('PAID').amount}
                      icon="solar:sort-by-time-bold-duotone"
                      color={theme.palette.success.main}
                    />

                    <InvoiceAnalytic
                      title="Canceladas"
                      total={getPeriodData('VOID').count}
                      percent={getPeriodData('VOID').percentaje}
                      price={getPeriodData('VOID').amount}
                      icon="solar:bell-bing-bold-duotone"
                      color={theme.palette.error.main}
                    />

                    <IconButton
                      size="small"
                      onClick={handleNextMonth}
                      disabled={isNextMonthDisabled}
                      sx={{
                        width: 28,
                        height: 28,
                        border: 1,
                        borderColor: 'divider',
                        opacity: isNextMonthDisabled ? 0.5 : 1,
                        '&:hover': {
                          backgroundColor: isNextMonthDisabled ? 'transparent' : 'action.hover'
                        },
                        '&.Mui-disabled': {
                          borderColor: 'divider',
                          color: 'text.disabled'
                        }
                      }}
                    >
                      <Iconify icon="eva:arrow-right-fill" width={16} />
                    </IconButton>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Box>
        </Card>

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'}
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <InvoiceTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
            serviceOptions={[]}
            dataFiltered={dataFiltered}
          />

          {canReset && (
            <InvoiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Enviar por Email">
                    <IconButton color="primary" onClick={handleSendEmails} disabled={isProcessing}>
                      {isProcessing ? <CircularProgress size={20} /> : <Iconify icon="iconamoon:send-fill" />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Descargar PDFs">
                    <IconButton color="primary" onClick={handleDownloadPDFs} disabled={isProcessing}>
                      {isProcessing ? <CircularProgress size={20} /> : <Iconify icon="eva:download-outline" />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Imprimir">
                    <IconButton color="primary" onClick={handlePrintInvoices} disabled={isProcessing}>
                      {isProcessing ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Iconify icon="solar:printer-minimalistic-bold" />
                      )}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Exportar a Excel">
                    <IconButton color="success" onClick={handleExportExcel}>
                      <Iconify icon="solar:export-bold" />
                    </IconButton>
                  </Tooltip>

                  <Divider orientation="vertical" flexItem />

                  <Tooltip title="Cancelar">
                    <IconButton color="error" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Box sx={{ overflow: 'auto' }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {isLoading &&
                    Array.from({ length: table.rowsPerPage }, (_, index) => (
                      <InvoiceTableRow
                        key={index}
                        row={null}
                        selected={false}
                        onSelectRow={() => null}
                        onViewRow={() => null}
                        onEditRow={() => null}
                        onDeleteRow={() => null}
                      />
                    ))}

                  {!isLoading &&
                    dataInPage.map((row) => (
                      <InvoiceTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows height={denseHeight} emptyRows={Math.max(0, table.rowsPerPage - dataInPage.length)} />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Box>
          </TableContainer>

          <TablePaginationCustom
            count={totalCount}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Cancelar Facturas"
        content={
          <>
            ¿Está seguro de que desea cancelar <strong>{table.selected.length}</strong>{' '}
            {table.selected.length === 1 ? 'factura' : 'facturas'}?
            <br />
            <br />
            Las facturas canceladas no se pueden revertir y cambiarán su estado a CANCELLED.
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Cancelar Facturas
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

// Interface comentada - ya no se usa
/*
interface FilterProps {
  inputData: SalesInvoice[];
  comparator: (a: any, b: any) => number;
  filters: IInvoiceTableFilters;
  dateError: boolean;
}
*/

// Función de filtrado comentada - ya no se usa porque los filtros se manejan en el servidor
/*
function applyFilter({ inputData, comparator, filters, dateError }: FilterProps) {
  const { name, status, service, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.number.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        (invoice.customer?.name && invoice.customer.name.toLowerCase().indexOf(name.toLowerCase()) !== -1)
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  if (service.length) {
    // For now, we'll skip service filtering since the API structure is different
    // inputData = inputData.filter((invoice) => invoice.line_items?.some((item) => service.includes(item.name)));
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter(
      (invoice) => new Date(invoice.issue_date) >= startDate && new Date(invoice.issue_date) <= endDate
    );
  }

  return inputData;
}
*/
