import { Helmet } from 'react-helmet-async';
import { ShiftCloseView } from 'src/sections/pos/view';

export default function PosShiftClosePage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Cierre de turno</title>
      </Helmet>
      <ShiftCloseView />
    </>
  );
}
