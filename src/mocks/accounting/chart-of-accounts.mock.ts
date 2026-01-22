import { ChartAccountNode } from 'src/sections/accounting/types';

export const mockChartAccounts: ChartAccountNode[] = [
  { id: '1', code: '1', name: 'Activo', level: 'CLASS', nature: 'DEBIT', status: 'ACTIVE' },
  {
    id: '11',
    code: '11',
    name: 'Disponible',
    level: 'GROUP',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '1'
  },
  {
    id: '1105',
    code: '1105',
    name: 'Caja',
    level: 'ACCOUNT',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '11',
    reconcilable: true,
    allowMovements: true,
    usage: ['BANCOS']
  },
  {
    id: '110505',
    code: '110505',
    name: 'Caja general',
    level: 'SUBACCOUNT',
    nature: 'DEBIT',
    status: 'ACTIVE',
    parentId: '1105',
    reconcilable: true,
    allowMovements: true,
    usage: ['BANCOS']
  },
  { id: '2', code: '2', name: 'Pasivo', level: 'CLASS', nature: 'CREDIT', status: 'ACTIVE' },
  {
    id: '22',
    code: '22',
    name: 'Obligaciones financieras',
    level: 'GROUP',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '2'
  },
  {
    id: '2205',
    code: '2205',
    name: 'Bancos',
    level: 'ACCOUNT',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '22',
    reconcilable: true
  },
  {
    id: '220505',
    code: '220505',
    name: 'Banco corriente',
    level: 'SUBACCOUNT',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '2205',
    reconcilable: true
  },
  { id: '4', code: '4', name: 'Ingresos', level: 'CLASS', nature: 'CREDIT', status: 'ACTIVE' },
  {
    id: '41',
    code: '41',
    name: 'Ingresos operacionales',
    level: 'GROUP',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '4'
  },
  {
    id: '4135',
    code: '4135',
    name: 'Servicios',
    level: 'ACCOUNT',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '41',
    taxTags: ['IVA']
  },
  {
    id: '413505',
    code: '413505',
    name: 'Servicios profesionales',
    level: 'SUBACCOUNT',
    nature: 'CREDIT',
    status: 'ACTIVE',
    parentId: '4135',
    taxTags: ['IVA'],
    usage: ['VENTAS']
  }
];
