import { Helmet } from 'react-helmet-async';
// sections
import { BrandsListView } from 'src/sections/brands/view';

// ----------------------------------------------------------------------

export default function BrandsListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Marcas</title>
      </Helmet>

      <BrandsListView />
    </>
  );
}
