import { Helmet } from 'react-helmet-async';
import { ShiftHistoryView } from 'src/sections/pos/view';

export default function PosShiftHistoryPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Historial de turnos</title>
      </Helmet>
      <ShiftHistoryView />
    </>
  );
}
