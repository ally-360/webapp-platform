import { AccountNature, AccountStatus } from 'src/sections/accounting/types';

export type CurrencyCode = 'COP' | 'USD' | 'EUR';

export interface JournalLine {
  id: string;
  accountId: string; // ChartAccountNode.id
  accountCode: string;
  accountName: string;
  description?: string;
  debit: number; // positive numbers only
  credit: number; // positive numbers only
  thirdPartyId?: string | null;
  costCenterId?: string | null;
  taxTag?: 'IVA' | 'RET_FUENTE' | 'RET_IVA' | 'RET_ICA';
}

export interface JournalEntry {
  id: string;
  number: string; // sequential visible number
  date: string; // ISO string yyyy-mm-dd
  reference?: string;
  concept: string;
  currency: CurrencyCode;
  rate?: number; // exchange rate
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
  source?: 'MANUAL' | 'SALES' | 'PURCHASES' | 'BANKS' | 'INVENTORY';
  lines: JournalLine[];
  totals: {
    debit: number;
    credit: number;
  };
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  postedAt?: string;
  postedBy?: string;
  reversedById?: string; // id of reversal entry
}

export interface ChartAccountSummary {
  id: string;
  code: string;
  name: string;
  nature: AccountNature;
  status: AccountStatus;
}
