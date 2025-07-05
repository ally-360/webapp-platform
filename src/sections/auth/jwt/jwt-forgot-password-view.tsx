import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// assets
import { PasswordIcon } from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import SendCodeResetPassword from 'src/sections/auth/jwt/jwt-forgot-passwor-step2';
import { ResetPasswordForm } from 'src/sections/auth/jwt/jwt-forgot-passwor-step3';
// -------------------------------------------------------------------------

export default function ModernForgotPasswordView() {
  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .required('El correo es obligatorio')
      .email('El correo debe ser una dirección de correo electrónico válida')
  });
  const password = useBoolean(false);

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const defaultValues = {
    email: ''
  };

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues
  });

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await RequestService.fetchSendCodeResetPassword(data.email);
      console.info('DATA', data);
      setEmail(data.email);
      setStep(2);
      methods.reset();
    } catch (error) {
      console.error(error);
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField name="email" label="Correo electrónico" placeholder="example@gmail.com" />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        loading={isSubmitting}
        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        sx={{ justifyContent: 'space-between', pl: 2, pr: 1.5 }}
      >
        Solicitar restablecimiento
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.jwt.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex'
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Volver al inicio de sesión
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">¿Olvidaste tu contraseña?</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Ingrese la dirección de correo electrónico asociada con su cuenta y le enviaremos un código por correo
          electrónico para restablecer su contraseña.
        </Typography>
      </Stack>
    </>
  );

  return (
    <>
      {step === 1 && (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          {renderHead}
          {renderForm}
        </FormProvider>
      )}
      {step === 2 && <SendCodeResetPassword email={email} setCode={setCode} setStep={setStep} />}
      {step === 3 && <ResetPasswordForm email={email} code={code} setStep={setStep} />}
    </>
  );
}
