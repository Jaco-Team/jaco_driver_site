import { useEffect, useRef, useState } from 'react';

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

function remainingSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

function waitSeconds(value: unknown): number {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0;
}

export function useRegistrationPage(): UseRegistrationPageResult {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<RecoveryStep>(0);
  const [loader, setLoader] = useState(false);
  const [err1, setErr1] = useState('');
  const [err2, setErr2] = useState('');
  const [myLogin, setMyLogin] = useState('');
  const [myPWD, setMyPWDState] = useState('');
  const [myCode, setMyCodeState] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaRequired, setCaptchaRequired] = useState(Boolean(SMARTCAPTCHA_CLIENT_KEY));
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [showResendCaptcha, setShowResendCaptcha] = useState(false);
  const [sendRetryUntil, setSendRetryUntil] = useState(0);
  const [confirmRetryUntil, setConfirmRetryUntil] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now);
  const sendDeadline = useRef(0);
  const confirmDeadline = useRef(0);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const requestInFlight = useRef(false);
  const recoveryConfirmed = useRef(false);
  const generation = useRef(0);

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
  const sendRetryAfter = remainingSeconds(sendRetryUntil, currentTime);
  const confirmRetryAfter = remainingSeconds(confirmRetryUntil, currentTime);

  useEffect(() => () => {
    generation.current += 1;
  }, []);

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

  function setSendWait(value: unknown): void {
    const now = Date.now();
    sendDeadline.current = now + waitSeconds(value) * 1000;
    setSendRetryUntil(sendDeadline.current);
    setCurrentTime(now);
  }

  function setConfirmWait(value: unknown): void {
    const now = Date.now();
    confirmDeadline.current = now + waitSeconds(value) * 1000;
    setConfirmRetryUntil(confirmDeadline.current);
    setCurrentTime(now);
  }

  function resetCaptcha(): void {
    setCaptchaToken('');
    setCaptchaResetKey((key) => key + 1);
  }

  function setMyPWD(value: string): void {
    setMyPWDState(stripPasswordSpaces(value));
    if (err1) setErr1('');
  }

  function setMyCode(value: string): void {
    setMyCodeState(value.replace(/\D/g, '').slice(0, 6));
    if (err2) setErr2('');
  }

  async function requestRecoveryCode(): Promise<void> {
    if (
      requestInFlight.current || recoveryConfirmed.current || !myLogin.trim() ||
      !isPasswordValid || remainingSeconds(sendDeadline.current, Date.now()) > 0
    ) return;

    const isResend = activeStep === 1;
    const setSendError = isResend ? setErr2 : setErr1;
    if (captchaRequired && (!SMARTCAPTCHA_CLIENT_KEY || !captchaToken)) {
      if (isResend && SMARTCAPTCHA_CLIENT_KEY) {
        setShowResendCaptcha(true);
        setSendError('');
        return;
      }
      setSendError(SMARTCAPTCHA_CLIENT_KEY
        ? 'Подтвердите, что вы не робот, и повторите отправку.'
        : 'Проверка безопасности недоступна. Попробуйте позже.');
      return;
    }

    requestInFlight.current = true;
    const requestGeneration = generation.current;
    setLoader(true);
    setSendError('');
    try {
      const res = await requestRecoveryCodeApi(myLogin, myPWD, captchaRequired ? captchaToken : '');
      if (generation.current !== requestGeneration) return;
      if (typeof res.captcha_required === 'boolean') {
        setCaptchaRequired(res.captcha_required);
        if (isResend) setShowResendCaptcha(res.captcha_required);
      }
      setSendWait(res.st ? res.resend_after : res.retry_after);
      resetCaptcha();

      if (res.st === true) {
        log('auth_send_sms', 'Отправка СМС-кода');
        setMyCodeState('');
        setShowResendCaptcha(false);
        setErr2('');
        setConfirmWait(0);
        setActiveStep(1);
      } else {
        log('auth_send_sms_fail', 'Ошибка отправки СМС-кода');
        setSendError(res.captcha_required && !SMARTCAPTCHA_CLIENT_KEY
          ? 'Проверка безопасности недоступна. Попробуйте позже.'
          : res.text || 'Не удалось отправить код восстановления.');
      }
    } catch {
      if (generation.current === requestGeneration) {
        setSendError('Не удалось отправить код восстановления. Попробуйте ещё раз.');
        resetCaptcha();
      }
    } finally {
      if (generation.current === requestGeneration) {
        requestInFlight.current = false;
        setLoader(false);
      }
    }
  }

  async function confirmRecoveryCode(codeOverride?: string): Promise<void> {
    const code = (codeOverride ?? myCode).replace(/\D/g, '').slice(0, 6);
    if (
      code.length !== 6 || requestInFlight.current || recoveryConfirmed.current ||
      remainingSeconds(confirmDeadline.current, Date.now()) > 0
    ) return;

    requestInFlight.current = true;
    const requestGeneration = generation.current;
    setLoader(true);
    setErr2('');
    try {
      const res = await confirmRecoveryCodeApi(myLogin, code);
      if (generation.current !== requestGeneration) return;
      setConfirmWait(res.retry_after);
      if (res.st === true) {
        recoveryConfirmed.current = true;
        setPasswordChanged(true);
        const authResult = await loginByPasswordApi(myLogin, myPWD);
        if (generation.current !== requestGeneration) return;
        if (authResult.st === true) {
          log('auth_recovery_autologin_success', 'Автовход после восстановления пароля');
          router.push('/list_orders', { scroll: false });
        } else {
          log('auth_recovery_autologin_fail', 'Не удалось выполнить автовход после восстановления');
          setErr2('Пароль изменён. Войдите с новым паролем на странице авторизации.');
        }
      } else {
        setErr2(res.text || 'Не удалось подтвердить код восстановления.');
      }
    } catch {
      if (generation.current === requestGeneration) {
        setErr2(recoveryConfirmed.current
          ? 'Пароль изменён. Войдите с новым паролем на странице авторизации.'
          : 'Не удалось подтвердить код восстановления. Попробуйте ещё раз.');
      }
    } finally {
      if (generation.current === requestGeneration) {
        requestInFlight.current = false;
        setLoader(false);
      }
    }
  }

  const panelTitle = passwordChanged ? 'Пароль изменён'
    : activeStep === 0 ? 'Восстановление доступа' : 'Подтверждение по SMS';
  const panelText = passwordChanged ? 'Используйте новый пароль для входа в аккаунт.'
    : activeStep === 0
      ? 'Укажите номер телефона и новый пароль. После этого мы отправим код подтверждения.'
      : 'Введите код из SMS, чтобы подтвердить номер и завершить восстановление пароля.';
  const errorText = activeStep === 0 ? err1 : err2;
  const helperText = activeStep === 0
    ? 'Если номер зарегистрирован, отправим SMS с кодом.'
    : 'Используйте код из последнего SMS.';
  const submitOnEnter: SubmitOnEnter = (handler: SubmitHandler) => (event) => {
    if (event.key === 'Enter') handler();
  };
  const retryAfter = activeStep === 0 ? sendRetryAfter : confirmRetryAfter;
  const canResend = !loader && !passwordChanged && sendRetryAfter <= 0 &&
    Boolean(myLogin.trim() && isPasswordValid &&
      (!showResendCaptcha || !captchaRequired || (SMARTCAPTCHA_CLIENT_KEY && captchaToken)));
  const canSubmit = !loader && !passwordChanged && retryAfter <= 0 &&
    (activeStep === 1 ? myCode.length === 6
      : Boolean(myLogin.trim() && isPasswordValid &&
        (!captchaRequired || (SMARTCAPTCHA_CLIENT_KEY && captchaToken))));

  return {
    loader, panelTitle, panelText, activeStep, myLogin, setMyLogin, myPWD, setMyPWD,
    submitOnEnter, requestRecoveryCode, myCode, setMyCode, confirmRecoveryCode,
    errorText, helperText, captchaRequired, showResendCaptcha, captchaResetKey, setCaptchaToken, resetCaptcha,
    retryAfter, sendRetryAfter, passwordChanged, canSubmit, canResend, isPasswordValid,
  };
}
