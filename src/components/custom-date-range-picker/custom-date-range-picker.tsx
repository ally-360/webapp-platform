import { useMemo, useState, useCallback } from 'react';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// utils
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type RangeDayExtraProps = {
  start?: Date | null;
  previewEnd?: Date | null;
  onHover?: (day: Date) => void;
  onSelect?: (day: Date) => void;
};

type RangeDayProps = Omit<PickersDayProps<Date>, 'onMouseEnter' | 'onClick'> & RangeDayExtraProps;

function RangeDay(props: RangeDayProps) {
  const theme = useTheme();
  const { day, outsideCurrentMonth, selected, start, previewEnd, onHover, onSelect, ...other } = props;

  const isSameDay = (a: Date, b: Date) => new Date(a).toDateString() === new Date(b).toDateString();

  const isStart = start && day && isSameDay(day, start);
  const isEnd = previewEnd && day && isSameDay(day, previewEnd);

  const inRange = useMemo(() => {
    const s = start ? new Date(start) : null;
    const e = previewEnd ? new Date(previewEnd) : null;
    if (!s || !e) return false;
    const t = new Date(day as Date);
    const min = s < e ? s : e;
    const max = s < e ? e : s;
    return t >= min && t <= max;
  }, [day, start, previewEnd]);

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      onMouseEnter={() => onHover && onHover(day as Date)}
      onClick={() => onSelect && onSelect(day as Date)}
      selected={Boolean(isStart || isEnd) || selected}
      sx={{
        ...(inRange && {
          bgcolor: alpha(theme.palette.primary.main, 0.15)
        }),
        ...(isStart && {
          borderTopLeftRadius: 999,
          borderBottomLeftRadius: 999,
          bgcolor: alpha(theme.palette.primary.main, 0.35),
          color: theme.palette.getContrastText(theme.palette.primary.main)
        }),
        ...(isEnd && {
          borderTopRightRadius: 999,
          borderBottomRightRadius: 999,
          bgcolor: alpha(theme.palette.primary.main, 0.35),
          color: theme.palette.getContrastText(theme.palette.primary.main)
        })
      }}
    />
  );
}

// ----------------------------------------------------------------------

type CustomDateRangePickerProps = {
  title?: string;
  variant?: 'input' | 'calendar';
  startDate: Date | null;
  endDate: Date | null;
  onChangeStartDate: (newValue: Date | null) => void;
  onChangeEndDate: (newValue: Date | null) => void;
  open: boolean;
  onClose: () => void;
  error?: boolean;
};

export default function CustomDateRangePicker({
  title = 'Seleccionar rango',
  variant = 'input',
  // external controlled dates
  startDate,
  endDate,
  // change handlers
  onChangeStartDate,
  onChangeEndDate,
  // dialog controls
  open,
  onClose,
  // validation
  error
}: CustomDateRangePickerProps) {
  const mdUp = useResponsive('up', 'md');

  const isCalendarView = variant === 'calendar';

  // local hover state to preview range while selecting end date
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState(false);

  const start = useMemo(() => (startDate ? new Date(startDate) : null), [startDate]);
  const end = useMemo(() => (endDate ? new Date(endDate) : null), [endDate]);

  const previewEnd = useMemo(() => (!end && selecting && hoveredDay ? hoveredDay : end), [end, selecting, hoveredDay]);

  const titleLabel = useMemo(() => {
    if (start && previewEnd) {
      return `${fDate(start, 'dd MMM')} - ${fDate(previewEnd, 'dd MMM')}`;
    }
    if (start) return `${fDate(start, 'dd MMM')}`;
    return title;
  }, [start, previewEnd, title]);

  const handleDaySelect = useCallback(
    (day: Date | null) => {
      if (!day) return;
      if (!start || (start && end)) {
        onChangeStartDate(day);
        onChangeEndDate(null);
        setSelecting(true);
        return;
      }
      // selecting end
      const d = new Date(day);
      const s = new Date(start);
      if (d < s) {
        onChangeStartDate(d);
        onChangeEndDate(s);
      } else {
        onChangeEndDate(d);
      }
      setSelecting(false);
    },
    [start, end, onChangeStartDate, onChangeEndDate]
  );

  const daySlotProps = {
    start,
    previewEnd,
    onHover: setHoveredDay,
    onSelect: handleDaySelect
  } as unknown as Partial<PickersDayProps<Date>>;

  return (
    <Dialog
      fullWidth
      maxWidth={isCalendarView ? false : 'xs'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...(isCalendarView && {
            maxWidth: 720
          })
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="subtitle1" color="primary.main">
            {titleLabel}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          ...(isCalendarView &&
            mdUp && {
              overflow: 'unset'
            })
        }}
      >
        <Stack
          justifyContent="center"
          spacing={isCalendarView ? 3 : 2}
          direction={isCalendarView && mdUp ? 'row' : 'column'}
          sx={{ pt: 1 }}
        >
          {isCalendarView ? (
            <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', borderStyle: 'dashed' }}>
              <DateCalendar
                value={start || null}
                onChange={(day) => handleDaySelect(day)}
                slots={{ day: RangeDay as any }}
                slotProps={{ day: daySlotProps }}
              />
            </Paper>
          ) : (
            <>
              <DatePicker label="Fecha inicio" value={startDate} onChange={onChangeStartDate} />
              <DatePicker label="Fecha fin" value={endDate} onChange={onChangeEndDate} />
            </>
          )}
        </Stack>

        {error && (
          <FormHelperText error sx={{ px: 2 }}>
            La fecha final debe ser posterior a la inicial
          </FormHelperText>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancelar
        </Button>

        <Button disabled={error} variant="contained" onClick={onClose}>
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
