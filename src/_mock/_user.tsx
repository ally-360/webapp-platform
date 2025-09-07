// assets
import { countries } from 'src/assets/data';
//
import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const USER_STATUS_OPTIONS = [
  { value: 1, label: 'Clientes' },
  { value: 2, label: 'Proveedores' }
];

export const _userAbout = {
  id: _mock.id(1),
  role: _mock.role(1),
  email: _mock.email(1),
  country: countries[1].label,
  school: _mock.companyName(2),
  company: _mock.companyName(1),
  coverUrl: _mock.image.cover(3),
  totalFollowers: _mock.number.nativeL(1),
  totalFollowing: _mock.number.nativeL(2),
  quote: 'Tart I love sugar plum I love oat cake. Sweet roll caramels I love jujubes. Topping cake wafer..',
  socialLinks: {
    facebook: `https://www.facebook.com/caitlyn.kerluke`,
    instagram: `https://www.instagram.com/caitlyn.kerluke`,
    linkedin: `https://www.linkedin.com/in/caitlyn.kerluke`,
    twitter: `https://www.twitter.com/caitlyn.kerluke`
  }
};

export const _userFollowers = [...Array(18)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  country: countries[index + 1].label,
  avatarUrl: _mock.image.avatar(index)
}));

export const _userFriends = [...Array(18)].map((_, index) => ({
  id: _mock.id(index),
  role: _mock.role(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index)
}));

export const _userGallery = [...Array(12)].map((_, index) => ({
  id: _mock.id(index),
  postedAt: _mock.time(index),
  title: _mock.postTitle(index),
  imageUrl: _mock.image.cover(index)
}));

export const _userFeeds = [...Array(3)].map((_, index) => ({
  id: _mock.id(index),
  createdAt: _mock.time(index),
  media: _mock.image.travel(index + 1),
  message: _mock.sentence(index),
  personLikes: [...Array(20)].map((__, personIndex) => ({
    name: _mock.fullName(personIndex),
    avatarUrl: _mock.image.avatar(personIndex + 2)
  })),
  comments: (index === 2 && []) || [
    {
      id: _mock.id(7),
      author: {
        id: _mock.id(8),
        avatarUrl: _mock.image.avatar(index + 5),
        name: _mock.fullName(index + 5)
      },
      createdAt: _mock.time(2),
      message: 'Praesent venenatis metus at'
    },
    {
      id: _mock.id(9),
      author: {
        id: _mock.id(10),
        avatarUrl: _mock.image.avatar(index + 6),
        name: _mock.fullName(index + 6)
      },
      createdAt: _mock.time(3),
      message:
        'Etiam rhoncus. Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam. Sed lectus.'
    }
  ]
}));

export const _userCards = [...Array(21)].map((_, index) => ({
  id: _mock.id(index),
  role: _mock.role(index),
  name: _mock.fullName(index),
  coverUrl: _mock.image.cover(index),
  avatarUrl: _mock.image.avatar(index),
  totalFollowers: _mock.number.nativeL(index),
  totalPosts: _mock.number.nativeL(index + 2),
  totalFollowing: _mock.number.nativeL(index + 1)
}));

export const _userPayment = [...Array(3)].map((_, index) => ({
  id: _mock.id(index),
  cardNumber: ['**** **** **** 1234', '**** **** **** 5678', '**** **** **** 7878'][index],
  cardType: ['mastercard', 'visa', 'visa'][index],
  primary: index === 1
}));

export const _userAddressBook = [...Array(4)].map((_, index) => ({
  id: _mock.id(index),
  primary: index === 0,
  name: _mock.fullName(index),
  phoneNumber: _mock.phoneNumber(index),
  fullAddress: _mock.fullAddress(index),
  addressType: (index === 0 && 'Home') || 'Office'
}));

export const _userInvoices = [...Array(10)].map((_, index) => ({
  id: _mock.id(index),
  invoiceNumber: `INV-199${index}`,
  createdAt: _mock.time(index),
  price: _mock.number.price(index)
}));

export const _userPlans = [
  {
    subscription: 'ally-kickstart',
    price: 50000,
    primary: false,
    name: 'Ally Kickstart',
    description: 'Ideal para microempresas que apenas comienzan en la digitalización',
    features: [
      'Límite de 200 facturas electrónicas al mes',
      '2 usuarios incluidos (Administrador y Contador)',
      'Inventario básico (1 bodega)',
      'Terminal POS para ventas simples',
      'Soporte vía chat estándar'
    ]
  },
  {
    subscription: 'ally-boost',
    price: 75000,
    primary: true,
    name: 'Ally Boost',
    description: 'Para pequeñas empresas en crecimiento (Recomendado)',
    features: [
      'Límite de 600 facturas electrónicas al mes',
      'Hasta 5 usuarios incluidos (todos los roles)',
      'Hasta 3 bodegas + traslados de inventario',
      'POS avanzado',
      'Chatbot IA Ally',
      'Soporte prioritario',
      'Envío de facturas por WhatsApp',
      'Almacenamiento ampliado'
    ]
  },
  {
    subscription: 'ally-supreme',
    price: 116000,
    primary: false,
    name: 'Ally Supreme',
    description: 'Para empresas medianas o en expansión con operaciones complejas',
    features: [
      'Facturación electrónica ilimitada',
      'Hasta 10 usuarios incluidos (todos los roles)',
      'Hasta 10 bodegas, traslados entre ellas',
      'Terminal POS completo',
      'Chatbot IA',
      'Envío masivo de facturas por WhatsApp',
      'Almacenamiento de mayor capacidad',
      'Soporte personalizado + onboarding'
    ]
  }
];

export const _userList = [...Array(20)].map((_, index) => ({
  id: _mock.id(index),
  zipCode: '85807',
  state: 'Virginia',
  city: 'Rancho Cordova',
  role: _mock.role(index),
  municipio: {
    name: 'Town of Colombia 2 ',
    id: 'aff7027c-2a62-11ee-8003-7085c296afc1'
  },
  email: _mock.email(index),
  address: '908 Jack Locks',
  name: _mock.fullName(index),
  isVerified: _mock.boolean(index),
  company: _mock.companyName(index),
  country: countries[index + 1].label,
  avatarUrl: _mock.image.avatar(index),
  phoneNumber: _mock.phoneNumber(index),
  status: (index % 2 && 'customers') || (index % 3 && 'providers') || 'providers'
}));
