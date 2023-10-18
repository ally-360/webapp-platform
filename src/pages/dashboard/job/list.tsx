import { Helmet } from 'react-helmet-async';
// sections
import { JobListView } from 'src/sections/job/view';

// ----------------------------------------------------------------------

export default function JobListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Job List</title>
      </Helmet>

      <JobListView />
    </>
  );
}
