import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import ListItem from '@mui/material/ListItem';
// routes
import { RouterLink } from 'src/routes/components';
//
import { IconButton, ListItemText, Zoom } from '@mui/material';
import { useTheme } from '@emotion/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import React from 'react';
import Iconify from '../../iconify';
//
import { StyledItem, StyledIcon, StyledDotIcon } from './styles';

// ----------------------------------------------------------------------

export default function NavItem({ item, open, depth, active, config, externalLink, ...other }) {
  const { title, path, icon, info, children, disabled, caption, roles } = item;

  const theme = useTheme();
  const subItem = depth !== 1;

  const { t } = useTranslation();

  const renderContent = !(config.hiddenLabel && !subItem) && (
    <ListItem
      sx={{
        padding: '0 !important',
        '.MuiListItemSecondaryAction-root': {
          right: '7px !important'
        }
      }}
      secondaryAction={
        item.openPopup && (
          <IconButton
            aria-label="close"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              item.openPopup();
            }}
            sx={{
              color: theme.palette.primary.main,
              marginRight: 0
            }}
            color="primary"
            size="small"
          >
            <Tooltip TransitionComponent={Zoom} title={t('Crear')} placement="right" arrow>
              <Icon icon="gala:add" width={20} height={20} />
            </Tooltip>
          </IconButton>
        )
      }
    >
      <StyledItem disableGutters p={0} disabled={disabled} active={active} depth={depth} config={config} {...other}>
        <>
          {icon && <StyledIcon size={config.iconSize}>{icon}</StyledIcon>}

          {subItem && (
            <StyledIcon size={config.iconSize}>
              <StyledDotIcon active={active} />
            </StyledIcon>
          )}
        </>
        <ListItemText
          secondary={
            caption ? (
              <Tooltip title={caption} placement="top-start">
                <span>{caption}</span>
              </Tooltip>
            ) : null
          }
          primaryTypographyProps={{
            noWrap: true,
            paddingLeft: '0 !important',
            typography: 'body2',
            textTransform: 'capitalize',
            fontWeight: active ? 'fontWeightSemiBold' : 'fontWeightMedium'
          }}
          secondaryTypographyProps={{
            noWrap: true,
            component: 'span',
            typography: 'caption',
            color: 'text.disabled'
          }}
          primary={title}
        />
        {info && (
          <Box component="span" sx={{ ml: 1, lineHeight: 0 }}>
            {info}
          </Box>
        )}

        {!!children && (
          <Iconify
            width={16}
            icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            sx={{ ml: 1, flexShrink: 0 }}
          />
        )}
      </StyledItem>
    </ListItem>
  );

  // Hidden item by role
  if (roles && !roles.includes(`${config.currentRole}`)) {
    return null;
  }

  // External link
  if (externalLink)
    return (
      <Link
        href={path}
        target="_blank"
        rel="noopener"
        underline="none"
        color="inherit"
        sx={{
          ...(disabled && {
            cursor: 'default'
          })
        }}
      >
        {renderContent}
      </Link>
    );

  // Has child
  if (children) {
    return renderContent;
  }

  // Default
  return (
    <Link
      component={RouterLink}
      href={path}
      underline="none"
      color="inherit"
      sx={{
        ...(disabled && {
          cursor: 'default'
        })
      }}
    >
      {renderContent}
    </Link>
  );
}

NavItem.propTypes = {
  active: PropTypes.bool,
  config: PropTypes.object,
  depth: PropTypes.number,
  externalLink: PropTypes.bool,
  item: PropTypes.object,
  open: PropTypes.bool
};
