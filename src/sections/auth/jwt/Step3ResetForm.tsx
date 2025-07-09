import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, InputAdornment, IconButton } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { SentIcon } from 'src/assets/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import AuthFormHead from './components/AuthFormHead';
import BackToLoginLink from './components/BackToLoginLink';

interface Step3Props {
  email: string;
  code: string;
  onReset(): void;
}

const schema = Yup.object({
  password: Yup.string().required('Obligatorio'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Obligatorio')
});

export default function Step3ResetForm({ email, code, onReset }: Step3Props) {
  const showPassword = useBoolean(false);
  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: { password: '', confirmPassword: '' }
  });
  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    console.info('Step 3:', data, 'Email:', email, 'Code:', code);
    onReset();
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <AuthFormHead
        icon={<SentIcon sx={{ height: 96 }} />}
        title="Restablecer contraseña"
        description={`Ingresa una nueva contraseña para tu cuenta de ${email}.`}
      />
      <Stack spacing={3} alignItems="center">
        {['password', 'confirmPassword'].map((field) => (
          <RHFTextField
            key={field}
            name={field}
            label={field === 'password' ? 'Contraseña Nueva' : 'Confirmar Nueva Contraseña'}
            type={showPassword.value ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        ))}
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        >
          Restablecer contraseña
        </LoadingButton>
        <BackToLoginLink />
      </Stack>
    </FormProvider>
  );
}
