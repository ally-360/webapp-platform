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
  useTheme,
  AlertTitle,
  Alert
} from '@mui/material';

// redux
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useTranslation } from 'react-i18next';
import {
  deleteCategory,
  getCategories,
  getViewCategoryById,
  switchPopupState
} from 'src/redux/inventory/categoriesSlice';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import Label from 'src/components/label';
import MenuCategories from 'src/sections/categories/MenuCategories';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import { enqueueSnackbar } from 'notistack';
import { ProductListView } from 'src/sections/product/view';
import PopupCreateCategory from '../PopupCreateCategory';
import RequestService from '../../../axios/services/service';
// utils

// hooks

export default function InvetoryCategoriesList() {
  const settings = useSettingsContext();
  const componentRef = useRef();
  const theme = useTheme();

  // const theme = useTheme();
  const dispatch = useDispatch();
  const { categories, openPopup, isEmpty, isLoading, viewCategoryById, viewCategoryByIdLoading } = useSelector(
    (state) => state.categories
  );

  // Get categories and get products in category from API
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const [expandedCategories, setExpandedCategories] = useState([]);

  // states for menu options in categories
  const [viewCategory, setViewCategory] = useState(0);

  // const [viewCategoryInfo, setViewCategoryInfo] = useState({});

  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (viewCategory !== 0) {
      dispatch(getViewCategoryById(viewCategory));
    }
  }, [viewCategory, dispatch]);

  const { products } = useSelector((state) => state.categories);

  const menuRef = useRef(null);

  const handleEdit = (category) => {
    dispatch(switchPopupState(category));
  };

  const handleDelete = async ({ id }) => {
    try {
      setViewCategory(0);
      dispatch(deleteCategory(id));
      enqueueSnackbar('Categoria eliminada', { variant: 'success' });
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = (categoryId) => {
    const isExpanded = expandedCategories.includes(categoryId);
    if (isExpanded) {
      setExpandedCategories(expandedCategories.filter((id) => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const handleView = (categoryId) => {
    setViewCategory(categoryId);
  };

  const handleClickPopup = () => {
    dispatch(switchPopupState());
  };

  return (
    <Container ref={componentRef} maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Categorias"
        icon="carbon:category"
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
            Crear categoria
          </Button>
        }
      />

      {isEmpty && (
        <Grid mb={2} container spacing={2}>
          <Grid item xs={12} md={12}>
            <Alert severity="info">
              <AlertTitle>Crea una categoria</AlertTitle>
              Puedes crear una categoria dando click en el botón superior derecho
              <strong>&quot;Crear categoria&quot;</strong>
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
                {categories.map(
                  (category) =>
                    category.categoryMainCategory === null && (
                      <Fragment key={category.id}>
                        <ListItem
                          disablePadding
                          secondaryAction={
                            <>
                              {category.subcategories.length > 0 ? (
                                expandedCategories.includes(category.id) ? (
                                  <IconButton color="primary" onClick={() => handleClick(category.id)}>
                                    <Icon width={20} height={20} icon="eva:arrow-ios-upward-fill" />
                                  </IconButton>
                                ) : (
                                  <IconButton onClick={() => handleClick(category.id)}>
                                    <Icon width={20} height={20} icon="eva:arrow-ios-downward-fill" />
                                  </IconButton>
                                )
                              ) : null}
                              <MenuCategories
                                element={category}
                                handleEdit={handleEdit}
                                handleView={handleView}
                                handleDelete={handleDelete}
                              />
                            </>
                          }
                        >
                          <ListItemButton
                            sx={{ padding: 1.5, paddingLeft: 2 }}
                            onClick={() => handleView(category.id)}
                            ref={menuRef}
                          >
                            <ListItemText
                              sx={{
                                span: {
                                  fontWeight: 500
                                }
                              }}
                            >
                              {category.name}
                            </ListItemText>
                          </ListItemButton>
                        </ListItem>

                        {category.subcategories.length > 0 && (
                          <Collapse
                            key={`collapse-${category.id}`}
                            in={expandedCategories.includes(category.id)}
                            timeout="auto"
                            unmountOnExit
                          >
                            <List component="div" disablePadding>
                              {category.subcategories.map((subcategory) => (
                                <ListItem
                                  disablePadding
                                  secondaryAction={
                                    <MenuCategories
                                      element={subcategory}
                                      handleEdit={handleEdit}
                                      handleView={handleView}
                                      handleDelete={handleDelete}
                                    />
                                  }
                                >
                                  <ListItemButton
                                    onClick={() => handleView(subcategory.id)}
                                    sx={{ pl: 4 }}
                                    key={subcategory.id}
                                  >
                                    <ListItemText
                                      sx={{
                                        span: {
                                          fontWeight: 500
                                        }
                                      }}
                                      primary={subcategory.name}
                                    />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </Collapse>
                        )}
                      </Fragment>
                    )
                )}
              </List>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {isLoading || (viewCategoryByIdLoading && <Skeleton variant="rounded" height={400} />)}
          {viewCategory === 0 && !isLoading && (
            <Card sx={{ height: '100%' }}>
              <CardContent>{isEmpty ? '' : 'Seleciona una marca para visualizarla'}</CardContent>
            </Card>
          )}
          {viewCategory !== 0 && !viewCategoryByIdLoading && viewCategoryById !== null && !isEmpty && (
            <Card sx={{ height: '100%' }}>
              <CardContent>
                {viewCategory === 0 ? (
                  'seleciona una categoria'
                ) : (
                  <>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={12}>
                        <Typography variant="h5" sx={{ mb: 3 }}>
                          {viewCategoryById.name}
                          {console.log(viewCategoryById)}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {viewCategoryById.categoryMainCategory !== null && (
                            <>
                              <strong>Categoria Padre: </strong>
                              {viewCategoryById?.categoryMainCategory?.name}
                            </>
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                          {/* Description for category */}
                          <strong>Descripción: </strong>
                          {viewCategoryById.description}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="h6" sx={{ mb: 3 }}>
                      Productos asociados
                    </Typography>
                    {/* <DataGrid
                      checkboxSelection
                      disableSelectionOnClick
                      autoHeight
                      rows={categories.find((category) => category.id === viewCategory).products}
                      columns={columns}
                      pagination
                      pageSize={10}
                      rowHeight={60}
                      loading={products.length === 0}
                      components={{
                        Toolbar: GridToolbar,
                        Pagination: CustomPagination
                      }}
                    /> */}
                    {/* Insertar tabla de productos */}
                    <ProductListView categoryView={viewCategoryById} />
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
