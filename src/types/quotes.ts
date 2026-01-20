// ============================================================================
// QUOTES TYPES
// ============================================================================

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface QuoteLineItem {
  id?: string;
  product_id: string;
  quantity: number | string;
  unit_price: string;
  name?: string;
  sku?: string;
  line_subtotal?: string;
  line_taxes?: any[];
  taxes_amount?: string;
  line_total?: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
  };
}

export interface Quote {
  id: string;
  quote_number: string;
  status: QuoteStatus;
  customer_id: string;
  customer_name?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_email?: string;
  pdv_id: string;
  seller_id: string;
  issue_date: string;
  expiration_date: string;
  currency: string;
  notes?: string;
  subtotal: string;
  taxes_total: string;
  total_amount: string;
  converted_to_invoice_id?: string | null;
  converted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteDetail extends Quote {
  customer?: {
    id: string;
    name: string;
    email?: string;
    id_type?: string;
    id_number?: string;
    phone?: string;
  };
  pdv?: {
    id: string;
    name: string;
  };
  seller?: {
    id: string;
    name: string;
    email?: string;
  };
  line_items: QuoteLineItem[];
}

export interface QuotesResponse {
  items: Quote[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface QuotesFilters {
  customer_id?: string;
  status_filter?: QuoteStatus | string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface CreateQuoteRequest {
  customer_id: string;
  pdv_id: string;
  seller_id?: string;
  issue_date: string;
  expiration_date: string;
  currency?: string;
  notes?: string;
  line_items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface UpdateQuoteRequest {
  customer_id?: string;
  pdv_id?: string;
  seller_id?: string;
  issue_date?: string;
  expiration_date?: string;
  currency?: string;
  notes?: string;
  line_items?: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface ConvertQuoteToInvoiceRequest {
  invoice_type: 'SALE' | string;
  issue_date: string;
  due_date: string;
  notes?: string;
}
