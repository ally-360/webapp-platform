import { Helmet } from 'react-helmet-async';
import ShiftDetailView from 'src/sections/pos/view/shift-detail-view';

export default function PosShiftDetailPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Detalle de turno</title>
      </Helmet>
      <ShiftDetailView />
    </>
  );
}
