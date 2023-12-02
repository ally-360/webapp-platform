/* eslint-disable no-nested-ternary */
import { Icon } from '@iconify/react';
import { useState, useEffect, React, useRef, Fragment } from 'react';

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
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import { enqueueSnackbar } from 'notistack';
import { ProductListView } from 'src/sections/product/view';
import { deleteBrand, getBrands, switchPopupState } from 'src/redux/inventory/brandsSlice';
import MenuBrands from 'src/sections/brands/MenuBrands';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
// utils

// hooks

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export default function InventoryBrandsList() {
  const settings = useSettingsContext();
  const componentRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // const theme = useTheme();
  const dispatch = useAppDispatch();

  // Get categories and get products in brand from API
  useEffect(() => {
    dispatch(getBrands());
  }, [dispatch]);

  const { brands, openPopup, isLoading, brandsEmpty } = useAppSelector((state) => state.brands);

  const [expandedCategories, setExpandedCategories] = useState([]);

  // states for menu options in categories
  const [viewBrand, setViewBrand] = useState(false);

  const menuRef = useRef(null);

  const handleEdit = (brand) => {
    dispatch(switchPopupState(brand));
  };

  const handleDelete = async ({ id }) => {
    try {
      setViewBrand(0);
      dispatch(deleteBrand({ id }));
      enqueueSnackbar('Marca elimina', { variant: 'success' });
    } catch (error) {
      console.log(error);
    }
  };

  const handleView = (brandId) => {
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
            sx={isMobile && { width: '100%' }}
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
              Puedes crear una marca dando click en el botón superior derecho <strong>"Crear marca"</strong>
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
                        backgroundColor:
                          viewBrand === brand.id
                            ? '#D6E2F5'
                            : expandedCategories.includes(brand.id)
                            ? '#E3F2FD'
                            : 'white',
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
          {viewBrand === 0 && !isLoading && (
            <Card sx={{ height: '100%' }}>
              <CardContent>{brandsEmpty ? '' : 'Seleciona una marca para visualizarla'}</CardContent>
            </Card>
          )}
          {viewBrand !== 0 && !isLoading && !brandsEmpty && (
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <Typography variant="h5" sx={{ mb: 3 }}>
                      {brands.find((brand) => brand.id === viewBrand).name}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Productos asociados
                </Typography>
                <ProductListView categoryView={brands.find((brand) => brand.id === viewBrand)} />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
