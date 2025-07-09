import { useState } from 'react';
import { Box, Avatar, Menu, MenuItem, Typography, ListItemIcon, Divider, Button } from '@mui/material';
import { companies } from 'src/_mock/business';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';

export default function BusinessSwitcher() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState(companies[0]);

  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (company: (typeof companies)[0]) => {
    setSelected(company);
    // TODO: Lógica para obtener nuevo token
    handleClose();
  };

  const navigateToSelectBusiness = () => {
    navigate(paths.select_business);
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={
          selected.logo ? (
            <Avatar src={selected.logo} sx={{ width: 24, height: 24, mr: 0 }} />
          ) : (
            <Iconify
              icon="material-symbols-light:store-rounded"
              sx={{ width: 24, height: 24, mr: 0, color: 'text.primary' }}
            />
          )
        }
        endIcon={<Iconify icon="eva:chevron-down-fill" sx={{ width: 20, height: 20 }} />}
        sx={{ borderRadius: 1, textTransform: 'none', px: 1.5 }}
      >
        <Typography color="text.primary" variant="body2" noWrap>
          {selected.name}
        </Typography>
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
        {companies.map((company) => (
          <MenuItem key={company.id} onClick={() => handleSelect(company)}>
            <ListItemIcon sx={{ mr: 0 }}>
              {company.logo ? (
                <Avatar src={company.logo} sx={{ width: 24, height: 24, mr: 0 }} />
              ) : (
                <Iconify
                  icon="material-symbols-light:store-rounded"
                  sx={{ width: 24, height: 24, mr: 0, color: 'text.primary' }}
                />
              )}
            </ListItemIcon>
            <Box>
              <Typography color="text.primary" variant="body2">
                {company.name}
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
