import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { log } from '@/components/analytics';
import {
  fetchRecoveryChannels,
  requestRecoveryCode,
  resetPasswordWithCode,
  type RecoveryChannel,
} from '@/features/auth/api/passwordRecovery.api';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { stripPasswordSpaces } from '@/shared/lib/passwordRequirements';
import { maskPhone, parsePhoneInput, PHONE_FORMAT_ERROR } from '@/shared/lib/phoneInput';
import { AUTH_CODE_LENGTH } from '@/shared/ui/auth/AuthCodeCells';
import { SMARTCAPTCHA_CLIENT_KEY } from '@/shared/ui/YandexSmartCaptcha';

import type {
  RecoveryError,
  RecoveryPasswordRules,
  RecoveryStep,
  UseRegistrationPageResult,
} from './useRegistrationPage.type';

function remainingSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

/**
 * Восстановление пароля тем же сценарием, что на странице входа SSO и в ШЭФ:
 * номер и способ получения кода → код → новый пароль → готово. Код сервер
 * проверяет вместе с новым паролем, одним запросом.
 */
export function useRegistrationPage(): UseRegistrationPageResult {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [step, setStep] = useState<RecoveryStep>('request');
  const [loading, setLoading] = useState(false);
  const [phone, setPhoneState] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneServerError, setPhoneServerError] = useState('');
  const [channels, setChannels] = useState<RecoveryChannel[]>(['sms']);
  const [channel, setChannel] = useState<RecoveryChannel>('sms');
  const [code, setCodeState] = useState('');
  const [password, setPasswordState] = useState('');
  const [repeatPassword, setRepeatPasswordState] = useState('');
  const [error, setError] = useState<RecoveryError | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [captchaRequired, setCaptchaRequired] = useState(Boolean(SMARTCAPTCHA_CLIENT_KEY));
  const [resendUntil, setResendUntil] = useState(0);
  const [retryUntil, setRetryUntil] = useState(0);
  const [now, setNow] = useState(Date.now);

  const inFlight = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    const current = generation.current;

    void fetchRecoveryChannels().then((available) => {
      if (generation.current !== current) return;
      setChannels(available);
      setChannel((selected) => (available.includes(selected) ? selected : available[0]));
    });

    return () => {
      generation.current += 1;
    };
  }, []);

  useEffect(() => {
    const lastDeadline = Math.max(resendUntil, retryUntil);

    if (lastDeadline <= Date.now()) return undefined;

    const syncTime = () => setNow(Date.now());
    const timer = window.setInterval(syncTime, 1000);

    window.addEventListener('focus', syncTime);
    document.addEventListener('visibilitychange', syncTime);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', syncTime);
      document.removeEventListener('visibilitychange', syncTime);
    };
  }, [resendUntil, retryUntil]);

  const parsedPhone = parsePhoneInput(phone);
  const resendAfter = remainingSeconds(resendUntil, now);
  const retryAfter = remainingSeconds(retryUntil, now);
  const passwordRules: RecoveryPasswordRules = {
    length: password.length >= 8,
    characters: /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password),
    match: password.length > 0 && password === repeatPassword,
  };
  const captchaAvailable = Boolean(SMARTCAPTCHA_CLIENT_KEY);
  const captchaVisible = captchaRequired && captchaAvailable && (step === 'request' || step === 'code');
  const captchaSatisfied = !captchaRequired || (captchaAvailable && Boolean(captchaToken));

  function startWait(setDeadline: (value: number) => void, seconds: number): void {
    const current = Date.now();

    setDeadline(seconds > 0 ? current + seconds * 1000 : 0);
    setNow(current);
  }

  function resetCaptcha(): void {
    setCaptchaToken('');
    setCaptchaResetKey((key) => key + 1);
  }

  function setPhone(value: string): void {
    setPhoneState(parsePhoneInput(value).display);
    setPhoneServerError('');
    if (error) setError(null);
  }

  function setCode(value: string): void {
    setCodeState(value.replace(/\D/g, '').slice(0, AUTH_CODE_LENGTH));
    if (error) setError(null);
  }

  function setPassword(value: string): void {
    setPasswordState(stripPasswordSpaces(value));
    if (error) setError(null);
  }

  function setRepeatPassword(value: string): void {
    setRepeatPasswordState(stripPasswordSpaces(value));
    if (error) setError(null);
  }

  function clearRecoveryInputs(): void {
    setCodeState('');
    setPasswordState('');
    setRepeatPasswordState('');
  }

  async function sendCode(): Promise<void> {
    if (inFlight.current) return;

    if (!parsedPhone.valid) {
      setPhoneTouched(true);
      return;
    }

    if (remainingSeconds(resendUntil, Date.now()) > 0) return;

    if (captchaRequired && !captchaSatisfied) {
      setError({
        text: captchaAvailable
          ? 'Пожалуйста, подтвердите, что вы не робот'
          : 'Проверка безопасности недоступна. Попробуйте позже.',
        code: false,
      });
      return;
    }

    inFlight.current = true;
    const current = generation.current;

    setLoading(true);
    setError(null);

    const result = await requestRecoveryCode(
      parsedPhone.apiValue,
      channel,
      captchaRequired ? captchaToken : ''
    );

    if (generation.current !== current) return;

    inFlight.current = false;
    setLoading(false);
    resetCaptcha();
    if (result.captchaRequired) setCaptchaRequired(true);

    if (result.st) {
      log('auth_send_sms', 'Отправка кода восстановления');
      setRecoveryMessage(result.text);
      startWait(setResendUntil, result.resendAfter);
      startWait(setRetryUntil, 0);
      clearRecoveryInputs();
      setStep('code');
      return;
    }

    log('auth_send_sms_fail', 'Ошибка отправки кода восстановления');
    startWait(setResendUntil, result.retryAfter);

    if (result.errorCode === 'account_not_found') {
      // Как в ШЭФ: неизвестный номер показываем под полем и возвращаем к его вводу.
      setPhoneServerError(result.text);
      setPhoneTouched(true);
      setRecoveryMessage('');
      clearRecoveryInputs();
      setStep('request');
      return;
    }

    setError({ text: result.text, code: false });
  }

  function confirmCode(): void {
    if (code.length !== AUTH_CODE_LENGTH) {
      setError({ text: 'Введите 6 цифр кода', code: false });
      return;
    }

    // Код проверяется сервером вместе с новым паролем, одним действием.
    setError(null);
    setStep('password');
  }

  async function savePassword(): Promise<void> {
    if (inFlight.current || !passwordRules.length || !passwordRules.characters || !passwordRules.match) {
      return;
    }

    inFlight.current = true;
    const current = generation.current;

    setLoading(true);
    setError(null);

    const result = await resetPasswordWithCode(parsedPhone.apiValue, code, password);

    if (generation.current !== current) return;

    inFlight.current = false;
    setLoading(false);

    if (result.st) {
      log('auth_recovery_password_changed', 'Пароль изменён через восстановление');
      setCodeState('');
      setStep('success');
      return;
    }

    if (result.errorCode === 'invalid_code' || result.errorCode === 'too_many_attempts') {
      // После исчерпания попыток помогает только новый код: возвращаем к его вводу.
      setCodeState('');
      setError({ text: result.text, code: result.errorCode === 'invalid_code' });
      setStep('code');
      return;
    }

    startWait(setRetryUntil, result.retryAfter);
    setError({ text: result.text, code: false });
  }

  async function loginWithNewPassword(): Promise<void> {
    if (inFlight.current) return;

    inFlight.current = true;
    const current = generation.current;

    setLoading(true);

    const result = await login(parsedPhone.apiValue, password);

    if (generation.current !== current) return;

    inFlight.current = false;
    setLoading(false);

    if (result.st === true) {
      log('auth_recovery_autologin_success', 'Вход после восстановления пароля');
      router.push('/list_orders', { scroll: false });
    } else {
      log('auth_recovery_autologin_fail', 'Не удалось войти после восстановления пароля');
      router.push('/auth', { scroll: false });
    }
  }

  function submit(): void {
    if (loading) return;

    if (step === 'request') void sendCode();
    else if (step === 'code') confirmCode();
    else if (step === 'password') void savePassword();
    else void loginWithNewPassword();
  }

  function back(): void {
    if (loading) return;

    setError(null);
    setStep(step === 'password' ? 'code' : 'request');
  }

  function editPhone(): void {
    if (loading) return;

    setError(null);
    clearRecoveryInputs();
    setStep('request');
  }

  const canSubmit =
    !loading &&
    (step === 'request'
      ? parsedPhone.valid && resendAfter <= 0 && captchaSatisfied
      : step === 'code'
        ? code.length === AUTH_CODE_LENGTH
        : step === 'password'
          ? passwordRules.length && passwordRules.characters && passwordRules.match && retryAfter <= 0
          : true);

  return {
    step,
    loading,
    phone,
    setPhone,
    phoneError: phoneServerError || (phoneTouched && !parsedPhone.valid ? PHONE_FORMAT_ERROR : ''),
    maskedPhone: parsedPhone.valid ? maskPhone(phone) : '',
    channels,
    channel,
    setChannel,
    code,
    setCode,
    password,
    setPassword,
    repeatPassword,
    setRepeatPassword,
    passwordRules,
    error,
    recoveryMessage,
    captchaVisible,
    captchaResetKey,
    setCaptchaToken,
    resetCaptcha,
    resendAfter,
    retryAfter,
    canSubmit,
    submit,
    resend: () => {
      if (!loading) void sendCode();
    },
    back,
    editPhone,
    changeChannel: editPhone,
    goToLogin: () => router.push('/auth', { scroll: false }),
  };
}
