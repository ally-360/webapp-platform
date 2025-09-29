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
  IconButton,
  AlertTitle,
  Alert,
  useMediaQuery
} from '@mui/material';

// redux
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// RTK Query
import {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useDeleteCategoryMutation
} from 'src/redux/services/categoriesApi';

// Redux Legacy (para compatibilidad con el estado del popup)
import { switchPopupState } from 'src/redux/inventory/categoriesSlice';

import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import MenuCategories from 'src/sections/categories/MenuCategories';
// eslint-disable-next-line import/no-extraneous-dependencies
import { enqueueSnackbar } from 'notistack';
import { ProductListView } from 'src/sections/product/view';
import { Box } from '@mui/system';
import { useAppDispatch } from 'src/hooks/store';
// utils

// hooks

export default function InvetoryCategoriesList() {
  const settings = useSettingsContext();
  const componentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const dispatch = useAppDispatch();

  // RTK Query hooks
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();

  const isEmpty = categories.length === 0;

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // states for menu options in categories
  const [viewCategory, setViewCategory] = useState<string>('');

  // RTK Query para obtener categoría específica
  const { data: viewCategoryById, isLoading: viewCategoryByIdLoading } = useGetCategoryByIdQuery(viewCategory, {
    skip: !viewCategory
  });

  const menuRef = useRef(null);

  const handleEdit = (category: any) => {
    dispatch(switchPopupState(category));
  };

  const handleDelete = async ({ id }: { id: string }) => {
    try {
      setViewCategory('');
      await deleteCategory(id).unwrap();
      enqueueSnackbar('Categoria eliminada', { variant: 'success' });
    } catch (err: any) {
      console.error('Error deleting category:', err);
      enqueueSnackbar(err?.data?.detail || 'Error eliminando categoria', { variant: 'error' });
    }
  };

  const handleClick = (categoryId: string) => {
    const isExpanded = expandedCategories.includes(categoryId);
    if (isExpanded) {
      setExpandedCategories(expandedCategories.filter((id) => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const handleView = (categoryId: string) => {
    setViewCategory(categoryId);
  };

  const handleClickPopup = () => {
    dispatch(switchPopupState(false));
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
            href: paths.dashboard.inventory.categories
          },
          { name: 'Categorias' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
        action={
          <Box sx={{ flex: 1 }}>
            <Button
              color="primary"
              variant="contained"
              onClick={handleClickPopup}
              sx={isMobile ? { width: '100%' } : { width: 'auto' }}
              startIcon={<Icon icon="mingcute:add-line" />}
            >
              Crear categoria
            </Button>
          </Box>
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
                {categories
                  .filter((category) => !category.parent_id) // Categorías principales
                  .map((category) => {
                    const subcategories = categories.filter((sub) => sub.parent_id === category.id);
                    return (
                      <Fragment key={category.id}>
                        <ListItem
                          disablePadding
                          secondaryAction={
                            <>
                              {subcategories.length > 0 &&
                                (expandedCategories.includes(category.id) ? (
                                  <IconButton color="primary" onClick={() => handleClick(category.id)}>
                                    <Icon width={20} height={20} icon="eva:arrow-ios-upward-fill" />
                                  </IconButton>
                                ) : (
                                  <IconButton onClick={() => handleClick(category.id)}>
                                    <Icon width={20} height={20} icon="eva:arrow-ios-downward-fill" />
                                  </IconButton>
                                ))}
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

                        {subcategories.length > 0 && (
                          <Collapse
                            key={`collapse-${category.id}`}
                            in={expandedCategories.includes(category.id)}
                            timeout="auto"
                            unmountOnExit
                          >
                            <List component="div" disablePadding>
                              {subcategories.map((subcategory) => (
                                <ListItem
                                  key={subcategory.id}
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
                                  <ListItemButton onClick={() => handleView(subcategory.id)} sx={{ pl: 4 }}>
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
                    );
                  })}
              </List>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {isLoading && <Skeleton variant="rounded" height={400} />}
          {!viewCategory && !isLoading && (
            <Card sx={{ height: '100%' }}>
              <CardContent>{isEmpty ? '' : 'Seleciona una categoria para visualizarla'}</CardContent>
            </Card>
          )}
          {viewCategory && !viewCategoryByIdLoading && viewCategoryById && !isEmpty && (
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                      <Typography variant="h5" sx={{ mb: 3 }}>
                        {viewCategoryById.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {viewCategoryById.parent && (
                          <>
                            <strong>Categoria Padre: </strong>
                            {viewCategoryById.parent.name}
                          </>
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3 }}>
                        <strong>Descripción: </strong>
                        {viewCategoryById.description || 'Sin descripción'}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Productos asociados
                  </Typography>
                  <ProductListView categoryView={viewCategoryById} />
                </>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
