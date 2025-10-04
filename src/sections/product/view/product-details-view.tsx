import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// _mock
import { PRODUCT_PUBLISH_OPTIONS } from 'src/_mock';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// api
// components
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
//
import { useGetProductByIdQuery } from 'src/redux/services/productsApi';
import { defaultSettingsInterface } from 'src/components/settings/context/settings-provider';
import { ProductDetailsSkeleton } from '../product-skeleton';
import ProductDetailsSummary from '../product-details-summary';
import ProductDetailsToolbar from '../product-details-toolbar';
import ProductDetailsCarousel from '../product-details-carousel';
import ProductDetailsInventory from '../product-details-view/product-details-inventory';
import ProductDetailsDescription from '../product-details-description';

// ----------------------------------------------------------------------

//

// ----------------------------------------------------------------------
export default function ProductDetailsView({ id }: { id: string }) {
  // ========================================
  // 🔥 RTK QUERY - PRODUCTO DETALLE
  // ========================================

  const {
    data: product,
    isLoading: productsLoading,
    error
  } = useGetProductByIdQuery(id, {
    skip: !id
  });

  const settings: defaultSettingsInterface = useSettingsContext() as defaultSettingsInterface;

  const [currentTab, setCurrentTab] = useState<string>('description');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const renderSkeleton = <ProductDetailsSkeleton />;

  const renderError = (
    <EmptyContent
      filled
      title="Error al cargar el producto"
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.product.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          sx={{ mt: 3 }}
        >
          Volver
        </Button>
      }
      sx={{ py: 10 }}
    />
  );

  const renderProduct = product && (
    <>
      <ProductDetailsToolbar
        id={product.id}
        backLink={paths.dashboard.product.root}
        editLink={paths.dashboard.product.edit(`${product?.id}`)}
        liveLink={paths.dashboard.product.details(`${product?.id}`)}
        publishOptions={PRODUCT_PUBLISH_OPTIONS}
        stateProduct={!!product.state}
      />
      <Card sx={{ p: 3 }}>
        <Grid container spacing={{ xs: 3, md: 5, lg: 8 }}>
          <Grid xs={12} md={4} lg={4}>
            <ProductDetailsCarousel product={product} />
          </Grid>

          <Grid xs={12} md={8} lg={8}>
            <ProductDetailsSummary product={product} />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mt: 2 }}>
        <Typography mb={1} variant="h5">
          Inventario
        </Typography>
        <ProductDetailsInventory product={product} />
      </Card>
      {product.description && (
        <Card sx={{ p: 3, mt: 2 }}>
          <Typography mb={1} variant="h5">
            Descripción
          </Typography>
          <ProductDetailsDescription description={product?.description} />
        </Card>
      )}

      <Card sx={{ mt: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            px: 3,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`
          }}
        >
          {[
            {
              value: 'description',
              label: 'Inventario'
            },
            {
              value: 'reviews',
              label: `Facturas`
            },
            {
              value: 'reviews',
              label: `Contabilidad`
            },
            {
              value: 'reviews',
              label: `Historial`
            }
          ].map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {currentTab === 'description' && null}
      </Card>
    </>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {productsLoading && renderSkeleton}

      {error && renderError}

      {product && !productsLoading && renderProduct}
    </Container>
  );
}

ProductDetailsView.propTypes = {
  id: PropTypes.string
};
