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
import { deleteCategory, getCategories, switchPopupState } from 'src/redux/inventory/categoriesSlice';
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
// utils

// hooks

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export default function InvetoryCategoriesList() {
  const settings = useSettingsContext();
  const componentRef = useRef();
  const theme = useTheme();

  // const theme = useTheme();
  const dispatch = useDispatch();
  const { categories, openPopup } = useSelector((state) => state.categories);

  // Get categories and get products in category from API
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const [expandedCategories, setExpandedCategories] = useState([]);

  // states for menu options in categories
  const [viewCategory, setViewCategory] = useState(0);

  const { products } = useSelector((state) => state.categories);

  const menuRef = useRef(null);

  const handleEdit = (category) => {
    dispatch(switchPopupState(category));
  };

  const handleDelete = async ({ id }) => {
    console.log(id);
    try {
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
    <>
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
        <Grid container spacing={2}>
          <Grid sx={{ height: '100%' }} item xs={12} md={4}>
            <Card>
              {categories.length === 0 ? (
                <Skeleton variant="rectangular" height={400} />
              ) : (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }} component="nav">
                  {categories.map((category) => (
                    <Fragment key={category.id}>
                      <ListItem
                        disablePadding
                        style={{
                          backgroundColor:
                            viewCategory === category.id
                              ? '#D6E2F5'
                              : expandedCategories.includes(category.id)
                              ? '#E3F2FD'
                              : 'white',
                          color: viewCategory === category.id ? theme.palette.primary.dark : '#212121'
                        }}
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
                              <ListItemButton
                                onClick={() => handleView(subcategory.id)}
                                sx={{ pl: 4 }}
                                key={subcategory.id}
                              >
                                <ListItemText primary={subcategory.name} />
                              </ListItemButton>
                            ))}
                          </List>
                        </Collapse>
                      )}
                    </Fragment>
                  ))}
                </List>
              )}
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                {viewCategory === 0 ? (
                  'seleciona una categoria'
                ) : (
                  <>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={12}>
                        <Typography variant="h5" sx={{ mb: 3 }}>
                          {categories.find((category) => category.id === viewCategory).name}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {/* TODO: se estan utilizando en las subcategorias el mismo id y necesito agregarle la categoria padre */}
                          {categories.find((category) => category.id === viewCategory).subcategories.length > 0 ? (
                            <strong>Categoria padre:</strong>
                          ) : (
                            console.log(
                              categories.findIndex((category) => category.subcategories.id === viewCategory.id)
                            )
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                          {/* Description for category */}
                          {categories.find((category) => category.id === viewCategory).description}
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
                    <ProductListView categoryView={categories.find((category) => category.id === viewCategory)} />
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
