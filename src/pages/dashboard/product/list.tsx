import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { getViewCategoryById } from 'src/redux/inventory/categoriesSlice';
// sections
import { ProductListView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function ProductListPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getViewCategoryById(null));
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title> Ally360: Productos</title>
      </Helmet>

      <ProductListView />
    </>
  );
}
