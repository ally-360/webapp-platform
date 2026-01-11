import { Box, Chip, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { LoadingScreen } from 'src/components/loading-screen';
import { useGetAccountByIdQuery } from 'src/redux/services/accountingApi';
import { fCurrency } from 'src/utils/format-number';

interface AccountDetailDrawerProps {
  accountId: string | null;
  open: boolean;
  onClose: () => void;
}

const accountTypeLabels: Record<string, string> = {
  asset: 'Activo',
  liability: 'Pasivo',
  equity: 'Patrimonio',
  income: 'Ingreso',
  expense: 'Gasto'
};

const behaviorLabels: Record<string, string> = {
  NONE: 'Ninguno',
  RECEIVABLE_ACCOUNTS: 'Cuentas por cobrar',
  RECEIVABLE_ACCOUNTS_RETURNS: 'Devoluciones en ventas',
  TAXES_IN_FAVOR: 'Impuestos a favor',
  INVENTORY: 'Inventario',
  DEBTS_TO_PAY_PROVIDERS: 'Cuentas por pagar proveedores',
  DEBTS_TO_PAY_RETURNS: 'Devoluciones en compras',
  TAXES_TO_PAY: 'Impuestos por pagar',
  SALES: 'Ventas',
  SALES_RETURNS: 'Devoluciones de ventas',
  COST_OF_GOODS_SOLD: 'Costo de ventas',
  PURCHASES: 'Compras',
  PURCHASES_RETURNS: 'Devoluciones de compras'
};

export function AccountDetailDrawer({ accountId, open, onClose }: AccountDetailDrawerProps) {
  const { data: account, isLoading } = useGetAccountByIdQuery(accountId!, {
    skip: !accountId
  });

  const renderField = (label: string, value: React.ReactNode) => (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value || '-'}</Typography>
    </Stack>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 } }
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="h6">Detalle de Cuenta</Typography>
        <IconButton onClick={onClose} size="small">
          <Icon icon="solar:close-circle-bold" width={24} />
        </IconButton>
      </Stack>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {isLoading && <LoadingScreen />}
        
        {!isLoading && account && (
          <Stack spacing={3}>
            {/* Código y Nombre */}
            <Box>
              <Typography variant="h5" gutterBottom>
                {account.code}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {account.name}
              </Typography>
            </Box>

            <Divider />

            {/* Información básica */}
            <Stack spacing={2.5}>
              {renderField('Tipo de cuenta', accountTypeLabels[account.account_type])}
              
              {renderField(
                'Naturaleza',
                <Chip
                  label={account.nature === 'debit' ? 'Débito' : 'Crédito'}
                  color={account.nature === 'debit' ? 'info' : 'success'}
                  size="small"
                  variant="filled"
                />
              )}

              {renderField(
                'Estado',
                <Chip
                  label={account.is_active ? 'ACTIVA' : 'INACTIVA'}
                  color={account.is_active ? 'success' : 'default'}
                  size="small"
                  variant="filled"
                />
              )}

              {renderField('Uso contable', account.use === 'movement' ? 'Movimiento' : 'Acumulativa')}

              {renderField('Comportamiento', behaviorLabels[account.behavior] || account.behavior)}

              {renderField(
                'Acepta tercero',
                <Chip
                  label={account.accepts_third_party ? 'Sí' : 'No'}
                  color={account.accepts_third_party ? 'primary' : 'default'}
                  size="small"
                  variant="outlined"
                />
              )}

              {account.is_system &&
                renderField(
                  'Cuenta del sistema',
                  <Chip
                    label="Sistema"
                    color="warning"
                    size="small"
                    variant="filled"
                    icon={<Icon icon="solar:shield-check-bold" width={16} />}
                  />
                )}
            </Stack>

            <Divider />

            {/* Saldos */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Saldos
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Débito:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fCurrency(account.balance_debit)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Crédito:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fCurrency(account.balance_credit)}
                  </Typography>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2">Saldo:</Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: account.balance >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {fCurrency(account.balance)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Info adicional */}
            {account.parent_id && (
              <>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Esta cuenta tiene una cuenta padre
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        )}
        
        {!isLoading && !account && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No se pudo cargar la información de la cuenta
          </Typography>
        )}
      </Box>
    </Drawer>
  );
}
