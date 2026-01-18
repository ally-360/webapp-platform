// Treasury Account Types
export type TreasuryAccountType = 'cash' | 'bank' | 'pos';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check' | 'other';

export type MovementType = 'inflow' | 'outflow';

export type SourceModule =
  | 'pos'
  | 'payment'
  | 'customer_advance'
  | 'bill_payment'
  | 'debit_note'
  | 'credit_note'
  | 'adjustment'
  | 'transfer'
  | 'opening_balance'
  | 'closing_balance';

// Treasury Account
export interface TreasuryAccount {
  id: string;
  tenant_id: string;
  code?: string;
  name: string;
  type: TreasuryAccountType;
  account_number?: string; // Número de cuenta bancaria
  bank_account_id?: string;
  accounting_account_id?: string;
  pos_terminal_id?: string;
  currency: string;
  is_active: boolean;
  requires_session: boolean;
  current_balance: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Treasury Movement
export interface TreasuryMovement {
  id: string;
  tenant_id: string;
  treasury_account_id: string;
  cash_session_id?: string;
  movement_type: MovementType;
  movement_date: string;
  amount: string;
  source_module: SourceModule;
  source_id?: string;
  source_reference?: string;
  payment_method?: PaymentMethod;
  description?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  is_reversed: boolean;
  reversed_at?: string;
  reversed_by?: string;
  reversal_reason?: string;
}

// API Responses
export interface GetAccountsResponse {
  accounts: TreasuryAccount[];
  total: number;
}

export interface GetMovementsResponse {
  movements: TreasuryMovement[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GetBalancesResponse {
  cash_total: string;
  bank_total: string;
  credit_card_debt: string;
  pos_total: string;
  global_balance: string;
  total_accounts: number;
  last_updated: string;
}

// Create/Update Payloads
export interface CreateAccountPayload {
  code?: string;
  name: string;
  type: TreasuryAccountType;
  bank_account_id?: string;
  accounting_account_id?: string;
  pos_terminal_id?: string;
  currency: string;
  is_active?: boolean;
  requires_session?: boolean;
  description?: string;
}

export type UpdateAccountPayload = Partial<CreateAccountPayload>;

export interface CreateMovementPayload {
  treasury_account_id: string;
  cash_session_id?: string;
  movement_type: MovementType;
  movement_date: string;
  amount: string;
  source_module: SourceModule;
  source_id?: string;
  source_reference?: string;
  payment_method?: PaymentMethod;
  description?: string;
  notes?: string;
}

// Filters
export interface AccountFilters {
  type?: TreasuryAccountType;
  is_active?: boolean;
}

export interface MovementFilters {
  treasury_account_id?: string;
  cash_session_id?: string;
  movement_type?: MovementType;
  source_module?: SourceModule;
  start_date?: string;
  end_date?: string;
  include_reversed?: boolean;
  page?: number;
  size?: number;
}

// Transfer Types
export interface CreateTransferPayload {
  source_account_id: string;
  destination_account_id: string;
  amount: string;
  transfer_date: string;
  description?: string;
  notes?: string;
}

export interface TreasuryTransfer {
  id: string;
  tenant_id: string;
  source_account_id: string;
  destination_account_id: string;
  amount: string;
  transfer_date: string;
  description?: string;
  notes?: string;
  source_movement_id: string;
  destination_movement_id: string;
  created_by: string;
  created_at: string;
}

// Report Types
export interface TreasurySummaryReport {
  total_cash: string;
  total_bank: string;
  total_pos: string;
  global_balance: string;
  active_accounts: number;
  inactive_accounts: number;
  total_inflows: string;
  total_outflows: string;
  period_start?: string;
  period_end?: string;
}

export interface AccountBalanceReport {
  account_id: string;
  account_name: string;
  account_type: TreasuryAccountType;
  opening_balance: string;
  total_inflows: string;
  total_outflows: string;
  closing_balance: string;
  movement_count: number;
  period_start: string;
  period_end: string;
}

export interface AccountBalanceReportParams {
  start_date: string;
  end_date: string;
}

// Catalog Types
export interface TreasuryCatalogs {
  account_types: Array<{ value: TreasuryAccountType; label: string }>;
  payment_methods: Array<{ value: PaymentMethod; label: string }>;
  movement_types: Array<{ value: MovementType; label: string }>;
  source_modules: Array<{ value: SourceModule; label: string }>;
  currencies: Array<{ code: string; name: string; symbol: string }>;
}

// Lookup Types
export interface AccountLookup {
  id: string;
  code?: string;
  name: string;
  type: TreasuryAccountType;
  current_balance: string;
  currency: string;
}

export interface AccountLookupParams {
  type?: TreasuryAccountType;
  search?: string;
  limit?: number;
}

export interface AccountsLookupResponse {
  accounts: AccountLookup[];
}

// Available for Operation
export interface AvailableAccountsParams {
  operation_type?: 'inflow' | 'outflow' | 'transfer';
  requires_session?: boolean;
}

// Account Summary Widget
export interface AccountSummary {
  id: string;
  name: string;
  type: TreasuryAccountType;
  current_balance: string;
  currency: string;
  last_movement_date?: string;
  movement_count_today: number;
  is_active: boolean;
}

// Movements by Source
export interface MovementsBySourceParams {
  source_module: SourceModule;
  source_id: string;
}

// Movement Validation
export interface ValidateMovementPayload {
  treasury_account_id: string;
  movement_type: MovementType;
  amount: string;
  movement_date?: string;
}

export interface MovementValidationResponse {
  is_valid: boolean;
  errors?: string[];
  warnings?: string[];
  account_balance_after?: string;
}

// Journal Entry
export interface JournalEntry {
  id: string;
  entry_date: string;
  description: string;
  entries: Array<{
    account_code: string;
    account_name: string;
    debit: string;
    credit: string;
  }>;
  total_debit: string;
  total_credit: string;
  created_at: string;
}
