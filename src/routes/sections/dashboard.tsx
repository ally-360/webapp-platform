import React, { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';
import StepGuard from 'src/auth/guard/step-guard';

// ----------------------------------------------------------------------

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
// PRODUCT
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));

// PDVS
const PDVSListPage = lazy(() => import('src/pages/dashboard/pdvs/list'));

// CATEGORIES

const CategoriesListView = lazy(() => import('src/pages/dashboard/categories/list'));

// BRANDS

const BrandsListView = lazy(() => import('src/pages/dashboard/brands/list'));

// INVENTORY MOVEMENTS
const InventoryMovementsPage = lazy(() => import('src/pages/dashboard/inventory/movements'));

// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));

// Sales

const SalesInvoiceListPage = lazy(() => import('src/pages/dashboard/sales/invoice/list'));
const SalesInvoiceCreatePage = lazy(() => import('src/pages/dashboard/sales/invoice/new'));
const SalesInvoiceEditPage = lazy(() => import('src/pages/dashboard/sales/invoice/edit'));
const SalesInvoiceDetailsPage = lazy(() => import('src/pages/dashboard/sales/invoice/details'));

// QUOTES
const QuotesListPage = lazy(() => import('src/pages/dashboard/sales/quotes/list'));
const QuotesNewPage = lazy(() => import('src/pages/dashboard/sales/quotes/new'));
const QuotesEditPage = lazy(() => import('src/pages/dashboard/sales/quotes/edit'));
const QuotesDetailsPage = lazy(() => import('src/pages/dashboard/sales/quotes/details'));

// BILL

const BillInvoiceListPage = lazy(() => import('src/pages/dashboard/bill/invoice/list'));
const BillInvoiceCreatePage = lazy(() => import('src/pages/dashboard/bill/invoice/new'));
const BillInvoiceEditPage = lazy(() => import('src/pages/dashboard/bill/invoice/edit'));
const BillInvoiceDetailsPage = lazy(() => import('src/pages/dashboard/bill/invoice/details'));

// PAYMENTS RECEIVED
const PaymentReceivedListPage = lazy(() => import('src/pages/dashboard/payments-received/list'));
const PaymentReceivedNewPage = lazy(() => import('src/pages/dashboard/payments-received/new'));
const PaymentReceivedEditPage = lazy(() => import('src/pages/dashboard/payments-received/edit'));
const PaymentReceivedDetailsPage = lazy(() => import('src/pages/dashboard/payments-received/details'));

// DEBIT NOTES
const DebitNoteListPage = lazy(() => import('src/pages/dashboard/debit-notes/list'));
const DebitNoteNewPage = lazy(() => import('src/pages/dashboard/debit-notes/new'));
const DebitNoteEditPage = lazy(() => import('src/pages/dashboard/debit-notes/edit'));
const DebitNoteDetailsPage = lazy(() => import('src/pages/dashboard/debit-notes/details'));

// EXPENSES
const ExpenseDebitNotesPage = lazy(() => import('src/pages/dashboard/expenses/debit-notes'));
const ExpenseDebitNoteNewPage = lazy(() => import('src/pages/dashboard/expenses/debit-notes-new'));
const PurchaseOrdersPage = lazy(() => import('src/pages/dashboard/expenses/purchase-orders'));
const PurchaseOrderNewPage = lazy(() => import('src/pages/dashboard/expenses/purchase-orders-new'));
const PurchaseOrderDetailsPage = lazy(() => import('src/pages/dashboard/expenses/purchase-orders-details'));
const PurchaseOrderEditPage = lazy(() => import('src/pages/dashboard/expenses/purchase-orders-edit'));

const SelectBussinessPage = lazy(() => import('src/pages/dashboard/select-business'));

// SETTINGS
const SettingsPage = lazy(() => import('src/pages/dashboard/settings'));

// TREASURY
const TreasuryPage = lazy(() => import('src/pages/dashboard/treasury'));
const TreasuryAccountsPage = lazy(() => import('src/pages/dashboard/treasury/accounts'));
const TreasuryAccountDetailPage = lazy(() => import('src/pages/dashboard/treasury/account-detail'));
const TreasuryMovementsPage = lazy(() => import('src/pages/dashboard/treasury/movements'));
const BankReconciliationsPage = lazy(() => import('src/pages/dashboard/treasury/bank-reconciliations'));
const BankReconciliationNewPage = lazy(() => import('src/pages/dashboard/treasury/bank-reconciliation-new'));
const BankReconciliationDetailPage = lazy(() => import('src/pages/dashboard/treasury/bank-reconciliation-detail'));

// USER
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// BLOG
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// JOB
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// TOUR
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// FILE MANAGER
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// APP
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// BLANK PAGE
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

// ACCOUNTING PAGES
const ChartOfAccountsPage = lazy(() => import('src/pages/dashboard/accounting/chart-of-accounts'));
const ChartOfAccountsMappingsPage = lazy(() => import('src/pages/dashboard/accounting/chart-of-accounts-mappings'));
const ChartOfAccountsImportPage = lazy(() => import('src/pages/dashboard/accounting/chart-of-accounts-import'));
const JournalListPage = lazy(() => import('src/pages/dashboard/accounting/journal-list'));
const JournalEntryEditorPage = lazy(() => import('src/pages/dashboard/accounting/journal-entry-editor'));
const JournalEntryDetailPage = lazy(() => import('src/pages/dashboard/accounting/journal-entry-detail'));
const JournalReversalPage = lazy(() => import('src/pages/dashboard/accounting/journal-reversal'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: '/select-business',
    element: (
      <AuthGuard>
        <StepGuard>
          <Suspense fallback={<LoadingScreen />}>
            <SelectBussinessPage />
          </Suspense>
        </StepGuard>
      </AuthGuard>
    )
  },

  {
    path: '/dashboard',
    element: (
      <AuthGuard>
        <StepGuard>
          <DashboardLayout>
            <Suspense fallback={<LoadingScreen />}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </StepGuard>
      </AuthGuard>
    ),
    children: [
      { element: <IndexPage />, index: true },
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      {
        path: 'inventory',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: 'new-product', element: <ProductCreatePage /> },
          {
            path: 'categories',
            element: <CategoriesListView />
          },
          { path: 'pdvs', element: <PDVSListPage /> },
          { path: 'brands', element: <BrandsListView /> },
          { path: 'movements', element: <InventoryMovementsPage /> }
        ]
      },
      {
        path: 'sales',
        children: [
          { element: <SalesInvoiceListPage />, index: true },
          { path: 'new-sale', element: <SalesInvoiceCreatePage /> },
          { path: ':id', element: <SalesInvoiceDetailsPage /> },
          { path: ':id/edit', element: <SalesInvoiceEditPage /> },
          {
            path: 'quotes',
            children: [
              { element: <QuotesListPage />, index: true },
              { path: 'new', element: <QuotesNewPage /> },
              { path: ':id', element: <QuotesDetailsPage /> },
              { path: ':id/edit', element: <QuotesEditPage /> }
            ]
          }
        ]
      },
      {
        path: 'bill',
        children: [
          { element: <BillInvoiceListPage />, index: true },
          { path: 'new-bill', element: <BillInvoiceCreatePage /> },
          { path: ':id', element: <BillInvoiceDetailsPage /> },
          { path: ':id/edit', element: <BillInvoiceEditPage /> },
          { path: 'provide', element: <BillInvoiceListPage /> },
          { path: 'new-provide', element: <BillInvoiceCreatePage /> },
          { path: 'provide/:id', element: <BillInvoiceDetailsPage /> },
          { path: 'provide/:id/edit', element: <BillInvoiceEditPage /> }
        ]
      },
      {
        path: 'payments-received',
        children: [
          { element: <PaymentReceivedListPage />, index: true },
          { path: 'new', element: <PaymentReceivedNewPage /> },
          { path: ':id', element: <PaymentReceivedDetailsPage /> },
          { path: ':id/edit', element: <PaymentReceivedEditPage /> }
        ]
      },
      {
        path: 'debit-notes',
        children: [
          { element: <DebitNoteListPage />, index: true },
          { path: 'new', element: <DebitNoteNewPage /> },
          { path: ':id', element: <DebitNoteDetailsPage /> },
          { path: ':id/edit', element: <DebitNoteEditPage /> }
        ]
      },
      {
        path: 'expenses',
        children: [
          {
            path: 'debit-notes',
            children: [
              { element: <ExpenseDebitNotesPage />, index: true },
              { path: 'new', element: <ExpenseDebitNoteNewPage /> }
            ]
          },
          {
            path: 'purchase-orders',
            children: [
              { element: <PurchaseOrdersPage />, index: true },
              { path: 'new', element: <PurchaseOrderNewPage /> },
              { path: ':id', element: <PurchaseOrderDetailsPage /> },
              { path: ':id/edit', element: <PurchaseOrderEditPage /> }
            ]
          }
        ]
      },
      {
        path: 'user',
        children: [
          { element: <UserProfilePage />, index: true },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: 'account', element: <UserAccountPage /> }
        ]
      },
      {
        path: 'product',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> }
        ]
      },
      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> }
        ]
      },
      {
        path: 'post',
        children: [
          { element: <BlogPostsPage />, index: true },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> }
        ]
      },
      {
        path: 'job',
        children: [
          { element: <JobListPage />, index: true },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> }
        ]
      },
      {
        path: 'tour',
        children: [
          { element: <TourListPage />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> }
        ]
      },
      // ACCOUNTING
      {
        path: 'accounting',
        children: [
          { element: <ChartOfAccountsPage />, index: true },
          { path: 'chart-of-accounts', element: <ChartOfAccountsPage /> },
          { path: 'chart-of-accounts/mappings', element: <ChartOfAccountsMappingsPage /> },
          { path: 'chart-of-accounts/import', element: <ChartOfAccountsImportPage /> },
          { path: 'journal', element: <JournalListPage /> },
          { path: 'journal/new', element: <JournalEntryEditorPage /> },
          { path: 'journal/:entryId', element: <JournalEntryDetailPage /> },
          { path: 'journal/:entryId/edit', element: <JournalEntryEditorPage /> },
          { path: 'journal/:entryId/reversal', element: <JournalReversalPage /> }
        ]
      },
      // TREASURY
      {
        path: 'treasury',
        children: [
          { element: <TreasuryPage />, index: true },
          { path: 'accounts', element: <TreasuryAccountsPage /> },
          { path: 'accounts/:id', element: <TreasuryAccountDetailPage /> },
          { path: 'movements', element: <TreasuryMovementsPage /> },
          { path: 'reconciliations', element: <BankReconciliationsPage /> },
          { path: 'reconciliations/new', element: <BankReconciliationNewPage /> },
          { path: 'reconciliations/:id', element: <BankReconciliationDetailPage /> }
        ]
      },
      // SETTINGS
      { path: 'settings', element: <SettingsPage /> },
      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'blank', element: <BlankPage /> }
    ]
  }
];
