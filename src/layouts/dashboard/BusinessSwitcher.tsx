import { useState } from 'react';
import { Box, Menu, MenuItem, Typography, ListItemIcon, Divider, Button, CircularProgress } from '@mui/material';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { useGetMyCompaniesQuery } from 'src/redux/services/authApi';
import { useSnackbar } from 'src/components/snackbar';

export default function BusinessSwitcher() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { company, selectCompany, changingCompany, isFirstLogin } = useAuthContext();
  const { data: userCompanies } = useGetMyCompaniesQuery(undefined, {
    skip: isFirstLogin === true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false
  });
  const { enqueueSnackbar } = useSnackbar();

  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = async (companyId: string) => {
    try {
      // Solo cambiar si no es la empresa actual
      if (companyId !== company?.id) {
        handleClose(); // Cerrar el menú inmediatamente

        enqueueSnackbar('Cambiando empresa...', { variant: 'info' });
        await selectCompany(companyId);

        // Ya no necesitamos recargar - el estado se maneja internamente
      } else {
        handleClose();
      }
    } catch (error) {
      console.error('Error selecting company:', error);
      enqueueSnackbar('Error al cambiar de empresa', { variant: 'error' });
    }
  };

  const navigateToSelectBusiness = () => {
    navigate(paths.select_business);
    handleClose();
  };

  // Si no hay empresas cargadas, mostrar solo la empresa actual
  if (!userCompanies || userCompanies.length === 0) {
    return (
      <Button
        startIcon={
          <Iconify
            icon="material-symbols-light:store-rounded"
            sx={{ width: 24, height: 24, mr: 0, color: 'text.primary' }}
          />
        }
        sx={{ borderRadius: 1, textTransform: 'none', px: 1.5 }}
      >
        <Typography color="text.primary" variant="body2" noWrap>
          {company?.name || 'Sin empresa'}
        </Typography>
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={changingCompany}
        startIcon={
          changingCompany ? (
            <CircularProgress size={20} sx={{ color: 'text.secondary' }} />
          ) : (
            <Iconify
              icon="material-symbols-light:store-rounded"
              sx={{ width: 24, height: 24, mr: 0, color: 'text.primary' }}
            />
          )
        }
        endIcon={!changingCompany && <Iconify icon="eva:chevron-down-fill" sx={{ width: 20, height: 20 }} />}
        sx={{ borderRadius: 1, textTransform: 'none', px: 1.5 }}
      >
        <Typography color="text.primary" variant="body2" noWrap>
          {changingCompany ? 'Cambiando...' : company?.name || 'Seleccionar empresa'}
        </Typography>
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
        {userCompanies.map((companyItem) => (
          <MenuItem
            key={companyItem.id}
            onClick={() => handleSelect(companyItem.id)}
            selected={companyItem.id === company?.id}
          >
            <ListItemIcon sx={{ mr: 0 }}>
              <Iconify
                icon="material-symbols-light:store-rounded"
                sx={{ width: 24, height: 24, mr: 0, color: 'text.primary' }}
              />
            </ListItemIcon>
            <Box>
              <Typography color="text.primary" variant="body2">
                {companyItem.name}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {companyItem.nit}
              </Typography>
            </Box>
          </MenuItem>
        ))}

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={navigateToSelectBusiness}>
          <Typography textAlign="center" variant="body2" color="error">
            Menú de empresas
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
