// routes
import { paths } from 'src/routes/paths';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navConfig = [
  {
    title: 'Home',
    icon: <Iconify icon="solar:home-2-bold-duotone" />,
    path: '/'
  },
  {
    title: 'Planes',
    icon: <Iconify icon="solar:atom-bold-duotone" />,
    path: paths.pricing
  },
  {
    title: 'Nosotros',
    icon: <Iconify icon="solar:users-bold-duotone" />,
    path: paths.about
  },
  {
    title: 'Contacto',
    icon: <Iconify icon="solar:chat-bold-duotone" />,
    path: paths.contact
  },
  {
    title: 'Documentación',
    path: '/docs',
    icon: <Iconify icon="solar:file-bold-duotone" />,
    children: [
      {
        subheader: 'Concepts',
        items: [
          { title: 'Shop', path: paths.product.root },
          { title: 'Product', path: paths.product.demo.details },
          { title: 'Checkout', path: paths.product.checkout },
          { title: 'Posts', path: paths.post.root },
          { title: 'Post', path: paths.post.demo.details }
        ]
      },
      {
        subheader: 'Error',
        items: [
          { title: 'Page 403', path: paths.page403 },
          { title: 'Page 404', path: paths.page404 },
          { title: 'Page 500', path: paths.page500 }
        ]
      },
      {
        subheader: 'Dashboard',
        items: [{ title: 'Dashboard', path: PATH_AFTER_LOGIN }]
      }
    ]
  }
];
