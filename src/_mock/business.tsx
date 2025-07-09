interface Company {
  id: string;
  name: string;
  nit: string;
  phone: string;
  address: string;
  logo?: string; // Optional logo field
}

export const companies: Company[] = [
  {
    id: '1',
    name: 'Hexa Software Solutions',
    nit: '900123456-7',
    phone: '320 456 7890',
    address: 'Cra. 42 #5-21, Cali'
  },
  {
    id: '2',
    name: 'NovaTech Group',
    nit: '901987654-3',
    phone: '310 987 6543',
    address: 'Cl. 10 #50-23, Medellín'
  }
];
