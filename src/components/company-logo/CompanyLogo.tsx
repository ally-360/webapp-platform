import { Avatar } from '@mui/material';
import React from 'react';
// hooks
import { useAuthContext } from 'src/auth/hooks';
// api
import { useGetCompanyLogoQuery } from 'src/redux/services/userProfileApi';

interface CompanyLogoProps {
  sx?: object;
  variant?: 'rounded' | 'circular' | 'square';
}

function CompanyLogo({ sx, variant = 'rounded' }: CompanyLogoProps) {
  const { company } = useAuthContext();
  const { data: logoData } = useGetCompanyLogoQuery();

  return (
    <Avatar
      alt={company?.name || 'Company'}
      src={logoData?.logo_url || (company as any)?.logo_url}
      variant={variant}
      sx={sx}
    />
  );
}

export default CompanyLogo;
