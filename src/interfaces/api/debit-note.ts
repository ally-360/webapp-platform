import { DebitNote, DebitNoteLineItem } from 'src/types/debit-note';

// ----------------------------------------------------------------------

export type CreateDebitNoteRequest = {
  invoice_id: string;
  type: string;
  issue_date: string;
  reason: string;
  notes?: string;
  line_items: DebitNoteLineItem[];
};

export type UpdateDebitNoteRequest = Partial<CreateDebitNoteRequest>;

export type DebitNoteListResponse = {
  items: DebitNote[];
  total: number;
  limit: number;
  offset: number;
};

export type DebitNoteResponse = DebitNote;
