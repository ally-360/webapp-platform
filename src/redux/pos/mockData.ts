export const mockProducts = [
  {
    id: 1,
    name: 'Coca Cola 350ml',
    price: 3500,
    sku: 'COC001',
    category: 'Bebidas',
    stock: 50,
    tax_rate: 0.19,
    quantity: 1
  },
  {
    id: 2,
    name: 'Pan Tajado Bimbo',
    price: 4200,
    sku: 'PAN001',
    category: 'Panadería',
    stock: 25,
    tax_rate: 0.05,
    quantity: 1
  },
  {
    id: 3,
    name: 'Leche Entera 1L',
    price: 4800,
    sku: 'LAC001',
    category: 'Lácteos',
    stock: 30,
    tax_rate: 0.05,
    quantity: 1
  },
  {
    id: 4,
    name: 'Arroz Diana 500g',
    price: 2800,
    sku: 'ARR001',
    category: 'Granos',
    stock: 45,
    tax_rate: 0.05,
    quantity: 1
  },
  {
    id: 5,
    name: 'Aceite Gourmet 500ml',
    price: 8500,
    sku: 'ACE001',
    category: 'Aceites',
    stock: 20,
    tax_rate: 0.19,
    quantity: 1
  },
  {
    id: 6,
    name: 'Café Juan Valdez 250g',
    price: 12500,
    sku: 'CAF001',
    category: 'Café',
    stock: 15,
    tax_rate: 0.05,
    quantity: 1
  },
  {
    id: 7,
    name: 'Huevos AA x12',
    price: 6800,
    sku: 'HUE001',
    category: 'Proteínas',
    stock: 18,
    tax_rate: 0.05,
    quantity: 1
  },
  {
    id: 8,
    name: 'Jabón Dove 90g',
    price: 3200,
    sku: 'JAB001',
    category: 'Higiene',
    stock: 35,
    tax_rate: 0.19,
    quantity: 1
  },
  {
    id: 9,
    name: 'Papel Higiénico Familia x4',
    price: 8900,
    sku: 'PAP001',
    category: 'Higiene',
    stock: 22,
    tax_rate: 0.19,
    quantity: 1
  },
  {
    id: 10,
    name: 'Atún Van Camps 140g',
    price: 4500,
    sku: 'ATU001',
    category: 'Enlatados',
    stock: 40,
    tax_rate: 0.05,
    quantity: 1
  }
];

export const mockCustomers = [
  {
    id: 1,
    name: 'María García',
    document: '12345678',
    document_type: 'CC' as const,
    email: 'maria@email.com',
    phone: '3001234567',
    address: 'Calle 123 #45-67'
  },
  {
    id: 2,
    name: 'Juan Pérez',
    document: '87654321',
    document_type: 'CC' as const,
    email: 'juan@email.com',
    phone: '3009876543',
    address: 'Carrera 45 #123-45'
  },
  {
    id: 3,
    name: 'Empresa XYZ SAS',
    document: '900123456-1',
    document_type: 'NIT' as const,
    email: 'ventas@empresa.com',
    phone: '6012345678',
    address: 'Av. Principal #100-200'
  },
  {
    id: 4,
    name: 'Ana Rodríguez',
    document: '11223344',
    document_type: 'CC' as const,
    email: 'ana@email.com',
    phone: '3005544332',
    address: 'Diagonal 25 #78-90'
  }
];

export const defaultCustomer = {
  id: 0,
  name: 'Consumidor Final',
  document: '222222222222',
  document_type: 'CC' as const
};
