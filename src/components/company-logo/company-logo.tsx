import { memo } from 'react';
// @mui
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
// redux
import { useGetCompanyLogoQuery } from 'src/redux/services/userProfileApi';

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
  width?: number | string;
  height?: number | string;
  disabledLink?: boolean;
};

function CompanyLogo({ sx, width = 120, height = 80, disabledLink = false, ...other }: Props) {
  const { data: logoData } = useGetCompanyLogoQuery();

  const logo = logoData?.logo_url || '/logo/logoFondoTransparentesvg.svg';

  const singleLogo = (
    <Box
      component="img"
      src={logo}
      alt="Company Logo"
      sx={{
        width,
        height,
        objectFit: 'contain',
        ...sx
      }}
      {...other}
    />
  );

  if (disabledLink) {
    return singleLogo;
  }

  return singleLogo;
}

export default memo(CompanyLogo);
