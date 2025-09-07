// Mock data for AI Chatbot

export const aiChatMessages = [
  {
    id: '1',
    text: '¡Hola! Soy Ally IA, tu asistente virtual de inteligencia artificial. Estoy aquí para ayudarte a tomar mejores decisiones para tu negocio. Puedo responder preguntas sobre ventas, inventario, clientes y generar análisis inteligentes. ¿En qué puedo ayudarte hoy?',
    isBot: true,
    timestamp: new Date(Date.now() - 10000),
    suggestions: [
      '¿Cuál fue mi producto más vendido ayer?',
      'Mostrar inventario actual',
      '¿Qué clientes me deben dinero?',
      'Análisis de productos con baja rotación',
    ],
  },
];

export const aiSuggestions = [
  'Ventas de hoy',
  'Mejor producto',
  'Inventario bajo',
  'Clientes morosos',
  'Reporte mensual',
  'Productos lentos',
];

export const aiCapabilities = [
  {
    icon: 'material-symbols:analytics',
    title: 'Análisis Inteligente',
    description: 'Genero insights profundos analizando múltiples variables de tu negocio',
  },
  {
    icon: 'material-symbols:inventory',
    title: 'Gestión de Inventario',
    description: 'Te ayudo a optimizar tu stock y identificar productos con baja rotación',
  },
  {
    icon: 'material-symbols:trending-up',
    title: 'Predicciones de Ventas',
    description: 'Analizo patrones históricos para predecir tendencias futuras',
  },
  {
    icon: 'material-symbols:recommend',
    title: 'Recomendaciones Personalizadas',
    description: 'Sugiero estrategias específicas basadas en los datos de tu empresa',
  },
];

export const mockAnalysisData = {
  salesData: {
    today: 450000,
    yesterday: 380000,
    thisMonth: 12500000,
    lastMonth: 11800000,
    growth: 15.8,
  },
  topProducts: [
    {
      name: 'Camiseta Polo Azul',
      sales: 15,
      revenue: 450000,
    },
    {
      name: 'Pantalón Jean Clásico',
      sales: 12,
      revenue: 360000,
    },
    {
      name: 'Zapatos Deportivos',
      sales: 8,
      revenue: 320000,
    },
  ],
  slowMovingProducts: [
    {
      name: 'Chaqueta de Invierno',
      daysSinceLastSale: 45,
      stock: 12,
      suggestedDiscount: 20,
    },
    {
      name: 'Zapatos Formales',
      daysSinceLastSale: 30,
      stock: 8,
      suggestedDiscount: 15,
    },
  ],
  debtors: [
    {
      name: 'Distribuidora del Norte S.A.S',
      debt: 2850000,
      daysPastDue: 15,
      invoices: 3,
    },
    {
      name: 'Comercial San José Ltda',
      debt: 1200000,
      daysPastDue: 8,
      invoices: 2,
    },
  ],
  inventory: {
    totalProducts: 1247,
    lowStock: 23,
    outOfStock: 5,
    totalValue: 45600000,
  },
};
