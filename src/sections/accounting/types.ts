// Backend API types
export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';
export type AccountNature = 'debit' | 'credit';
export type AccountUse = 'movement' | 'accumulative';
export type AccountBehavior =
  | 'NONE'
  | 'RECEIVABLE_ACCOUNTS'
  | 'RECEIVABLE_ACCOUNTS_RETURNS'
  | 'TAXES_IN_FAVOR'
  | 'INVENTORY'
  | 'DEBTS_TO_PAY_PROVIDERS'
  | 'DEBTS_TO_PAY_RETURNS'
  | 'TAXES_TO_PAY'
  | 'SALES'
  | 'SALES_RETURNS'
  | 'COST_OF_GOODS_SOLD'
  | 'PURCHASES'
  | 'PURCHASES_RETURNS';

export interface AccountingAccount {
  id: string;
  code: string;
  name: string;
  account_type: AccountType;
  nature: AccountNature;
  use: AccountUse;
  behavior: AccountBehavior;
  parent_id: string | null;
  accepts_third_party: boolean;
  is_active: boolean;
  is_system: boolean;
  balance_debit: number;
  balance_credit: number;
  balance: number;
}

export interface GetAccountsResponse {
  accounts: AccountingAccount[];
}

export interface GetAccountsParams {
  account_type?: AccountType;
  parent_id?: string;
  is_active?: boolean;
  search?: string;
  skip?: number;
  limit?: number;
  use?: 'treasury' | 'general';
}

export interface CreateAccountPayload {
  code: string;
  name: string;
  description?: string;
  account_type: AccountType;
  nature: AccountNature;
  use: AccountUse;
  behavior: AccountBehavior;
  accepts_third_party: boolean;
  parent_id?: string | null;
  is_system?: boolean;
}

export interface UpdateAccountPayload {
  name?: string;
  description?: string;
  code?: string;
  is_active?: boolean;
  accepts_third_party?: boolean;
  parent_id?: string | null;
}

// Journal Entry types
export type JournalEntryType =
  | 'invoice'
  | 'payment'
  | 'treasury'
  | 'debit_note'
  | 'credit_note'
  | 'adjustment'
  | 'manual';

export type JournalEntryStatus = 'draft' | 'posted' | 'voided';

export interface JournalEntryLine {
  id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string | null;
  third_party_id: string | null;
  third_party_name: string | null;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  entry_type: JournalEntryType;
  status: JournalEntryStatus;
  reference_number: string | null;
  description: string;
  total_debit: number;
  total_credit: number;
  created_at: string;
  created_by: string;
}

export interface JournalEntryDetail extends JournalEntry {
  lines: JournalEntryLine[];
}

export interface GetJournalEntriesResponse {
  journal_entries: JournalEntry[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetJournalEntriesParams {
  start_date?: string;
  end_date?: string;
  entry_type?: JournalEntryType;
  status?: JournalEntryStatus;
  reference_number?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface AccountingCatalogs {
  entry_types: Array<{
    value: JournalEntryType;
    label: string;
  }>;
  statuses: Array<{
    value: JournalEntryStatus;
    label: string;
  }>;
}

export interface CostCenter {
  id: string;
  code?: string;
  name: string;
  is_active?: boolean;
}

// Legacy types for existing UI components (kept for compatibility)
export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'ARCHIVED';

export interface ChartAccountNode {
  id: string;
  code: string;
  name: string;
  level: 'CLASS' | 'GROUP' | 'ACCOUNT' | 'SUBACCOUNT';
  nature: AccountNature;
  status: AccountStatus;
  requiresThirdParty?: boolean;
  requiresCostCenter?: boolean;
  reconcilable?: boolean;
  allowMovements?: boolean;
  taxTags?: Array<'IVA' | 'RET_FUENTE' | 'RET_IVA' | 'RET_ICA'>;
  usage?: Array<'VENTAS' | 'COMPRAS' | 'BANCOS' | 'INVENTARIO' | 'CX' | 'IMPUESTOS'>;
  parentId?: string | null;
}
