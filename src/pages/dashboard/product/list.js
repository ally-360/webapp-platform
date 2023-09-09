import { Helmet } from 'react-helmet-async';
// sections
import { ProductListView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function ProductListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Product List</title>
      </Helmet>

      <ProductListView />
    </>
  );
}
