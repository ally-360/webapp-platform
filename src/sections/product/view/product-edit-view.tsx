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
import { useDispatch, useSelector } from 'react-redux';
import { getProductById } from 'src/redux/inventory/productsSlice';
import { useEffect } from 'react';
import ProductNewEditForm from '../product-new-edit-form';

// ----------------------------------------------------------------------

export default function ProductEditView({ id }) {
  const settings = useSettingsContext();

  // const { product: currentProduct } = useGetProduct(id);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProductById(id));
  }, [dispatch, id]);

  const { product: currentProduct } = useSelector((state) => state.products);

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
          { name: currentProduct?.name }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <ProductNewEditForm currentProduct={currentProduct} />
    </Container>
  );
}

ProductEditView.propTypes = {
  id: PropTypes.string
};
