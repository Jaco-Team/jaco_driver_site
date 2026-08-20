import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { log } from '@/components/analytics';
import { isPasswordStrong, stripPasswordSpaces } from '@/shared/lib/passwordRequirements';
import { SMARTCAPTCHA_CLIENT_KEY } from '@/shared/ui/YandexSmartCaptcha';
import type {
  ConfirmPasswordRecoveryCode,
  LoginByPassword,
  RecoveryStep,
  RequestPasswordRecoveryCode,
  SubmitHandler,
  SubmitOnEnter,
  UseRegistrationPageResult,
} from './useRegistrationPage.type';

export function useRegistrationPage(): UseRegistrationPageResult {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState<RecoveryStep>(0);

  const [loader, setLoader] = useState(false);

  const [err1, setErr1] = useState('');
  const [err2, setErr2] = useState('');

  const [myLogin, setMyLogin] = useState('');
  const [myPWD, setMyPWDState] = useState('');
  const [myCode, setMyCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [retryAfter, setRetryAfter] = useState(0);

  const { requestPasswordRecoveryCode, confirmPasswordRecoveryCode, login } = useAuthStore(
    (state) => ({
      requestPasswordRecoveryCode: state.requestPasswordRecoveryCode,
      confirmPasswordRecoveryCode: state.confirmPasswordRecoveryCode,
      login: state.login,
    })
  );
  const requestRecoveryCodeApi: RequestPasswordRecoveryCode = requestPasswordRecoveryCode;
  const confirmRecoveryCodeApi: ConfirmPasswordRecoveryCode = confirmPasswordRecoveryCode;
  const loginByPasswordApi: LoginByPassword = login;
  const isPasswordValid = isPasswordStrong(myPWD);

  useEffect(() => {
    if (retryAfter <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRetryAfter((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retryAfter]);

  function resetCaptcha(): void {
    setCaptchaToken('');
    setCaptchaResetKey((key) => key + 1);
  }

  function setMyPWD(value: string): void {
    setMyPWDState(stripPasswordSpaces(value));
    if (err1) {
      setErr1('');
    }
  }

  async function requestRecoveryCode(): Promise<void> {
    if (myLogin.length === 0 || !isPasswordValid || retryAfter > 0) {
      return;
    }

    if (SMARTCAPTCHA_CLIENT_KEY && !captchaToken) {
      setErr1('Пожалуйста, подтвердите, что вы не робот');
      return;
    }

    setLoader(true);
    setErr1('');

    const res = await requestRecoveryCodeApi(myLogin, myPWD, captchaToken);

    if (res.retry_after && res.retry_after > 0) {
      setRetryAfter(Math.ceil(res.retry_after));
    }

    resetCaptcha();

    if (res.st === true) {
      log('auth_send_sms', 'Отправка СМС-кода');
      setActiveStep(1);
    } else {
      log('auth_send_sms_fail', 'Ошибка отправки СМС-кода');
      setErr1(res.text || 'Не удалось отправить код восстановления.');
    }

    setTimeout(() => {
      setLoader(false);
    }, 300);
  }

  async function confirmRecoveryCode(): Promise<void> {
    if (myCode.length !== 6) {
      return;
    }

    setLoader(true);
    setErr2('');

    const res = await confirmRecoveryCodeApi(myLogin, myCode);

    if (res.st === true) {
      const authResult = await loginByPasswordApi(myLogin, myPWD);

      if (authResult.st === true) {
        log('auth_recovery_autologin_success', 'Автовход после восстановления пароля');
        router.push('/list_orders', { scroll: false });
      } else {
        log('auth_recovery_autologin_fail', 'Не удалось выполнить автовход после восстановления');
        setErr2(
          authResult.text || 'Код подтвержден, но не удалось войти автоматически. Войдите вручную.'
        );
      }
    } else {
      setErr2(res.text || 'Не удалось подтвердить код восстановления.');
    }

    setTimeout(() => {
      setLoader(false);
    }, 300);
  }

  const panelTitle = activeStep === 0 ? 'Восстановление доступа' : 'Подтверждение по SMS';
  const panelText =
    activeStep === 0
      ? 'Укажите номер телефона и новый пароль. После этого мы отправим код подтверждения.'
      : 'Введите код из SMS, чтобы подтвердить номер и завершить восстановление пароля.';
  const errorText = activeStep === 0 ? err1 : err2;
  const helperText =
    activeStep === 0
      ? 'Если номер зарегистрирован, отправим SMS с кодом. Пароль должен быть сложным.'
      : 'Если код не пришел, проверьте номер телефона и повторите отправку позже.';
  const submitOnEnter: SubmitOnEnter = (handler: SubmitHandler) => (event) => {
    if (event.key === 'Enter') {
      handler();
    }
  };
  const canSubmit =
    retryAfter <= 0 &&
    (activeStep === 1 || Boolean(isPasswordValid && (!SMARTCAPTCHA_CLIENT_KEY || captchaToken)));

  return {
    loader,
    panelTitle,
    panelText,
    activeStep,
    myLogin,
    setMyLogin,
    myPWD,
    setMyPWD,
    submitOnEnter,
    requestRecoveryCode,
    myCode,
    setMyCode,
    confirmRecoveryCode,
    errorText,
    helperText,
    captchaResetKey,
    setCaptchaToken,
    resetCaptcha,
    retryAfter,
    canSubmit,
    isPasswordValid,
  };
}
