// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
//
import React from 'react';
import EmptyContent from '../empty-content';
// ----------------------------------------------------------------------
interface TableNoDataProps {
  notFound: boolean;
  sx?: object;
  text?: string;
}
export default function TableNoData({ notFound, sx, text }: TableNoDataProps) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={12}>
          <EmptyContent
            filled
            title={text || 'No data found'}
            sx={{
              py: 10,
              ...sx
            }}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
