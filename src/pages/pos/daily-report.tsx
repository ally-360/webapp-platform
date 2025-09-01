import { Helmet } from 'react-helmet-async';
import PosDailyReportView from 'src/sections/pos/view/pos-daily-report-view';

export default function PosDailyReportPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Reporte Diario POS</title>
      </Helmet>

      <PosDailyReportView />
    </>
  );
}
