// ========================================
// 🗄️ MINI-DATABASE EN MEMORIA - ALLY360 POS
// ========================================
import {
  Company,
  User,
  Profile,
  Brand,
  Category,
  Product,
  Warehouse,
  Stock,
  Department,
  Town,
  ContactIdentity,
  Contact,
  InvoiceCustomer,
  SalesInvoice,
  SalesInvoiceItem
} from '../types';

// ========================================
// 🌎 DATOS GEOGRÁFICOS DE COLOMBIA
// ========================================
export const departments: Department[] = [
  { id: 1, name: 'Antioquia' },
  { id: 2, name: 'Cundinamarca' },
  { id: 3, name: 'Valle del Cauca' },
  { id: 4, name: 'Atlántico' },
  { id: 5, name: 'Santander' },
  { id: 6, name: 'Bolívar' },
  { id: 7, name: 'Nariño' },
  { id: 8, name: 'Norte de Santander' }
];

export const towns: Town[] = [
  // Antioquia
  { id: 1001, name: 'Medellín', departmentId: 1 },
  { id: 1002, name: 'Bello', departmentId: 1 },
  { id: 1003, name: 'Envigado', departmentId: 1 },
  { id: 1004, name: 'Itagüí', departmentId: 1 },
  { id: 1005, name: 'Sabaneta', departmentId: 1 },

  // Cundinamarca
  { id: 2001, name: 'Bogotá D.C.', departmentId: 2 },
  { id: 2002, name: 'Soacha', departmentId: 2 },
  { id: 2003, name: 'Chía', departmentId: 2 },
  { id: 2004, name: 'Zipaquirá', departmentId: 2 },
  { id: 2005, name: 'Cajicá', departmentId: 2 },

  // Valle del Cauca
  { id: 3001, name: 'Cali', departmentId: 3 },
  { id: 3002, name: 'Palmira', departmentId: 3 },
  { id: 3003, name: 'Yumbo', departmentId: 3 },
  { id: 3004, name: 'Buenaventura', departmentId: 3 },

  // Atlántico
  { id: 4001, name: 'Barranquilla', departmentId: 4 },
  { id: 4002, name: 'Soledad', departmentId: 4 },
  { id: 4003, name: 'Malambo', departmentId: 4 },

  // Santander
  { id: 5001, name: 'Bucaramanga', departmentId: 5 },
  { id: 5002, name: 'Floridablanca', departmentId: 5 },
  { id: 5003, name: 'Piedecuesta', departmentId: 5 },

  // Bolívar
  { id: 6001, name: 'Cartagena', departmentId: 6 },
  { id: 6002, name: 'Turbaco', departmentId: 6 },

  // Nariño
  { id: 7001, name: 'Pasto', departmentId: 7 },
  { id: 7002, name: 'Ipiales', departmentId: 7 },

  // Norte de Santander
  { id: 8001, name: 'Cúcuta', departmentId: 8 },
  { id: 8002, name: 'Villa del Rosario', departmentId: 8 }
];

// ========================================
// 🏢 COMPANIES DATA
// ========================================
export const companies: Company[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'TechnoSoft Solutions',
    nit: '900123456',
    address: 'Carrera 45 #12-34, Medellín',
    phoneNumber: '+57 4 444-5678',
    website: 'https://technosoft.com',
    quantityEmployees: '15',
    economicActivity: 'Desarrollo de Software',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Comercial El Dorado',
    nit: '900789123',
    address: 'Calle 93 #15-20, Bogotá D.C.',
    phoneNumber: '+57 1 555-9999',
    website: 'https://eldorado.com.co',
    quantityEmployees: '25',
    economicActivity: 'Comercio al por mayor',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  }
];

// ========================================
// 👤 USERS & PROFILES DATA
// ========================================
export const users: User[] = [
  {
    id: 'user-550e8400-e29b-41d4-a716-446655440000',
    email: 'example@gmail.com',
    password: '123456', // Solo para mock
    verified: true,
    authId: 'auth-550e8400-e29b-41d4-a716-446655440000',
    firstLogin: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'user-550e8400-e29b-41d4-a716-446655440001',
    email: 'admin@eldorado.com',
    password: '123456', // Solo para mock
    verified: true,
    authId: 'auth-550e8400-e29b-41d4-a716-446655440001',
    firstLogin: false,
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  }
];

export const profiles: Profile[] = [
  {
    id: 'profile-550e8400-e29b-41d4-a716-446655440000',
    userId: 'user-550e8400-e29b-41d4-a716-446655440000',
    name: 'Juan Carlos',
    lastname: 'García Pérez',
    dni: '1234567890',
    personalPhoneNumber: '+57 300 123-4567',
    photo: 'https://i.pravatar.cc/150?u=juan.garcia'
  },
  {
    id: 'profile-550e8400-e29b-41d4-a716-446655440001',
    userId: 'user-550e8400-e29b-41d4-a716-446655440001',
    name: 'María Elena',
    lastname: 'Rodríguez López',
    dni: '9876543210',
    personalPhoneNumber: '+57 310 987-6543',
    photo: 'https://i.pravatar.cc/150?u=maria.rodriguez'
  }
];

// ========================================
// 🏷️ BRANDS DATA
// ========================================
export const brands: Brand[] = [
  // TechnoSoft Solutions brands
  { id: 'brand-tech-001', name: 'Samsung', description: 'Electrónicos Samsung', companyId: companies[0].id },
  { id: 'brand-tech-002', name: 'Apple', description: 'Productos Apple', companyId: companies[0].id },
  { id: 'brand-tech-003', name: 'Dell', description: 'Computadores Dell', companyId: companies[0].id },
  { id: 'brand-tech-004', name: 'HP', description: 'Impresoras y laptops HP', companyId: companies[0].id },
  { id: 'brand-tech-005', name: 'Logitech', description: 'Accesorios informáticos', companyId: companies[0].id },
  { id: 'brand-tech-006', name: 'Microsoft', description: 'Software y hardware Microsoft', companyId: companies[0].id },

  // Comercial El Dorado brands
  { id: 'brand-dorado-001', name: 'Nike', description: 'Ropa deportiva Nike', companyId: companies[1].id },
  { id: 'brand-dorado-002', name: 'Adidas', description: 'Calzado y ropa Adidas', companyId: companies[1].id },
  { id: 'brand-dorado-003', name: "Levi's", description: 'Jeans y ropa casual', companyId: companies[1].id },
  { id: 'brand-dorado-004', name: 'Zara', description: 'Moda contemporánea', companyId: companies[1].id },
  { id: 'brand-dorado-005', name: 'H&M', description: 'Moda accesible', companyId: companies[1].id },
  { id: 'brand-dorado-006', name: 'Puma', description: 'Ropa y calzado deportivo', companyId: companies[1].id },
  { id: 'brand-dorado-007', name: 'Under Armour', description: 'Ropa deportiva premium', companyId: companies[1].id },
  { id: 'brand-dorado-008', name: 'Converse', description: 'Calzado urbano', companyId: companies[1].id }
];

// ========================================
// 📂 CATEGORIES DATA
// ========================================
export const categories: Category[] = [
  // TechnoSoft Solutions categories
  { id: 'cat-tech-001', name: 'Smartphones', description: 'Teléfonos inteligentes', companyId: companies[0].id },
  { id: 'cat-tech-002', name: 'Laptops', description: 'Computadores portátiles', companyId: companies[0].id },
  { id: 'cat-tech-003', name: 'Tablets', description: 'Tabletas digitales', companyId: companies[0].id },
  { id: 'cat-tech-004', name: 'Accesorios', description: 'Accesorios tecnológicos', companyId: companies[0].id },
  { id: 'cat-tech-005', name: 'Impresoras', description: 'Equipos de impresión', companyId: companies[0].id },
  { id: 'cat-tech-006', name: 'Monitores', description: 'Pantallas y monitores', companyId: companies[0].id },
  { id: 'cat-tech-007', name: 'Software', description: 'Licencias de software', companyId: companies[0].id },
  { id: 'cat-tech-008', name: 'Gaming', description: 'Equipos para gaming', companyId: companies[0].id },

  // Comercial El Dorado categories
  { id: 'cat-dorado-001', name: 'Camisetas', description: 'Camisetas para hombre y mujer', companyId: companies[1].id },
  { id: 'cat-dorado-002', name: 'Pantalones', description: 'Pantalones y jeans', companyId: companies[1].id },
  { id: 'cat-dorado-003', name: 'Calzado Deportivo', description: 'Zapatos para deporte', companyId: companies[1].id },
  { id: 'cat-dorado-004', name: 'Calzado Casual', description: 'Zapatos para uso diario', companyId: companies[1].id },
  { id: 'cat-dorado-005', name: 'Chaquetas', description: 'Chaquetas y abrigos', companyId: companies[1].id },
  { id: 'cat-dorado-006', name: 'Vestidos', description: 'Vestidos para mujer', companyId: companies[1].id },
  {
    id: 'cat-dorado-007',
    name: 'Ropa Interior',
    description: 'Ropa interior para ambos géneros',
    companyId: companies[1].id
  },
  { id: 'cat-dorado-008', name: 'Accesorios', description: 'Cinturones, gorras, etc.', companyId: companies[1].id },
  { id: 'cat-dorado-009', name: 'Ropa de Baño', description: 'Trajes de baño', companyId: companies[1].id },
  { id: 'cat-dorado-010', name: 'Pijamas', description: 'Ropa para dormir', companyId: companies[1].id }
];

// ========================================
// 🛍️ PRODUCTS DATA
// ========================================
export const products: Product[] = [
  // TechnoSoft Solutions products
  {
    id: 'prod-tech-001',
    name: 'Samsung Galaxy S24',
    description: 'Smartphone premium con cámara de 200MP y 5G',
    barCode: '8806094758801',
    images: [
      'https://images.samsung.com/is/image/samsung/p6pim/co/2401/gallery/co-galaxy-s24-s928-sm-s928bzkcltc-thumb-539573043',
      'https://images.samsung.com/is/image/samsung/p6pim/co/2401/gallery/co-galaxy-s24-s928-sm-s928bzkcltc-thumb-539573044'
    ],
    typeProduct: '1',
    taxesOption: 19,
    sku: 'SAM-S24-128GB',
    priceSale: 330000000, // $3,300,000 en centavos
    priceBase: 280000000, // $2,800,000 en centavos
    companyId: companies[0].id,
    categoryId: 'cat-tech-001',
    brandId: 'brand-tech-001',
    state: true,
    sellInNegative: false
  },
  {
    id: 'prod-tech-002',
    name: 'MacBook Pro 14"',
    description: 'Laptop profesional con chip M3 Pro y pantalla Liquid Retina XDR',
    barCode: '194253439653',
    images: [
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310',
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310_2'
    ],
    typeProduct: '1',
    taxesOption: 19,
    sku: 'APPLE-MBP14-512GB',
    priceSale: 870000000, // $8,700,000 en centavos
    priceBase: 740000000, // $7,400,000 en centavos
    companyId: companies[0].id,
    categoryId: 'cat-tech-002',
    brandId: 'brand-tech-002',
    state: true,
    sellInNegative: false
  },
  {
    id: 'prod-tech-003',
    name: 'Dell XPS 13',
    description: 'Ultrabook compacta con procesador Intel Core i7 de 13ª generación',
    barCode: '884116488051',
    images: [
      'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/13-9315/media-gallery/xps-13-9315-nt-blue-gallery-1.psd',
      'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/13-9315/media-gallery/xps-13-9315-nt-blue-gallery-2.psd'
    ],
    typeProduct: '1',
    taxesOption: 19,
    sku: 'DELL-XPS13-256GB',
    priceSale: 450000000, // $4,500,000 en centavos
    priceBase: 380000000, // $3,800,000 en centavos
    companyId: companies[0].id,
    categoryId: 'cat-tech-002',
    brandId: 'brand-tech-003',
    state: true,
    sellInNegative: false
  },
  {
    id: 'prod-tech-004',
    name: 'iPad Pro 12.9"',
    description: 'Tablet profesional con chip M2 y pantalla Liquid Retina XDR',
    barCode: '194253436954',
    images: [
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spacegray-202210',
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spacegray-202210_2'
    ],
    typeProduct: '1',
    taxesOption: 19,
    sku: 'APPLE-IPADPRO-256GB',
    priceSale: 520000000, // $5,200,000 en centavos
    priceBase: 440000000, // $4,400,000 en centavos
    companyId: companies[0].id,
    categoryId: 'cat-tech-003',
    brandId: 'brand-tech-002',
    state: true,
    sellInNegative: false
  },
  {
    id: 'prod-tech-005',
    name: 'Logitech MX Master 3S',
    description: 'Mouse inalámbrico premium para productividad',
    barCode: '097855171313',
    images: [
      'https://resource.logitechg.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png',
      'https://resource.logitechg.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/mx-master-3s/gallery/mx-master-3s-mouse-3-4-view-graphite.png'
    ],
    typeProduct: '1',
    taxesOption: 19,
    sku: 'LOGI-MXMASTER3S',
    priceSale: 38000000, // $380,000 en centavos
    priceBase: 32000000, // $320,000 en centavos
    companyId: companies[0].id,
    categoryId: 'cat-tech-004',
    brandId: 'brand-tech-005',
    state: true,
    sellInNegative: false
  },

  // Comercial El Dorado products
  {
    id: 'prod-dorado-001',
    name: 'Camiseta Nike Dri-FIT',
    description: 'Camiseta deportiva con tecnología Dri-FIT para absorber la humedad',
    barCode: '193151853585',
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/61b4738c-f3b3-44c1-87b3-6e7c8f0e0a0e/dri-fit-academy-mens-short-sleeve-top-FjKmrD.png',
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/ab2f8b78-6a90-4db4-a7e4-0b1a8e0e0e0e/dri-fit-academy-mens-short-sleeve-top-FjKmrD.png'
    ],
    typeProduct: '2',
    taxesOption: 19,
    sku: 'NIKE-DRIFIT-M',
    priceSale: 12000000, // $120,000 en centavos
    priceBase: 8000000, // $80,000 en centavos
    companyId: companies[1].id,
    categoryId: 'cat-dorado-001',
    brandId: 'brand-dorado-001',
    state: true,
    sellInNegative: false
  },
  {
    id: 'prod-dorado-002',
    name: "Jeans Levi's 501",
    description: 'Jeans clásicos de corte recto, 100% algodón',
    barCode: '5400537040236',
    images: [
      'https://lsco.scene7.com/is/image/lsco/005010114-front-pdp-lse',
      'https://lsco.scene7.com/is/image/lsco/005010114-back-pdp-lse'
    ],
    typeProduct: '2',
    taxesOption: 19,
    sku: 'LEVIS-501-32x32',
    priceSale: 35000000, // $350,000 en centavos
    priceBase: 25000000, // $250,000 en centavos
    companyId: companies[1].id,
    categoryId: 'cat-dorado-002',
    brandId: 'brand-dorado-003',
    state: true,
    sellInNegative: false
  },
  {
    id: 'prod-dorado-003',
    name: 'Zapatillas Nike Air Max 270',
    description: 'Zapatillas con amortiguación Air Max para uso diario',
    barCode: '193151853592',
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/zwxes8uud05gof1oj1bb/air-max-270-mens-shoes-KkLcGR.png',
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/jm5dk0w7cxtqwt2b4x1c/air-max-270-mens-shoes-KkLcGR.png'
    ],
    typeProduct: '2',
    taxesOption: 19,
    sku: 'NIKE-AIRMAX270-42',
    priceSale: 55000000, // $550,000 en centavos
    priceBase: 40000000, // $400,000 en centavos
    companyId: companies[1].id,
    categoryId: 'cat-dorado-003',
    brandId: 'brand-dorado-001',
    state: true,
    sellInNegative: false
  }
];

// ========================================
// 🏪 WAREHOUSES DATA
// ========================================
export const warehouses: Warehouse[] = [
  // TechnoSoft Solutions warehouses
  {
    id: 'warehouse-tech-001',
    name: 'Bodega Principal Medellín',
    address: 'Carrera 45 #12-34, Medellín',
    phoneNumber: '+57 4 444-5678',
    main: true,
    companyId: companies[0].id,
    locationId: 1001, // Medellín
    description: 'Almacén principal con inventario completo'
  },
  {
    id: 'warehouse-tech-002',
    name: 'PDV Centro Comercial',
    address: 'Centro Comercial El Tesoro, Local 205',
    phoneNumber: '+57 4 444-5679',
    main: false,
    companyId: companies[0].id,
    locationId: 1001, // Medellín
    description: 'Punto de venta en centro comercial'
  },

  // Comercial El Dorado warehouses
  {
    id: 'warehouse-dorado-001',
    name: 'Almacén Central Bogotá',
    address: 'Calle 93 #15-20, Bogotá D.C.',
    phoneNumber: '+57 1 555-9999',
    main: true,
    companyId: companies[1].id,
    locationId: 2001, // Bogotá D.C.
    description: 'Centro de distribución principal'
  },
  {
    id: 'warehouse-dorado-002',
    name: 'Tienda Zona Rosa',
    address: 'Carrera 13 #85-32, Bogotá D.C.',
    phoneNumber: '+57 1 555-9998',
    main: false,
    companyId: companies[1].id,
    locationId: 2001, // Bogotá D.C.
    description: 'Tienda en zona comercial'
  },
  {
    id: 'warehouse-dorado-003',
    name: 'Outlet Soacha',
    address: 'Calle 18 #5-45, Soacha',
    phoneNumber: '+57 1 555-9997',
    main: false,
    companyId: companies[1].id,
    locationId: 2002, // Soacha
    description: 'Tienda outlet con precios especiales'
  }
];

// ========================================
// 📦 STOCKS DATA
// ========================================
export const stocks: Stock[] = [
  // TechnoSoft stocks
  { id: 'stock-001', productId: 'prod-tech-001', warehouseId: 'warehouse-tech-001', quantity: 15, minQuantity: 5 },
  { id: 'stock-002', productId: 'prod-tech-001', warehouseId: 'warehouse-tech-002', quantity: 3, minQuantity: 2 },
  { id: 'stock-003', productId: 'prod-tech-002', warehouseId: 'warehouse-tech-001', quantity: 8, minQuantity: 3 },
  { id: 'stock-004', productId: 'prod-tech-003', warehouseId: 'warehouse-tech-001', quantity: 12, minQuantity: 4 },
  { id: 'stock-005', productId: 'prod-tech-004', warehouseId: 'warehouse-tech-001', quantity: 6, minQuantity: 2 },
  { id: 'stock-006', productId: 'prod-tech-005', warehouseId: 'warehouse-tech-001', quantity: 25, minQuantity: 10 },
  { id: 'stock-007', productId: 'prod-tech-005', warehouseId: 'warehouse-tech-002', quantity: 8, minQuantity: 3 },

  // Comercial El Dorado stocks
  { id: 'stock-008', productId: 'prod-dorado-001', warehouseId: 'warehouse-dorado-001', quantity: 50, minQuantity: 15 },
  { id: 'stock-009', productId: 'prod-dorado-001', warehouseId: 'warehouse-dorado-002', quantity: 20, minQuantity: 8 },
  { id: 'stock-010', productId: 'prod-dorado-002', warehouseId: 'warehouse-dorado-001', quantity: 30, minQuantity: 10 },
  { id: 'stock-011', productId: 'prod-dorado-002', warehouseId: 'warehouse-dorado-003', quantity: 15, minQuantity: 5 },
  { id: 'stock-012', productId: 'prod-dorado-003', warehouseId: 'warehouse-dorado-001', quantity: 40, minQuantity: 12 },
  { id: 'stock-013', productId: 'prod-dorado-003', warehouseId: 'warehouse-dorado-002', quantity: 18, minQuantity: 6 }
];

// ========================================
// 📞 CONTACT IDENTITIES & CONTACTS
// ========================================
export const contactIdentities: ContactIdentity[] = [
  // TechnoSoft contacts
  { id: 1001, typeDocument: 13, typePerson: 1, number: 1234567890, dv: 5 },
  { id: 1002, typeDocument: 13, typePerson: 1, number: 9876543210, dv: 8 },
  { id: 1003, typeDocument: 31, typePerson: 2, number: 900123456, dv: 1 },

  // Comercial El Dorado contacts
  { id: 2001, typeDocument: 13, typePerson: 1, number: 1111222233, dv: 2 },
  { id: 2002, typeDocument: 13, typePerson: 1, number: 4444555566, dv: 7 },
  { id: 2003, typeDocument: 31, typePerson: 2, number: 900789123, dv: 4 }
];

export const contacts: Contact[] = [
  // TechnoSoft contacts
  {
    id: 1001,
    name: 'Carlos',
    lastname: 'Martínez',
    email: 'carlos.martinez@email.com',
    address: 'Calle 10 #20-30',
    phoneNumber: '+57 300 111-2233',
    type: 1,
    identityId: 1001,
    companyId: companies[0].id,
    townId: 1001
  },
  {
    id: 1002,
    name: 'Ana',
    lastname: 'Rodríguez',
    email: 'ana.rodriguez@email.com',
    address: 'Carrera 70 #45-12',
    phoneNumber: '+57 310 444-5566',
    type: 1,
    identityId: 1002,
    companyId: companies[0].id,
    townId: 1002
  },
  {
    id: 1003,
    name: 'Empresa',
    lastname: 'TechCorp SAS',
    email: 'contacto@techcorp.com',
    address: 'Zona Franca #123',
    phoneNumber: '+57 320 777-8899',
    type: 2,
    identityId: 1003,
    companyId: companies[0].id,
    townId: 1001
  },

  // Comercial El Dorado contacts
  {
    id: 2001,
    name: 'Luis',
    lastname: 'García',
    email: 'luis.garcia@email.com',
    address: 'Calle 85 #12-45',
    phoneNumber: '+57 301 111-4477',
    type: 1,
    identityId: 2001,
    companyId: companies[1].id,
    townId: 2001
  },
  {
    id: 2002,
    name: 'Patricia',
    lastname: 'López',
    email: 'patricia.lopez@email.com',
    address: 'Carrera 15 #67-89',
    phoneNumber: '+57 311 222-5588',
    type: 1,
    identityId: 2002,
    companyId: companies[1].id,
    townId: 2002
  },
  {
    id: 2003,
    name: 'Distribuidora',
    lastname: 'Norte SAS',
    email: 'ventas@disnorte.com',
    address: 'Autopista Norte Km 15',
    phoneNumber: '+57 321 333-6699',
    type: 2,
    identityId: 2003,
    companyId: companies[1].id,
    townId: 2003
  }
];

// ========================================
// 🧾 INVOICES DATA
// ========================================
export const invoiceCustomers: InvoiceCustomer[] = [
  { id: 'invoice-customer-001' },
  { id: 'invoice-customer-002' },
  { id: 'invoice-customer-003' }
];

export const salesInvoices: SalesInvoice[] = [
  {
    id: 'invoice-001',
    invoiceNumber: 'TECH-001',
    createDate: '2024-08-20T10:30:00Z',
    totalTaxes: 6270000, // $62,700 en centavos (19% de $330,000)
    shipping: 1500000, // $15,000 en centavos
    status: 1,
    method: 'CONTADO',
    paymentTerm: 'INMEDIATO',
    totalAmount: 34770000, // $347,700 en centavos
    currency: 'COP',
    paymentMethod: 'CARD',
    invoiceCustomerId: 'invoice-customer-001',
    companyId: companies[0].id
  },
  {
    id: 'invoice-002',
    invoiceNumber: 'DORADO-001',
    createDate: '2024-08-19T15:45:00Z',
    totalTaxes: 1710000, // $17,100 en centavos
    shipping: 500000, // $5,000 en centavos
    status: 1,
    method: 'CONTADO',
    paymentTerm: 'INMEDIATO',
    totalAmount: 10210000, // $102,100 en centavos
    currency: 'COP',
    paymentMethod: 'CASH',
    invoiceCustomerId: 'invoice-customer-002',
    companyId: companies[1].id
  }
];

export const salesInvoiceItems: SalesInvoiceItem[] = [
  // Items para invoice-001 (TechnoSoft)
  {
    id: 'item-001',
    product: 'Samsung Galaxy S24',
    quantity: 1,
    price: 330000000, // $3,300,000 en centavos
    taxes: 6270000, // 19% en centavos
    total: 330000000, // en centavos
    salesInvoiceId: 'invoice-001',
    productId: 'prod-tech-001'
  },

  // Items para invoice-002 (El Dorado)
  {
    id: 'item-002',
    product: 'Camiseta Nike Dri-FIT',
    quantity: 2,
    price: 12000000, // $120,000 en centavos
    taxes: 456000, // 19% por unidad en centavos
    total: 24000000, // 2 * $120,000 en centavos
    salesInvoiceId: 'invoice-002',
    productId: 'prod-dorado-001'
  },
  {
    id: 'item-003',
    product: 'Zapatillas Nike Air Max 270',
    quantity: 1,
    price: 55000000, // $550,000 en centavos
    taxes: 1045000, // 19% en centavos
    total: 55000000, // en centavos
    salesInvoiceId: 'invoice-002',
    productId: 'prod-dorado-003'
  }
];

// ========================================
// 🚀 RELACIONES USUARIO-EMPRESA
// ========================================
// Mapeo de qué usuarios pertenecen a qué empresas
export const userCompanyRelations = new Map([
  ['user-550e8400-e29b-41d4-a716-446655440000', [companies[0].id]], // Juan Carlos -> TechnoSoft
  ['user-550e8400-e29b-41d4-a716-446655440001', [companies[1].id]] // María Elena -> El Dorado
]);

// ========================================
// 📊 CONTADORES PARA IDs ÚNICOS
// ========================================
export const counters = {
  contactId: 3000,
  contactIdentityId: 3000,
  invoiceNumber: {
    [companies[0].id]: 2, // TECH-002
    [companies[1].id]: 2 // DORADO-002
  }
};
