import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// sections
import ExpenseDebitNoteNewForm from 'src/sections/expenses/expense-debit-note-new-form';

// ----------------------------------------------------------------------

export default function ExpenseDebitNoteNewPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Nueva Nota Débito | Gastos</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Nueva Nota Débito"
          subHeading="Crea una nota débito para reducir el saldo de una factura de compra por devoluciones, ajustes de precio o correcciones."
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Gastos', href: paths.dashboard.bill.root },
            { name: 'Notas Débito', href: paths.dashboard.expenses.debitNotes.root },
            { name: 'Nueva' }
          ]}
          icon="solar:document-add-bold"
          sx={{
            mb: { xs: 3, md: 5 }
          }}
        />

        <ExpenseDebitNoteNewForm />
      </Container>
    </>
  );
}
