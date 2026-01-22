/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
// @mui
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// types
import type { DebitNote } from 'src/redux/services/billsApi';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  row: DebitNote;
  selected: boolean;
  onSelectRow: VoidFunction;
  onViewRow: VoidFunction;
  onVoidRow: VoidFunction;
};

// ----------------------------------------------------------------------

export default function ExpenseDebitNoteTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onVoidRow,
}: Props) {
  const { issue_date, supplier_name, supplier, bill, total_amount, status, notes } = row;

  const popover = usePopover();

  const supplierDisplay = supplier_name || supplier?.name || 'Sin proveedor';
  const billDisplay = bill?.number || 'N/A';

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={format(new Date(issue_date), 'dd MMM yyyy', { locale: es })}
            secondary={notes ? `${notes.substring(0, 40)}...` : ''}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={supplierDisplay}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={billDisplay}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={fCurrency(parseFloat(total_amount))}
            primaryTypographyProps={{ typography: 'body2', fontWeight: 600 }}
          />
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={(status === 'open' && 'success') || (status === 'void' && 'error') || 'default'}
          >
            {status === 'open' ? 'Abierta' : 'Anulada'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Ver
        </MenuItem>

        {status === 'open' && (
          <MenuItem
            onClick={() => {
              onVoidRow();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Anular
          </MenuItem>
        )}
      </CustomPopover>
    </>
  );
}
