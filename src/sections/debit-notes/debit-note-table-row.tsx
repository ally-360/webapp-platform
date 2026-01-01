/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format} from 'date-fns';
import { es } from 'date-fns/locale';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fCurrency } from 'src/utils/format-number';
// types
import { DebitNote } from 'src/types/debit-note';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: DebitNote;
  selected: boolean;
  onSelectRow: VoidFunction;
  onViewRow: VoidFunction;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onVoidRow: VoidFunction;
};

export default function DebitNoteTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onVoidRow
}: Props) {
  const { number, customer_name, invoice_number, type, issue_date, total_amount, status } = row;

  const confirm = useBoolean(false);
  const popover = usePopover();

  const renderType = (noteType: string) => {
    const typeMap: Record<string, string> = {
      interest: 'Intereses',
      price_adjustment: 'Ajuste de Precio',
      additional_charge: 'Cargo Adicional',
      other: 'Otro'
    };
    return typeMap[noteType] || noteType;
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItemText
              primary={number}
              secondary={format(new Date(issue_date), 'dd MMM yyyy', { locale: es })}
              primaryTypographyProps={{ typography: 'body2', noWrap: true }}
              secondaryTypographyProps={{
                mt: 0.5,
                component: 'span',
                typography: 'caption'
              }}
            />
          </Box>
        </TableCell>

        <TableCell>
          <ListItemText
            primary={customer_name || 'N/A'}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          />
        </TableCell>

        <TableCell>
          <Link color="inherit" onClick={onViewRow} underline="always" sx={{ cursor: 'pointer' }}>
            {invoice_number || 'N/A'}
          </Link>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (type === 'interest' && 'error') ||
              (type === 'price_adjustment' && 'warning') ||
              (type === 'additional_charge' && 'info') ||
              'default'
            }
          >
            {renderType(type)}
          </Label>
        </TableCell>

        <TableCell>{fCurrency(parseFloat(total_amount))}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'applied' && 'success') ||
              (status === 'open' && 'warning') ||
              (status === 'void' && 'error') ||
              'default'
            }
          >
            {status === 'applied' && 'Aplicada'}
            {status === 'open' && 'Abierta'}
            {status === 'void' && 'Anulada'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 160 }}>
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Ver Detalle
        </MenuItem>

        {status === 'open' && (
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>
        )}

        {status !== 'void' && (
          <MenuItem
            onClick={() => {
              onVoidRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:close-circle-bold" />
            Anular
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:share-bold" />
          Enviar Email
        </MenuItem>

        {status === 'open' && (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Eliminar
          </MenuItem>
        )}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content="¿Está seguro que desea eliminar esta nota débito?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Eliminar
          </Button>
        }
      />
    </>
  );
}
