import { AccountNature, AccountStatus } from './types';

export const ACCOUNT_NATURES: { value: AccountNature; label: string }[] = [
  { value: 'DEBIT', label: 'Débito' },
  { value: 'CREDIT', label: 'Crédito' }
];

export const ACCOUNT_STATUSES: { value: AccountStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'BLOCKED', label: 'Bloqueado' },
  { value: 'ARCHIVED', label: 'Archivado' }
];

export const TAX_TAGS = [
  { value: 'IVA', label: 'IVA' },
  { value: 'RET_FUENTE', label: 'Ret. fuente' },
  { value: 'RET_IVA', label: 'Ret. IVA' },
  { value: 'RET_ICA', label: 'Ret. ICA' }
] as const;

export const USAGE_TAGS = [
  { value: 'VENTAS', label: 'Ventas' },
  { value: 'COMPRAS', label: 'Compras' },
  { value: 'BANCOS', label: 'Bancos' },
  { value: 'INVENTARIO', label: 'Inventario' },
  { value: 'CX', label: 'Cuentas por cobrar/pagar' },
  { value: 'IMPUESTOS', label: 'Impuestos' }
] as const;

export const LEVEL_CODE_LENGTH = {
  CLASS: 1,
  GROUP: 2,
  ACCOUNT: 4,
  SUBACCOUNT: 6
} as const;
