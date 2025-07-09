import { m } from 'framer-motion';
// @mui
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
// _mock
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import React, { useEffect } from 'react';
import { getAllContacts } from 'src/redux/inventory/contactsSlice';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';

// ----------------------------------------------------------------------

export default function ContactsPopover() {
  const popover = usePopover();

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllContacts());
  }, [dispatch]);

  const { contacts } = useAppSelector((state) => state.contacts);

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={popover.open ? 'inherit' : 'default'}
        onClick={popover.onOpen}
        sx={{
          ...(popover.open ? { bgcolor: (theme) => theme.palette.action.selected } : {})
        }}
      >
        <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 320 }}>
        <Typography variant="h6" sx={{ p: 1.5 }}>
          Contacts <Typography component="span">({contacts.length})</Typography>
        </Typography>

        <Scrollbar sx={{ height: 320 }}>
          {contacts.map((contact) => (
            <MenuItem key={contact.id} sx={{ p: 1 }}>
              <Avatar alt={contact.name} sx={{ mr: 2 }}>
                {contact.name[0]}
              </Avatar>

              <ListItemText
                primary={`${contact.name} ${contact.lastname}`}
                secondary={contact.email}
                primaryTypographyProps={{ typography: 'subtitle2' }}
                secondaryTypographyProps={{ typography: 'caption', color: 'text.disabled' }}
              />
            </MenuItem>
          ))}
        </Scrollbar>
      </CustomPopover>
    </>
  );
}
