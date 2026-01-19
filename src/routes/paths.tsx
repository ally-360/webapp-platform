// utils
import { paramCase } from 'src/utils/change-case';
import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  SELECT_BUSINESS: '/select-business'
};

// ---------------------------------------------------------
//

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  select_business: ROOTS.SELECT_BUSINESS,
  page403: '/403',
  page404: '/404',
  page500: '/500',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
      forgotPassword: `${ROOTS.AUTH}/jwt/forgot-password`
    }
  },
  acceptInvitation: '/accept-invitation',
  verifyEmail: '/verify-email',
  stepByStep: {
    root: `${ROOTS.AUTH}/step-by-step`
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    inventory: {
      list: `${ROOTS.DASHBOARD}/inventory`,
      newProduct: `${ROOTS.DASHBOARD}/inventory/new-product`,
      categories: `${ROOTS.DASHBOARD}/inventory/categories`,
      pdvs: `${ROOTS.DASHBOARD}/inventory/pdvs`,
      brands: `${ROOTS.DASHBOARD}/inventory/brands`
    },
    sales: {
      root: `${ROOTS.DASHBOARD}/sales`,
      newSale: `${ROOTS.DASHBOARD}/sales/new-sale`,
      details: (id: string) => `${ROOTS.DASHBOARD}/sales/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/sales/${id}/edit`,
      quotes: {
        root: `${ROOTS.DASHBOARD}/sales/quotes`,
        new: `${ROOTS.DASHBOARD}/sales/quotes/new`,
        details: (id: string) => `${ROOTS.DASHBOARD}/sales/quotes/${id}`,
        edit: (id: string) => `${ROOTS.DASHBOARD}/sales/quotes/${id}/edit`
      }
    },
    pos: {
      root: `/pos`,
      cashRegister: `/pos/cash-register`,
      history: `/pos/history`,
      sellers: `/pos/sellers`
    },
    bill: {
      root: `${ROOTS.DASHBOARD}/bill`,
      newBill: `${ROOTS.DASHBOARD}/bill/new-bill`,
      details: (id: string) => `${ROOTS.DASHBOARD}/bill/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/bill/${id}/edit`,

      // Recepciones de compra -  abastecer productos
      provide: `${ROOTS.DASHBOARD}/bill/provide`,
      newProvide: `${ROOTS.DASHBOARD}/bill/new-provide`,
      provideDetails: (id: string) => `${ROOTS.DASHBOARD}/bill/provide/${id}`,
      provideEdit: (id: string) => `${ROOTS.DASHBOARD}/bill/provide/${id}/edit`
    },
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      invitations: `${ROOTS.DASHBOARD}/user/invitations`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`
      }
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/product/${id}/edit`
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title: string) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title: string) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`
      }
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id: string) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`
      }
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`
      }
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`
      }
    },
    accounting: {
      root: `${ROOTS.DASHBOARD}/accounting`,
      chartOfAccounts: `${ROOTS.DASHBOARD}/accounting/chart-of-accounts`,
      mappings: `${ROOTS.DASHBOARD}/accounting/chart-of-accounts/mappings`,
      import: `${ROOTS.DASHBOARD}/accounting/chart-of-accounts/import`,
      journal: {
        root: `${ROOTS.DASHBOARD}/accounting/journal`,
        new: `${ROOTS.DASHBOARD}/accounting/journal/new`,
        details: (id: string) => `${ROOTS.DASHBOARD}/accounting/journal/${id}`,
        edit: (id: string) => `${ROOTS.DASHBOARD}/accounting/journal/${id}/edit`,
        reversal: (id: string) => `${ROOTS.DASHBOARD}/accounting/journal/${id}/reversal`
      }
    },
    paymentsReceived: {
      root: `${ROOTS.DASHBOARD}/payments-received`,
      new: `${ROOTS.DASHBOARD}/payments-received/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/payments-received/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/payments-received/${id}/edit`
    },
    debitNotes: {
      root: `${ROOTS.DASHBOARD}/debit-notes`,
      new: `${ROOTS.DASHBOARD}/debit-notes/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/debit-notes/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/debit-notes/${id}/edit`
    },
    expenses: {
      root: `${ROOTS.DASHBOARD}/expenses`,
      debitNotes: {
        root: `${ROOTS.DASHBOARD}/expenses/debit-notes`,
        new: `${ROOTS.DASHBOARD}/expenses/debit-notes/new`,
        details: (id: string) => `${ROOTS.DASHBOARD}/expenses/debit-notes/${id}`
      },
      purchaseOrders: {
        root: `${ROOTS.DASHBOARD}/expenses/purchase-orders`,
        new: `${ROOTS.DASHBOARD}/expenses/purchase-orders/new`,
        details: (id: string) => `${ROOTS.DASHBOARD}/expenses/purchase-orders/${id}`,
        edit: (id: string) => `${ROOTS.DASHBOARD}/expenses/purchase-orders/${id}/edit`
      }
    },
    settings: {
      root: `${ROOTS.DASHBOARD}/settings`,
      costCenters: `${ROOTS.DASHBOARD}/settings/cost-centers`
    },
    treasury: {
      root: `${ROOTS.DASHBOARD}/treasury`,
      accounts: `${ROOTS.DASHBOARD}/treasury/accounts`,
      movements: `${ROOTS.DASHBOARD}/treasury/movements`,
      transfers: `${ROOTS.DASHBOARD}/treasury/transfers`,
      accountDetails: (id: string) => `${ROOTS.DASHBOARD}/treasury/accounts/${id}`
    }
  }
};
