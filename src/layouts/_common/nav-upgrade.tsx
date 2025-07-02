// @mui
import Stack from '@mui/material/Stack';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// routes
// locales
import { useLocales } from 'src/locales';
// components

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const { user } = useMockedUser();

  const { t } = useLocales();

  return (
    <Stack
      sx={{
        px: 2,
        py: 5,
        textAlign: 'center'
      }}
    >
      {/* <Stack alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar src={user?.photoURL} alt={user?.displayName} sx={{ width: 48, height: 48 }} />
          <Label
            color="success"
            variant="filled"
            sx={{
              top: -6,
              px: 0.5,
              left: 40,
              height: 20,
              position: 'absolute',
              borderBottomLeftRadius: 2
            }}
          >
            Free
          </Label>
        </Box>
      </Stack> */}
    </Stack>
  );
}
