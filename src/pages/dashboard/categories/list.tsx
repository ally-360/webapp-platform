import { Helmet } from 'react-helmet-async';
// sections
import { CategoriesListView } from 'src/sections/categories/view';

// ----------------------------------------------------------------------

export default function CategoriesListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Categorias</title>
      </Helmet>

      <CategoriesListView />
    </>
  );
}
