// Mock data para productos del POS
import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const POS_PRODUCTS = [
  {
    id: '1',
    name: 'Producto Demo 1',
    sku: 'PRD-001',
    images: ['/assets/images/m_product/product_1.jpg'],
    priceSale: 25000,
    quantityStock: 10,
    available: true,
    description: 'Producto de demostración 1',
    category: 'electronics',
    colors: ['red', 'blue'],
    sizes: ['S', 'M', 'L']
  },
  {
    id: '2',
    name: 'Producto Demo 2',
    sku: 'PRD-002',
    images: ['/assets/images/m_product/product_2.jpg'],
    priceSale: 45000,
    quantityStock: 5,
    available: true,
    description: 'Producto de demostración 2',
    category: 'fashion',
    colors: ['black', 'white'],
    sizes: ['M', 'L', 'XL']
  },
  {
    id: '3',
    name: 'Producto Demo 3',
    sku: 'PRD-003',
    images: ['/assets/images/m_product/product_3.jpg'],
    priceSale: 15000,
    quantityStock: 0,
    available: false,
    description: 'Producto de demostración 3',
    category: 'food',
    colors: ['green'],
    sizes: ['One Size']
  },
  {
    id: '4',
    name: 'Café Premium',
    sku: 'CAF-001',
    images: ['/assets/images/placeholder.svg'],
    priceSale: 35000,
    quantityStock: 20,
    available: true,
    description: 'Café premium de origen colombiano',
    category: 'food',
    colors: ['brown'],
    sizes: ['250g', '500g', '1kg']
  },
  {
    id: '5',
    name: 'Auriculares Bluetooth',
    sku: 'AUD-001',
    images: ['/assets/images/placeholder.svg'],
    priceSale: 150000,
    quantityStock: 15,
    available: true,
    description: 'Auriculares inalámbricos con cancelación de ruido',
    category: 'electronics',
    colors: ['black', 'white', 'blue'],
    sizes: ['One Size']
  },
  {
    id: '6',
    name: 'Camiseta Cotton',
    sku: 'CAM-001',
    images: ['/assets/images/placeholder.svg'],
    priceSale: 40000,
    quantityStock: 25,
    available: true,
    description: 'Camiseta 100% algodón',
    category: 'fashion',
    colors: ['white', 'black', 'gray'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '7',
    name: 'Mouse Gaming',
    sku: 'MSE-001',
    images: ['/assets/images/placeholder.svg'],
    priceSale: 85000,
    quantityStock: 8,
    available: true,
    description: 'Mouse gaming RGB con 6400 DPI',
    category: 'electronics',
    colors: ['black', 'red'],
    sizes: ['One Size']
  },
  {
    id: '8',
    name: 'Pantalón Jeans',
    sku: 'PAN-001',
    images: ['/assets/images/placeholder.svg'],
    priceSale: 95000,
    quantityStock: 12,
    available: true,
    description: 'Pantalón jeans clásico',
    category: 'fashion',
    colors: ['blue', 'black'],
    sizes: ['28', '30', '32', '34', '36']
  }
];

export const MOCK_CONTACTS = [
  {
    id: '1',
    name: 'Juan Pérez',
    lastname: 'González',
    email: 'juan.perez@email.com',
    address: 'Calle 123 #45-67',
    phoneNumber: '+57 300 123 4567',
    city: 'Bogotá',
    documentType: 'CC',
    documentNumber: '12345678'
  },
  {
    id: '2',
    name: 'María López',
    lastname: 'Rodríguez',
    email: 'maria.lopez@email.com',
    address: 'Carrera 89 #12-34',
    phoneNumber: '+57 310 987 6543',
    city: 'Medellín',
    documentType: 'CC',
    documentNumber: '87654321'
  },
  {
    id: '3',
    name: 'Carlos Mendoza',
    lastname: 'Silva',
    email: 'carlos.mendoza@email.com',
    address: 'Avenida 56 #78-90',
    phoneNumber: '+57 320 555 1234',
    city: 'Cali',
    documentType: 'CC',
    documentNumber: '11223344'
  }
];
