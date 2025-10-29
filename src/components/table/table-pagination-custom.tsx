import React from 'react';
// @mui
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TablePagination from '@mui/material/TablePagination';

// ----------------------------------------------------------------------

interface TablePaginationCustomProps {
  dense: boolean;
  onChangeDense: (event: any) => void;
  rowsPerPageOptions?: number[];
  sx?: object;

  [x: string]: unknown;
}

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  rowsPerPageOptions = [10, 25],
  sx,
  ...other
}: Readonly<TablePaginationCustomProps>) {
  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        {...other}
        sx={{
          borderTopColor: 'transparent'
        }}
      />

      {onChangeDense && (
        <FormControlLabel
          label="Compacto"
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: {
              sm: 'absolute'
            }
          }}
        />
      )}
    </Box>
  );
}
