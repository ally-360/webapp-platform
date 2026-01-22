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

// Auto-match response
export interface AutoMatchResponse {
  matched_count: number;
  message?: string;
}

export interface CreateReconciliationPayload {
  treasury_account_id: string;
  period_start_date: string;
  period_end_date: string;
  bank_balance_start: number;
  bank_balance_end: number;
  notes?: string;
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

// Bank Reconciliation Types
export type ReconciliationStatus = 'draft' | 'in_progress' | 'completed' | 'reversed';

export interface BankReconciliation {
  id: string;
  tenant_id: string;
  bank_account_id: string;
  period_start_date: string;
  period_end_date: string;
  bank_balance_start: string;
  bank_balance_end: string;
  book_balance_start: string;
  book_balance_end: string;
  adjustment_journal_entry_id?: string;
  total_statement_lines: number;
  reconciled_lines: number;
  unreconciled_lines: number;
  reconciliation_percentage: number;
  balance_difference: number;
  is_balanced: boolean;
  status: ReconciliationStatus;
  reconciled_by?: string;
  reconciled_at?: string;
  reversed_by?: string;
  reversed_at?: string;
  reversal_reason?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  treasury_account_id: string;
  // Populated fields
  bank_account?: TreasuryAccount;
  created_by_user?: {
    id: string;
    name: string;
  };
}

export interface GetReconciliationsResponse {
  reconciliations: BankReconciliation[];
  total: number;
  limit: number;
  offset: number;
}

export interface ReconciliationFilters {
  bank_account_id?: string;
  status_filter?: ReconciliationStatus;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

// Bank Reconciliation - Statement Lines
export type StatementLineStatus = 'unreconciled' | 'reconciled' | 'pending';

export interface UnmatchedLine {
  id: string;
  statement_date: string;
  description: string;
  reference?: string;
  amount: string;
  balance: string;
  created_at: string;
}

export interface GetUnmatchedLinesResponse {
  lines: UnmatchedLine[];
  total: number;
}

export interface UnmatchedMovement {
  id: string;
  movement_date: string;
  description: string;
  reference?: string;
  amount: string;
  payment_method?: string;
  source_module: string;
}

export interface GetUnmatchedMovementsResponse {
  movements: UnmatchedMovement[];
  total: number;
}

export interface BankStatementLine {
  id: string;
  reconciliation_id: string;
  statement_date: string;
  description: string;
  reference?: string;
  debit: string;
  credit: string;
  balance: string;
  status: StatementLineStatus;
  matched_transaction_id?: string;
  matched_at?: string;
  matched_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Bank Reconciliation - Accounting Transactions
export interface AccountingTransaction {
  id: string;
  transaction_date: string;
  description: string;
  reference?: string;
  document_type?: string;
  document_id?: string;
  debit: string;
  credit: string;
  balance: string;
  is_reconciled: boolean;
  reconciliation_id?: string;
  reconciled_at?: string;
  created_at: string;
}

// Bank Reconciliation - Match
export type MatchType = 'auto' | 'manual' | 'adjustment';
export type InternalMatchType = 'treasury_movement' | 'invoice_payment' | 'purchase_payment' | 'adjustment';

export interface ReconciliationMatch {
  id: string;
  reconciliation_id: string;
  statement_line_id: string;
  match_type: MatchType;
  internal_type: InternalMatchType;
  internal_reference?: string;
  statement_date: string;
  statement_description: string;
  statement_amount: string;
  internal_amount: string;
  difference: string;
  match_score?: number;
  matched_by?: string;
  matched_by_user?: {
    id: string;
    name: string;
  };
  matched_at: string;
  notes?: string;
}

export interface GetMatchesResponse {
  matches: ReconciliationMatch[];
  total: number;
}

export interface MatchesFilters {
  match_type?: MatchType;
  min_score?: number;
  max_score?: number;
  limit?: number;
  offset?: number;
}

// Bank Reconciliation - Activity/Timeline
export type ReconciliationActivityType =
  | 'created'
  | 'statement_imported'
  | 'auto_matched'
  | 'manual_matched'
  | 'match_removed'
  | 'adjustment_created'
  | 'completed'
  | 'reversed'
  | 'status_changed';

export interface ReconciliationActivity {
  id: string;
  reconciliation_id: string;
  activity_type: ReconciliationActivityType;
  description: string;
  details?: Record<string, any>;
  user_id: string;
  user_name: string;
  created_at: string;
}

// Bank Reconciliation - Detailed Response
export interface BankReconciliationDetail extends BankReconciliation {
  statement_lines: BankStatementLine[];
  accounting_transactions: AccountingTransaction[];
  matches: ReconciliationMatch[];
  activities: ReconciliationActivity[];
  adjustment_entry?: JournalEntry;
}

// Bank Reconciliation - Actions Payloads
export interface MatchTransactionPayload {
  statement_line_id: string;
  transaction_ids: string[];
  match_type?: 'manual';
  notes?: string;
}

export interface RemoveMatchPayload {
  match_id: string;
  reason?: string;
}

export interface CompleteReconciliationPayload {
  create_adjustment?: boolean;
  adjustment_notes?: string;
}

export interface ReverseReconciliationPayload {
  reason: string;
}

// Bank Reconciliation - Report Types
export interface ReconciliationMovementSummary {
  type: string; // 'auto' | 'manual' | 'adjustment' | 'IN' | 'OUT'
  count: number;
  total_amount?: string;
}

export interface ReconciliationReportSummary {
  total_statement_lines: number;
  reconciled_lines: number;
  unreconciled_lines: number;
  reconciliation_percentage: number;
  balance_difference: string;
  is_balanced: boolean;
  reconciled_amount?: string;
  unreconciled_amount?: string;
}

export interface ReconciliationReport {
  reconciliation_id: string;
  status: ReconciliationStatus;
  bank_account: {
    id: string;
    name: string;
    account_number?: string;
  };
  period_start: string;
  period_end: string;
  summary: ReconciliationReportSummary;
  movement_types?: ReconciliationMovementSummary[];
  unmatched_lines?: BankStatementLine[];
  unmatched_movements?: TreasuryMovement[];
  adjustment_entry_id?: string;
  generated_at: string;
}

// Bank Reconciliation - Timeline Types
export interface TimelineEvent {
  id?: string;
  type: string;
  occurred_at: string; // ISO datetime
  user_id?: string;
  user_email?: string;
  user_name?: string;
  message?: string;
  metadata?: Record<string, any>;
}

export interface GetTimelineResponse {
  reconciliation_id: string;
  events: TimelineEvent[];
  total_events: number;
}
