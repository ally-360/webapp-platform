import { Stack, Typography } from '@mui/material';

interface AuthFormHeadProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function AuthFormHead({ icon, title, description }: AuthFormHeadProps) {
  return (
    <>
      {icon}
      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </Stack>
    </>
  );
}
