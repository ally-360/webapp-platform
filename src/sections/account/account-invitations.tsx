import React, { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  Card,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  MenuItem,
  Alert
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
// hooks
import { useSnackbar } from 'src/components/snackbar';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import Scrollbar from 'src/components/scrollbar';
// api
import {
  useGetPendingInvitationsQuery,
  useInviteUserMutation,
  useGetCompanyUsersQuery
} from 'src/redux/services/userProfileApi';
// utils
// import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

interface InviteUserFormData {
  email: string;
  role: string;
}
const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'accountant', label: 'Contador' },
  { value: 'owner', label: 'Propietario' },
  { value: 'seller', label: 'Vendedor' },
  { value: 'user', label: 'Usuario' }
];

const getRoleLabel = (role: string) => {
  const roleOption = ROLE_OPTIONS.find((option) => option.value === role);
  return roleOption?.label || role;
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'error';
    case 'user':
      return 'primary';
    case 'viewer':
      return 'info';
    default:
      return 'default';
  }
};

// ----------------------------------------------------------------------

export default function AccountInvitations() {
  const { enqueueSnackbar } = useSnackbar();

  const [openInviteDialog, setOpenInviteDialog] = useState(false);

  // RTK Query hooks
  const {
    data: invitations = [],
    isLoading: loadingInvitations,
    refetch: refetchInvitations
  } = useGetPendingInvitationsQuery();
  const { data: companyUsers = [], isLoading: loadingUsers } = useGetCompanyUsersQuery({});
  const [inviteUser, { isLoading: isInviting }] = useInviteUserMutation();

  // Form validation schema
  const InviteUserSchema = Yup.object().shape({
    email: Yup.string().required('Email es requerido').email('Email debe ser válido'),
    role: Yup.string().required('Rol es requerido')
  });

  const methods = useForm<InviteUserFormData>({
    resolver: yupResolver(InviteUserSchema),
    defaultValues: {
      email: '',
      role: 'user'
    }
  });

  const { handleSubmit, reset } = methods;

  // Handle invite user submission
  const onSubmitInvite = handleSubmit(async (data) => {
    try {
      await inviteUser(data).unwrap();
      enqueueSnackbar(`Invitación enviada a ${data.email}`, { variant: 'success' });
      reset();
      setOpenInviteDialog(false);
      refetchInvitations();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      const errorMessage = error?.data?.message || 'No se pudo enviar la invitación';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenInviteDialog(true)}
        >
          Invitar Usuario
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Card sx={{ p: 3, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.contrastText'
              }}
            >
              <Iconify icon="mingcute:user-3-fill" width={24} />
            </Box>
            <Box>
              <Typography variant="h3">{companyUsers?.users?.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios Activos
              </Typography>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'warning.contrastText'
              }}
            >
              <Iconify icon="mingcute:mail-send-fill" width={24} />
            </Box>
            <Box>
              <Typography variant="h3">{invitations.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Invitaciones Pendientes
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Stack>

      {/* Company Users Table */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Usuarios de la Empresa
          </Typography>
        </Box>

        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar autoHeight>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Teléfono</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingUsers ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                ) : companyUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  companyUsers.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'primary.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="subtitle2" color="primary.main">
                              {user.profile?.first_name?.charAt(0) || 'U'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2">
                              {user.profile?.first_name} {user.profile?.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.profile?.dni || 'Sin DNI'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={getRoleLabel(user.role)} color={getRoleColor(user.role) as any} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? 'Activo' : 'Inactivo'}
                          color={user.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.profile?.phone_number || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>

      {/* Pending Invitations Table */}
      <Card>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Invitaciones Pendientes
          </Typography>
          {invitations.length === 0 && !loadingInvitations && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No hay invitaciones pendientes
            </Alert>
          )}
        </Box>

        {invitations.length > 0 && (
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar autoHeight>
              <Table sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Invitado por</TableCell>
                    <TableCell>Fecha de Expiración</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingInvitations ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Cargando invitaciones...
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>{invitation.invitee_email}</TableCell>
                        <TableCell>
                          <Chip
                            label={getRoleLabel(invitation.role)}
                            color={getRoleColor(invitation.role) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{invitation.invited_by_name}</TableCell>
                        <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={invitation.is_accepted ? 'Aceptada' : 'Pendiente'}
                            color={invitation.is_accepted ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={openInviteDialog} onClose={() => setOpenInviteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invitar Usuario</DialogTitle>

        <FormProvider methods={methods} onSubmit={onSubmitInvite}>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <RHFTextField name="email" label="Email del Usuario" placeholder="usuario@ejemplo.com" />

              <RHFSelect name="role" label="Rol del Usuario">
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenInviteDialog(false)}>Cancelar</Button>
            <LoadingButton type="submit" variant="contained" loading={isInviting}>
              Enviar Invitación
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </Box>
  );
}
