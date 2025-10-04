import { Helmet } from 'react-helmet-async';
import { ShiftStatusView } from 'src/sections/pos/view';

export default function PosShiftStatusPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Turno actual</title>
      </Helmet>
      <ShiftStatusView />
    </>
  );
}
