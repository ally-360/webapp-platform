import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// api
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetProductByIdQuery } from 'src/redux/services/productsApi';
import ProductNewEditForm from '../product-new-edit-form';

// ----------------------------------------------------------------------

interface ProductEditViewProps {
  id: string;
}

export default function ProductEditView({ id }: ProductEditViewProps) {
  const settings = useSettingsContext();

  // ========================================
  // 🔥 RTK QUERY - PRODUCTO PARA EDITAR
  // ========================================

  const {
    data: currentProduct,
    isLoading,
    error
  } = useGetProductByIdQuery(id, {
    skip: !id
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Product',
            href: paths.dashboard.product.root
          },
          { name: currentProduct?.name || 'Producto' }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      {!isLoading && currentProduct && <ProductNewEditForm currentProduct={currentProduct} />}

      {isLoading && <div>Cargando producto...</div>}

      {error && <div>Error al cargar el producto</div>}
    </Container>
  );
}

ProductEditView.propTypes = {
  id: PropTypes.string.isRequired
};
