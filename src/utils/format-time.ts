import { format, getTime } from 'date-fns';

// ----------------------------------------------------------------------

const MONTHS_FULL_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const MONTHS_FULL_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

const MONTHS_ABBR_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_ABBR_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

function localizeMonths(output: string, pattern?: string) {
  if (!pattern) return output;

  let out = output;

  if (pattern.includes('MMMM')) {
    MONTHS_FULL_EN.forEach((en, i) => {
      const es = MONTHS_FULL_ES[i];
      out = out.replace(new RegExp(en, 'g'), es);
    });
  }

  if (pattern.includes('MMM')) {
    MONTHS_ABBR_EN.forEach((en, i) => {
      const es = MONTHS_ABBR_ES[i];
      out = out.replace(new RegExp(en, 'g'), es);
    });
  }

  return out;
}

export function fDate(date, newFormat) {
  const pattern = (newFormat || 'dd MMM yyyy').replace(/p/g, 'HH:mm');
  const base = date ? format(new Date(date), pattern) : '';
  return localizeMonths(base, pattern);
}

export function fDateTime(date, newFormat) {
  const pattern = (newFormat || 'dd MMM yyyy p').replace(/p/g, 'HH:mm');
  const base = date ? format(new Date(date), pattern) : '';
  return localizeMonths(base, pattern);
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  if (!date) return '';
  const d = new Date(date);
  const diffMs = d.getTime() - Date.now();

  // Choose the largest unit
  const absMs = Math.abs(diffMs);
  const sec = 1000;
  const min = 60 * sec;
  const hour = 60 * min;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  let value: number;
  let unit: Intl.RelativeTimeFormatUnit = 'second';

  if (absMs >= year) {
    value = Math.round(diffMs / year);
    unit = 'year';
  } else if (absMs >= month) {
    value = Math.round(diffMs / month);
    unit = 'month';
  } else if (absMs >= day) {
    value = Math.round(diffMs / day);
    unit = 'day';
  } else if (absMs >= hour) {
    value = Math.round(diffMs / hour);
    unit = 'hour';
  } else if (absMs >= min) {
    value = Math.round(diffMs / min);
    unit = 'minute';
  } else {
    value = Math.round(diffMs / sec);
    unit = 'second';
  }

  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  return rtf.format(value, unit);
}
