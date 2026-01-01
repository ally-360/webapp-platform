// ----------------------------------------------------------------------

export type DebitNoteStatus = 'open' | 'applied' | 'void';

export type DebitNoteType = 'interest' | 'price_adjustment' | 'additional_charge' | 'other';

// ----------------------------------------------------------------------

export type DebitNoteTax = {
  tax_name: string;
  tax_rate: number;
  tax_amount: number;
};

export type DebitNoteLineItem = {
  id?: string;
  product_id?: string | null;
  name: string; // Obligatorio según API
  description?: string; // Alias de name para compatibilidad
  quantity?: number | null;
  unit_price?: number | null;
  subtotal: number;
  line_taxes: DebitNoteTax[];
  // Campos opcionales del producto (para UI)
  sku?: string;
  priceSale?: number;
};

export type DebitNote = {
  id: string;
  company_id: string;
  number: string;
  invoice_id: string;
  invoice_number?: string;
  customer_id?: string;
  customer_name?: string;
  type: DebitNoteType;
  status: DebitNoteStatus;
  issue_date: string;
  reason: string;
  notes?: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  line_items: DebitNoteLineItem[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
};

// ----------------------------------------------------------------------

export type DebitNoteFilters = {
  invoice_id?: string;
  customer_id?: string;
  type?: DebitNoteType;
  status?: DebitNoteStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
};

export type DebitNoteTableFilters = {
  customer?: string;
  type?: DebitNoteType | 'all';
  status?: DebitNoteStatus | 'all';
  startDate?: Date | null;
  endDate?: Date | null;
};

export type DebitNoteTableFilterValue = string | DebitNoteType | DebitNoteStatus | Date | null;
