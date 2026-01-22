// Inventory Movements Types

export type MovementType = 'IN' | 'OUT';

export interface JournalEntry {
  id: string;
  tenant_id: string;
  number: string;
  entry_date: string;
  entry_type: string;
  status: string;
  reference_type?: string;
  reference_id?: string;
  reference_number?: string;
  description?: string;
  notes?: string;
  total_debit: string;
  total_credit: string;
  created_by: string;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  pdv_id: string;
  pdv_name: string;
  variant_id?: string;
  quantity: number;
  movement_type: MovementType;
  reference?: string;
  notes?: string;
  created_by_email?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  journal_entry_id?: string | null;
  journal_entry?: JournalEntry | null;
}

export interface MovementsListParams {
  product_id?: string;
  pdv_id?: string;
  movement_type?: MovementType | '';
  limit?: number;
  offset?: number;
}

export interface MovementsListResponse {
  movements: InventoryMovement[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateMovementPayload {
  product_id: string;
  pdv_id: string;
  variant_id?: string;
  quantity: number;
  movement_type: MovementType;
  reference?: string;
  notes?: string;
}

export interface TransferStockPayload {
  product_id: string;
  pdv_id_from: string;
  pdv_id_to: string;
  variant_id?: string;
  quantity: number;
  reference?: string;
  notes?: string;
}

export interface MovementJournalEntry {
  journal_entry_id: string;
  // Add more fields as needed when implementing
}
