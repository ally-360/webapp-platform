import { Helmet } from 'react-helmet-async';
// sections
import { PostListView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export default function PostListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Post List</title>
      </Helmet>

      <PostListView />
    </>
  );
}
