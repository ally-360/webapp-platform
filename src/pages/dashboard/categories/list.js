import { Helmet } from 'react-helmet-async';
// sections
import { CategoriesListView } from 'src/sections/categories/view';

// ----------------------------------------------------------------------

export default function PDVSListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Categorias</title>
      </Helmet>

      <CategoriesListView />
    </>
  );
}
