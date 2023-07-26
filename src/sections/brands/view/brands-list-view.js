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
  IconButton,
  useTheme
} from '@mui/material';

// redux
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useTranslation } from 'react-i18next';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import Label from 'src/components/label';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import { enqueueSnackbar } from 'notistack';
import { ProductListView } from 'src/sections/product/view';
import { deleteBrand, getBrands, switchPopupState } from 'src/redux/inventory/brandsSlice';
import MenuBrands from 'src/sections/brands/MenuBrands';
import PopupCreateCategory from '../PopupCreateBrand';
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

  // const theme = useTheme();
  const dispatch = useDispatch();

  // Get categories and get products in brand from API
  useEffect(() => {
    dispatch(getBrands());
  }, [dispatch]);

  const { brands, openPopup } = useSelector((state) => state.brands);

  const [expandedCategories, setExpandedCategories] = useState([]);

  // states for menu options in categories
  const [viewBrand, setViewBrand] = useState(0);

  const menuRef = useRef(null);

  const handleEdit = (brand) => {
    dispatch(switchPopupState(brand));
  };

  const handleDelete = async ({ id }) => {
    console.log(id);
    try {
      dispatch(deleteBrand(id));
      enqueueSnackbar('Categoria eliminada', { variant: 'success' });
    } catch (error) {
      console.log(error);
    }
  };

  const handleView = (brandId) => {
    setViewBrand(brandId);
  };

  const handleClickPopup = () => {
    dispatch(switchPopupState());
  };

  return (
    <>
      <Container ref={componentRef} maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Marcas"
          icon="nimbus:marketing"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Inventario',
              href: paths.dashboard.inventory
            },
            { name: 'Categorias' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
          action={
            <Button
              color="primary"
              variant="contained"
              onClick={handleClickPopup}
              startIcon={<Icon icon="mingcute:add-line" />}
            >
              Crear Marca
            </Button>
          }
        />
        <Grid container spacing={2}>
          <Grid sx={{ height: '100%', position: 'sticky', bottom: '100px', left: 0, top: '60px' }} item xs={12} md={4}>
            <Card>
              {brands.length === 0 ? (
                <Skeleton variant="rectangular" height={400} />
              ) : (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }} component="nav">
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
            <Card sx={{ height: '100%' }}>
              <CardContent>
                {viewBrand === 0 ? (
                  'seleciona una categoria'
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <PopupCreateCategory PaperComponent={PaperComponent} open={openPopup} handleClose={handleClickPopup} />
    </>
  );
}
