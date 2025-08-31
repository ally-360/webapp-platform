import { JournalEntry } from './types';

export const mockJournal: JournalEntry[] = [
  {
    id: 'JE-000001',
    number: '000001',
    date: '2024-08-15',
    concept: 'Factura de venta FV-1001',
    reference: 'FV-1001',
    currency: 'COP',
    status: 'POSTED',
    source: 'SALES',
    lines: [
      {
        id: 'L1',
        accountId: '110505',
        accountCode: '110505',
        accountName: 'Caja general',
        description: 'Cobro en efectivo',
        debit: 119000,
        credit: 0
      },
      {
        id: 'L2',
        accountId: '413505',
        accountCode: '413505',
        accountName: 'Servicios profesionales',
        description: 'Ingreso por servicios',
        debit: 0,
        credit: 100000
      },
      {
        id: 'L3',
        accountId: '2408',
        accountCode: '2408',
        accountName: 'IVA por pagar',
        description: 'IVA 19%',
        debit: 0,
        credit: 19000,
        taxTag: 'IVA'
      }
    ],
    totals: { debit: 119000, credit: 119000 },
    createdAt: '2024-08-15T10:00:00Z',
    createdBy: 'user@ally360.io',
    postedAt: '2024-08-15T10:05:00Z',
    postedBy: 'user@ally360.io'
  },
  {
    id: 'JE-000002',
    number: '000002',
    date: '2024-08-16',
    concept: 'Pago proveedores',
    reference: 'Egreso 0005',
    currency: 'COP',
    status: 'DRAFT',
    source: 'BANKS',
    lines: [
      {
        id: 'L1',
        accountId: '220505',
        accountCode: '220505',
        accountName: 'Banco corriente',
        debit: 0,
        credit: 500000
      },
      {
        id: 'L2',
        accountId: '2335',
        accountCode: '2335',
        accountName: 'Proveedores nacionales',
        debit: 500000,
        credit: 0
      }
    ],
    totals: { debit: 500000, credit: 500000 },
    createdAt: '2024-08-16T09:00:00Z',
    createdBy: 'user@ally360.io'
  }
];
