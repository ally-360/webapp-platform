import { Helmet } from 'react-helmet-async';
// sections
import { OrderListView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

export default function OrderListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Order List</title>
      </Helmet>

      <OrderListView />
    </>
  );
}
