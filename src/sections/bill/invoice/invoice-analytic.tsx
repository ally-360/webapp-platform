import PropTypes from 'prop-types';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
// utils
import { fShortenNumber, fCurrency } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function InvoiceAnalytic({
  title,
  total,
  icon,
  color,
  percent,
  price,
  showNavigation = false,
  onPreviousMonth,
  onNextMonth,
  selectedMonth,
  selectedYear
}) {
  const { t } = useTranslation();

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  const currentMonthName = selectedMonth ? monthNames[selectedMonth - 1] : '';

  return (
    <Stack spacing={2.5} direction="row" alignItems="center" justifyContent="center" sx={{ width: 1, minWidth: 200 }}>
      <Stack alignItems="center" justifyContent="center" sx={{ position: 'relative' }}>
        <Iconify icon={icon} width={32} sx={{ color, position: 'absolute' }} />

        <CircularProgress variant="determinate" value={percent} size={56} thickness={2} sx={{ color, opacity: 0.48 }} />

        <CircularProgress
          variant="determinate"
          value={100}
          size={56}
          thickness={3}
          sx={{
            top: 0,
            left: 0,
            opacity: 0.48,
            position: 'absolute',
            color: (theme) => alpha(theme.palette.grey[500], 0.16)
          }}
        />
      </Stack>

      <Stack spacing={0.5} sx={{ flex: 1 }}>
        {showNavigation && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <IconButton
              size="small"
              onClick={onPreviousMonth}
              sx={{
                width: 28,
                height: 28,
                border: 1,
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <Iconify icon="eva:arrow-left-fill" width={16} />
            </IconButton>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {currentMonthName} {selectedYear}
            </Typography>

            <IconButton
              size="small"
              onClick={onNextMonth}
              sx={{
                width: 28,
                height: 28,
                border: 1,
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <Iconify icon="eva:arrow-right-fill" width={16} />
            </IconButton>
          </Stack>
        )}

        <Typography variant="subtitle1">{t(title)}</Typography>

        <Box component="span" sx={{ color: 'text.disabled', typography: 'body2' }}>
          {fShortenNumber(total)} {t('Facturas')}
        </Box>

        <Typography variant="subtitle2">{fCurrency(price || 0)}</Typography>
      </Stack>
    </Stack>
  );
}

InvoiceAnalytic.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  percent: PropTypes.number,
  price: PropTypes.number,
  title: PropTypes.string,
  total: PropTypes.number,
  showNavigation: PropTypes.bool,
  onPreviousMonth: PropTypes.func,
  onNextMonth: PropTypes.func,
  selectedMonth: PropTypes.number,
  selectedYear: PropTypes.number
};
