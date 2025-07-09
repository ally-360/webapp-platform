import { useState, useEffect } from 'react';
import Step1EmailForm from './Step1EmailForm';
import Step2CodeForm from './Step2CodeForm';
import Step3ResetForm from './Step3ResetForm';
import Step4SuccessMessage from './Step4SuccessMessage';
import {
  loadResetPasswordSession,
  clearResetPasswordSession,
  saveResetPasswordSession,
  isResetCodeExpired
} from './utils/reset-password-storage';

export default function ForgotPasswordView() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    const session = loadResetPasswordSession();

    if (session) {
      const expired = isResetCodeExpired(session.timestamp);
      if (!expired) {
        setEmail(session.email);
        setStep(session.step);
      } else {
        clearResetPasswordSession();
      }
    }
  }, []);

  useEffect(() => {
    if (email && step < 4) {
      saveResetPasswordSession({
        email,
        step,
        timestamp: Date.now()
      });
    }

    if (step === 4) {
      clearResetPasswordSession(); // cleanup al finalizar
    }
  }, [email, step]);

  return (
    <>
      {step === 1 && (
        <Step1EmailForm
          onSuccess={(em) => {
            setEmail(em);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <Step2CodeForm
          email={email}
          onSuccess={(cd) => {
            setCode(cd);
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <Step3ResetForm
          email={email}
          code={code}
          onReset={() => {
            console.info('Password restablecida');
            setStep(4);
          }}
        />
      )}
      {step === 4 && <Step4SuccessMessage email={email} />}
    </>
  );
}
