export type AccountNature = 'DEBIT' | 'CREDIT';
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
