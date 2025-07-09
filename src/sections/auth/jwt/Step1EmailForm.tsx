import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { PasswordIcon } from 'src/assets/icons';
import AuthFormHead from './components/AuthFormHead';
import BackToLoginLink from './components/BackToLoginLink';

const schema = Yup.object().shape({
  email: Yup.string().required('El correo es obligatorio').email('Correo inválido')
});

export default function Step1EmailForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const methods = useForm({ resolver: yupResolver(schema), defaultValues: { email: '' } });

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async ({ email }) => {
    console.info('Step 1: email enviado', email);
    onSuccess(email);
    methods.reset();
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <AuthFormHead
        icon={<PasswordIcon sx={{ height: 96 }} />}
        title="¿Olvidaste tu contraseña?"
        description="Ingrese la dirección de correo electrónico asociada con su cuenta y le enviaremos un código para restablecer su contraseña."
      />

      <Stack spacing={3} alignItems="center">
        <RHFTextField name="email" label="Correo electrónico" placeholder="example@gmail.com" />
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
          sx={{ justifyContent: 'space-between', pl: 2, pr: 1.5 }}
        >
          Solicitar restablecimiento
        </LoadingButton>
        <BackToLoginLink />
      </Stack>
    </FormProvider>
  );
}
