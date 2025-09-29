import { Icon } from '@iconify/react';
import React, { useState, useRef, Fragment } from 'react';

// material
import {
  Card,
  Button,
  Container,
  Typography,
  Grid,
  Skeleton,
  CardContent,
  Divider,
  ListItem,
  useTheme,
  Alert,
  AlertTitle,
  useMediaQuery
} from '@mui/material';

// redux
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
// eslint-disable-next-line import/no-extraneous-dependencies
import { enqueueSnackbar } from 'notistack';
import { ProductListView } from 'src/sections/product/view';

// RTK Query
import { useGetBrandsQuery, useGetBrandByIdQuery, useDeleteBrandMutation } from 'src/redux/services/brandsApi';

// Redux Legacy (para compatibilidad con el estado del popup)
import { switchPopupState } from 'src/redux/inventory/brandsSlice';

import MenuBrands from 'src/sections/brands/MenuBrands';
import { useAppDispatch } from 'src/hooks/store';
// utils

// hooks

export default function InventoryBrandsList() {
  const settings = useSettingsContext();
  const componentRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const dispatch = useAppDispatch();

  // RTK Query hooks
  const { data: brands = [], isLoading } = useGetBrandsQuery();
  const [deleteBrand] = useDeleteBrandMutation();

  const brandsEmpty = brands.length === 0;

  // states for menu options in brands
  const [viewBrand, setViewBrand] = useState<string>('');

  // RTK Query para obtener marca específica
  const { data: viewBrandById, isLoading: viewBrandByIdLoading } = useGetBrandByIdQuery(viewBrand, {
    skip: !viewBrand
  });

  const menuRef = useRef(null);

  const handleEdit = (brand: any) => {
    dispatch(switchPopupState(brand));
  };

  const handleDelete = async ({ id }: { id: string }) => {
    try {
      setViewBrand('');
      await deleteBrand(id).unwrap();
      enqueueSnackbar('Marca eliminada', { variant: 'success' });
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      enqueueSnackbar(error?.data?.detail || 'Error eliminando marca', { variant: 'error' });
    }
  };

  const handleView = (brandId: string) => {
    setViewBrand(brandId);
  };

  const handleClickPopup = () => {
    dispatch(switchPopupState(false));
  };

  return (
    <Container ref={componentRef} maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Marcas"
        icon="nimbus:marketing"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Inventario',
            href: paths.dashboard.inventory.list
          },
          { name: 'Categorias' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
        action={
          <Button
            color="primary"
            variant="contained"
            sx={isMobile ? { width: '100%' } : undefined}
            onClick={handleClickPopup}
            startIcon={<Icon icon="mingcute:add-line" />}
          >
            Crear Marca
          </Button>
        }
      />
      {brandsEmpty && (
        <Grid mb={2} container spacing={2}>
          <Grid item xs={12} md={12}>
            <Alert severity="info">
              <AlertTitle>Crea una marca</AlertTitle>
              Puedes crear una marca dando click en el botón superior derecho <strong>&quot;Crear marca&quot;</strong>
            </Alert>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        <Grid sx={{ height: '100%', position: 'sticky', bottom: '100px', left: 0, top: '60px' }} item xs={12} md={4}>
          <Card>
            {isLoading && <Skeleton variant="rectangular" height={400} />}
            {!isLoading && (
              <List sx={{ width: '100%', bgcolor: 'background.paper', minHeight: '200px' }} component="nav">
                {brands.map((brand) => (
                  <Fragment key={brand.id}>
                    <ListItem
                      secondaryAction={
                        <MenuBrands
                          handleEdit={handleEdit}
                          handleDelete={handleDelete}
                          handleView={handleView}
                          view={viewBrand}
                          element={brand}
                        />
                      }
                      disablePadding
                      style={{
                        backgroundColor: viewBrand === brand.id ? '#D6E2F5' : 'white',
                        color: viewBrand === brand.id ? theme.palette.primary.dark : '#212121'
                      }}
                    >
                      <ListItemButton
                        sx={{ padding: 1.5, paddingLeft: 2 }}
                        onClick={() => handleView(brand.id)}
                        ref={menuRef}
                      >
                        <ListItemText
                          sx={{
                            span: {
                              fontWeight: 500
                            }
                          }}
                        >
                          {brand.name}
                        </ListItemText>
                      </ListItemButton>
                    </ListItem>
                  </Fragment>
                ))}
              </List>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          {isLoading && <Skeleton variant="rectangular" height={400} />}
          {!viewBrand && !isLoading && (
            <Card sx={{ height: '100%' }}>
              <CardContent>{brandsEmpty ? '' : 'Seleciona una marca para visualizarla'}</CardContent>
            </Card>
          )}
          {viewBrand && !viewBrandByIdLoading && viewBrandById && !brandsEmpty && (
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <Typography variant="h5" sx={{ mb: 3 }}>
                      {viewBrandById.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                      <strong>Descripción: </strong>
                      {viewBrandById.description || 'Sin descripción'}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Productos asociados
                </Typography>
                <ProductListView categoryView={viewBrandById} />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
