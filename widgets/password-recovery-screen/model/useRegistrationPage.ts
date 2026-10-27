import { useEffect, useRef, useState } from 'react';

import { useAuthStore } from '@/features/auth/model/auth.store';
import type { RecoveryDeliveryChannel } from '@/features/auth/api/auth.api';
import { log } from '@/components/analytics';
import { isPasswordStrong, stripPasswordSpaces } from '@/shared/lib/passwordRequirements';
import { SMARTCAPTCHA_CLIENT_KEY } from '@/shared/ui/YandexSmartCaptcha';
import type { RecoveryStep, SubmitHandler, SubmitOnEnter, UseRegistrationPageResult } from './useRegistrationPage.type';

function remainingSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

function waitSeconds(value: unknown): number {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0;
}

function isPhoneValid(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return /^\d{10}$/.test(digits) || /^[78]\d{10}$/.test(digits);
}

export function useRegistrationPage(): UseRegistrationPageResult {
  const [activeStep, setActiveStep] = useState<RecoveryStep>(0);
  const [loader, setLoader] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [myLogin, setMyLogin] = useState('');
  const [myPWD, setMyPWDState] = useState('');
  const [repeatPWD, setRepeatPWDState] = useState('');
  const [myCode, setMyCodeState] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState<RecoveryDeliveryChannel>('sms');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaRequired, setCaptchaRequired] = useState(Boolean(SMARTCAPTCHA_CLIENT_KEY));
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [sendRetryUntil, setSendRetryUntil] = useState(0);
  const [confirmRetryUntil, setConfirmRetryUntil] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const requestInFlight = useRef(false);
  const generation = useRef(0);

  const { requestRecoveryCode: sendCodeApi, resetRecoveryPassword: resetPasswordApi } = useAuthStore(
    (state) => ({
      requestRecoveryCode: state.requestRecoveryCode,
      resetRecoveryPassword: state.resetRecoveryPassword,
    })
  );
  const sendRetryAfter = remainingSeconds(sendRetryUntil, currentTime);
  const confirmRetryAfter = remainingSeconds(confirmRetryUntil, currentTime);
  const isPasswordValid = isPasswordStrong(myPWD) && myPWD.length > 0 && myPWD === repeatPWD;

  useEffect(
    () => () => {
      generation.current += 1;
    },
    []
  );

  useEffect(() => {
    const lastDeadline = Math.max(sendRetryUntil, confirmRetryUntil);
    if (lastDeadline <= 0) return undefined;

    const syncTime = () => {
      const now = Date.now();
      setCurrentTime(now);
      if (now >= lastDeadline) window.clearInterval(timer);
    };
    const timer = window.setInterval(syncTime, 1000);
    window.addEventListener('focus', syncTime);
    document.addEventListener('visibilitychange', syncTime);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', syncTime);
      document.removeEventListener('visibilitychange', syncTime);
    };
  }, [sendRetryUntil, confirmRetryUntil]);

  function setWait(setter: (value: number) => void, value: unknown): void {
    const now = Date.now();
    setter(now + waitSeconds(value) * 1000);
    setCurrentTime(now);
  }

  function resetCaptcha(): void {
    setCaptchaToken('');
    setCaptchaResetKey((key) => key + 1);
  }

  function setMyPWD(value: string): void {
    setMyPWDState(stripPasswordSpaces(value));
    setErrorText('');
  }

  function setRepeatPWD(value: string): void {
    setRepeatPWDState(stripPasswordSpaces(value));
    setErrorText('');
  }

  function setMyCode(value: string): void {
    setMyCodeState(value.replace(/\D/g, '').slice(0, 6));
    setErrorText('');
  }

  function editRequest(): void {
    if (loader) return;
    setActiveStep(0);
    setMyCodeState('');
    setMyPWDState('');
    setRepeatPWDState('');
    setErrorText('');
    resetCaptcha();
  }

  function backToCode(): void {
    if (loader) return;
    setActiveStep(1);
    setErrorText('');
  }

  async function requestRecoveryCode(): Promise<void> {
    if (
      requestInFlight.current ||
      passwordChanged ||
      !isPhoneValid(myLogin) ||
      remainingSeconds(sendRetryUntil, Date.now()) > 0
    ) return;

    if (activeStep === 1 && captchaRequired) {
      editRequest();
      return;
    }
    if (captchaRequired && (!SMARTCAPTCHA_CLIENT_KEY || !captchaToken)) {
      setErrorText(
        SMARTCAPTCHA_CLIENT_KEY
          ? 'Подтвердите, что вы не робот, и повторите отправку.'
          : 'Проверка безопасности недоступна. Попробуйте позже.'
      );
      return;
    }

    requestInFlight.current = true;
    const requestGeneration = generation.current;
    setLoader(true);
    setErrorText('');
    try {
      const res = await sendCodeApi(myLogin, deliveryChannel, captchaRequired ? captchaToken : '');
      if (generation.current !== requestGeneration) return;
      if (typeof res.captcha_required === 'boolean') setCaptchaRequired(res.captcha_required);
      setWait(setSendRetryUntil, res.st ? res.resend_after : res.retry_after);
      resetCaptcha();
      if (res.st === true) {
        log('auth_recovery_code_sent', 'Запрошен код восстановления', { channel: deliveryChannel });
        setMyCodeState('');
        setWait(setConfirmRetryUntil, 0);
        setActiveStep(1);
      } else {
        setErrorText(
          res.captcha_required && !SMARTCAPTCHA_CLIENT_KEY
            ? 'Проверка безопасности недоступна. Попробуйте позже.'
            : res.text || 'Не удалось отправить код восстановления.'
        );
      }
    } catch {
      if (generation.current === requestGeneration) {
        setErrorText('Не удалось отправить код восстановления. Попробуйте ещё раз.');
        resetCaptcha();
      }
    } finally {
      if (generation.current === requestGeneration) {
        requestInFlight.current = false;
        setLoader(false);
      }
    }
  }

  function confirmRecoveryCode(): void {
    if (myCode.length !== 6 || loader || confirmRetryAfter > 0) return;
    setErrorText('');
    setActiveStep(2);
  }

  async function saveRecoveryPassword(): Promise<void> {
    if (
      requestInFlight.current ||
      passwordChanged ||
      myCode.length !== 6 ||
      !isPasswordValid ||
      remainingSeconds(confirmRetryUntil, Date.now()) > 0
    ) return;

    requestInFlight.current = true;
    const requestGeneration = generation.current;
    setLoader(true);
    setErrorText('');
    try {
      const res = await resetPasswordApi(myLogin, myCode, myPWD);
      if (generation.current !== requestGeneration) return;
      setWait(setConfirmRetryUntil, res.retry_after);
      if (res.st === true) {
        setPasswordChanged(true);
        setMyCodeState('');
        setMyPWDState('');
        setRepeatPWDState('');
        log('auth_recovery_password_changed', 'Пароль восстановлен');
      } else {
        if (/код подтверждения.*(неверен|истёк)/i.test(res.text || '')) {
          setActiveStep(1);
          setMyCodeState('');
        }
        setErrorText(res.text || 'Не удалось обновить пароль.');
      }
    } catch {
      if (generation.current === requestGeneration) {
        setErrorText('Не удалось обновить пароль. Попробуйте ещё раз.');
      }
    } finally {
      if (generation.current === requestGeneration) {
        requestInFlight.current = false;
        setLoader(false);
      }
    }
  }

  const panelTitle = passwordChanged
    ? 'Пароль изменён'
    : ['Восстановление доступа', 'Введите код', 'Новый пароль'][activeStep];
  const panelText = passwordChanged
    ? 'Теперь вы можете войти с новым паролем.'
    : [
        'Укажите номер телефона и способ получения кода.',
        'Введите шестизначный код подтверждения.',
        'Придумайте и повторите новый пароль.',
      ][activeStep];
  const helperText = [
    'Если номер зарегистрирован, код подтверждения будет отправлен.',
    'Используйте код из последнего сообщения или звонка.',
    'Используйте строчные и заглавные латинские буквы и цифры.',
  ][activeStep];
  const submitOnEnter: SubmitOnEnter = (handler: SubmitHandler) => (event) => {
    if (event.key === 'Enter') handler();
  };
  const retryAfter = activeStep === 0 ? sendRetryAfter : confirmRetryAfter;
  const canResend = !loader && !passwordChanged && sendRetryAfter <= 0 && isPhoneValid(myLogin);
  const canSubmit =
    !loader &&
    !passwordChanged &&
    retryAfter <= 0 &&
    (activeStep === 0
      ? Boolean(isPhoneValid(myLogin) && (!captchaRequired || (SMARTCAPTCHA_CLIENT_KEY && captchaToken)))
      : activeStep === 1
        ? myCode.length === 6
        : isPasswordValid);

  return {
    loader,
    panelTitle,
    panelText,
    activeStep,
    myLogin,
    setMyLogin,
    myPWD,
    setMyPWD,
    repeatPWD,
    setRepeatPWD,
    deliveryChannel,
    setDeliveryChannel,
    submitOnEnter,
    requestRecoveryCode,
    myCode,
    setMyCode,
    confirmRecoveryCode,
    saveRecoveryPassword,
    editRequest,
    backToCode,
    errorText,
    helperText,
    captchaRequired,
    captchaResetKey,
    setCaptchaToken,
    resetCaptcha,
    retryAfter,
    sendRetryAfter,
    passwordChanged,
    canSubmit,
    canResend,
    isPasswordValid,
  };
}
