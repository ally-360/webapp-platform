import React, { memo } from 'react';
// @mui
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stack,
  Paper
} from '@mui/material';
import { Icon } from '@iconify/react';
// utils
import { formatCurrency, getPaymentMethodName, getPaymentMethodIcon } from 'src/redux/pos/posUtils';
// types
import type { PaymentMethod } from 'src/redux/pos/posSlice';

interface Props {
  payments: PaymentMethod[];
  remainingAmount: number;
  canAddPayment: boolean;
  onAddPayment: () => void;
  onRemovePayment: (paymentId: string) => void;
}

const PosPaymentsList = memo(({ payments, remainingAmount, canAddPayment, onAddPayment, onRemovePayment }: Props) => (
  <Box sx={{ p: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
      <Typography variant="subtitle2">Pagos</Typography>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Icon icon="mdi:credit-card-plus" />}
        onClick={onAddPayment}
        disabled={!canAddPayment}
      >
        Agregar Pago
      </Button>
    </Stack>

    {payments.length > 0 && (
      <List dense>
        {payments.map((payment) => (
          <ListItem key={payment.id} sx={{ px: 0 }}>
            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Icon icon={getPaymentMethodIcon(payment.method)} />
                  <Typography variant="body2">{getPaymentMethodName(payment.method)}</Typography>
                </Stack>
              }
              secondary={formatCurrency(payment.amount)}
            />
            <ListItemSecondaryAction>
              <IconButton size="small" onClick={() => onRemovePayment(payment.id)}>
                <Icon icon="mdi:delete-outline" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    )}

    {remainingAmount > 0 && (
      <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'warning.lighter' }}>
        <Typography variant="body2" color="warning.dark">
          Pendiente: {formatCurrency(remainingAmount)}
        </Typography>
      </Paper>
    )}
  </Box>
));

PosPaymentsList.displayName = 'PosPaymentsList';

export default PosPaymentsList;
