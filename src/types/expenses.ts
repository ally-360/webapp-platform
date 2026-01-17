// ----------------------------------------------------------------------
// EXPENSES - DEBIT NOTES TYPES
// ----------------------------------------------------------------------

export type ExpenseDebitNoteStatus = 'open' | 'void';

export type DebitNoteReasonType = 'price_adjustment' | 'quantity_adjustment' | 'service';

// ----------------------------------------------------------------------

export type ExpenseDebitNoteItem = {
  id?: string;
  product_id?: string;
  name: string;
  quantity?: number | null;
  unit_price: string;
  reason_type: DebitNoteReasonType;
  line_total?: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
  };
};

export type ExpenseDebitNote = {
  id: string;
  bill_id?: string;
  supplier_id: string;
  issue_date: string;
  status: ExpenseDebitNoteStatus;
  subtotal: string;
  taxes_total: string;
  total_amount: string;
  notes?: string;
  items: ExpenseDebitNoteItem[];
  supplier_name?: string;
  supplier_email?: string;
  bill_number?: string;
  supplier?: {
    id: string;
    name: string;
    email?: string;
  };
  bill?: {
    id: string;
    number: string;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
};

// ----------------------------------------------------------------------

export type ExpenseDebitNoteFilters = {
  bill_id?: string;
  supplier_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
};

export type ExpenseDebitNoteTableFilters = {
  supplier?: string;
  bill?: string;
  status?: ExpenseDebitNoteStatus | 'all';
  startDate?: Date | null;
  endDate?: Date | null;
};

export type ExpenseDebitNoteTableFilterValue = string | ExpenseDebitNoteStatus | Date | null;

// ----------------------------------------------------------------------

export type CreateExpenseDebitNoteRequest = {
  bill_id?: string;
  supplier_id: string;
  issue_date: string;
  notes?: string;
  items: {
    product_id?: string;
    name: string;
    quantity?: number;
    unit_price: number;
    reason_type: DebitNoteReasonType;
  }[];
};

export type UpdateExpenseDebitNoteRequest = Partial<CreateExpenseDebitNoteRequest>;

export type ExpenseDebitNotesResponse = {
  items: ExpenseDebitNote[];
  total: number;
  limit: number;
  offset: number;
};
