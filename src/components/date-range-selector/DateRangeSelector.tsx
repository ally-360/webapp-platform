import React from 'react';
// @mui
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box, Typography } from '@mui/material';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export type DateRangeValue = 'today' | 'week' | 'month' | 'year';

interface DateRangeOptionType {
  value: DateRangeValue;
  label: string;
  icon: string;
}

const DATE_RANGE_OPTIONS: DateRangeOptionType[] = [
  {
    value: 'today',
    label: 'Hoy',
    icon: 'solar:calendar-bold-duotone'
  },
  {
    value: 'week',
    label: 'Esta Semana',
    icon: 'solar:calendar-date-bold-duotone'
  },
  {
    value: 'month',
    label: 'Este Mes',
    icon: 'solar:calendar-minimalistic-bold-duotone'
  },
  {
    value: 'year',
    label: 'Este Año',
    icon: 'solar:calendar-add-bold-duotone'
  }
];

interface DateRangeSelectorProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
}

export default function DateRangeSelector({
  value,
  onChange,
  size = 'small',
  variant = 'outlined'
}: DateRangeSelectorProps) {
  const handleChange = (event: SelectChangeEvent<DateRangeValue>) => {
    onChange(event.target.value as DateRangeValue);
  };

  return (
    <FormControl size={size} variant={variant} sx={{ minWidth: 160 }}>
      <InputLabel id="date-range-selector-label">Período</InputLabel>
      <Select
        labelId="date-range-selector-label"
        value={value}
        label="Período"
        onChange={handleChange}
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }
        }}
      >
        {DATE_RANGE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Iconify
                icon={option.icon}
                width={20}
                sx={{
                  color: value === option.value ? 'primary.main' : 'text.secondary'
                }}
              />
              <Typography variant="body2">{option.label}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// Helper function to get date range based on selection
export function getDateRangeFromSelection(selection: DateRangeValue): {
  startDate: string;
  endDate: string;
  period: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (selection) {
    case 'today': {
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        period: 'day'
      };
    }

    case 'week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
        period: 'week'
      };
    }

    case 'month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      return {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
        period: 'month'
      };
    }

    case 'year': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);

      return {
        startDate: startOfYear.toISOString().split('T')[0],
        endDate: endOfYear.toISOString().split('T')[0],
        period: 'year'
      };
    }

    default:
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        period: 'day'
      };
  }
}
