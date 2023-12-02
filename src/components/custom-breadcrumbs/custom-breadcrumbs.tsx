// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
//
import { Icon } from '@iconify/react';
import React from 'react';
import { Paper, useMediaQuery } from '@mui/material';
import LinkItem from './link-item';

// ----------------------------------------------------------------------

interface CustomBreadcrumbsProps {
  icon: string;
  links: Array<{ href?: string; name?: string }>;
  action?: React.ReactNode;
  heading: string;
  moreLink?: string[];
  activeLast?: boolean;
  sx?: object;

  [x: string]: unknown;
}

export default function CustomBreadcrumbs({
  icon,
  links,
  action,
  heading,
  moreLink,
  activeLast,
  sx,
  ...other
}: CustomBreadcrumbsProps) {
  const lastLink = links[links.length - 1].name;
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  return (
    <Box sx={{ ...sx }}>
      <Stack direction={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'normal' : 'center'} gap={isMobile && 2}>
        <Box sx={{ flexGrow: 1 }}>
          {/* HEADING */}
          {heading && icon !== '' && (
            <Stack direction="row" alignItems="center" gap={1} mb={1}>
              <Icon icon={icon} width={24} height={24} />
              <Typography variant="h4">{heading}</Typography>
            </Stack>
          )}

          {heading && icon === '' && <Typography variant="h4">{heading}</Typography>}

          {/* BREADCRUMBS */}
          {!!links.length && (
            <Breadcrumbs separator={<Separator />} {...other}>
              {links.map((link) => (
                <LinkItem key={link.name || ''} link={link} activeLast={activeLast} disabled={link.name === lastLink} />
              ))}
            </Breadcrumbs>
          )}

          {/* Agregarle box shadow del tema */}
        </Box>
        {isMobile && action ? (
          <Paper
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 99,
              padding: '18px 10px ',
              borderRadius: '14px 14px 0px 0px',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              boxShadow: '0px -10px 50px rgba(80,80,80,0.2)'
            }}
            elevation={24}
          >
            {action && <Box sx={{ flexShrink: 0, display: 'flex' }}> {action} </Box>}
          </Paper>
        ) : (
          <Box sx={{ flexShrink: 0, display: 'flex' }}> {action} </Box>
        )}
      </Stack>

      {/* MORE LINK */}
      {!!moreLink && (
        <Box sx={{ mt: 2 }}>
          {moreLink.map((href: string) => (
            <Link key={href} href={href} variant="body2" target="_blank" rel="noopener" sx={{ display: 'table' }}>
              {href}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

function Separator() {
  return <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />;
}
