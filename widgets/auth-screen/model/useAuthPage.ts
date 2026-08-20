import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { log } from '@/components/analytics';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { redirectToSsoLogin } from '@/features/auth/api/auth.api';
import { SMARTCAPTCHA_CLIENT_KEY } from '@/shared/ui/YandexSmartCaptcha';

import { UseAuthPageResult } from './useAuthPage.type';

export function useAuthPage(): UseAuthPageResult {
  const router = useRouter();

  const { loginErr, login, setLoginErr } = useAuthStore((state) => ({
    loginErr: state.loginErr,
    login: state.login,
    setLoginErr: state.setLoginErr,
  }));

  const [myLogin, setMyLogin] = useState('');
  const [myPWD, setMyPWD] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error === 'sso_failed') {
      setLoginErr('Не удалось войти через SSO. Попробуйте еще раз.');
    }
  }, [setLoginErr]);

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

  async function loginFN(): Promise<void> {
    if (myLogin.length === 0 || myPWD.length === 0 || retryAfter > 0) {
      return;
    }

    if (captchaRequired && (!SMARTCAPTCHA_CLIENT_KEY || !captchaToken)) {
      setLoginErr(
        SMARTCAPTCHA_CLIENT_KEY
          ? 'Пожалуйста, подтвердите, что вы не робот'
          : 'Защита CAPTCHA временно недоступна. Обратитесь к администратору.'
      );
      return;
    }

    const res = await login(myLogin, myPWD, captchaToken);

    if (res.captcha_required) {
      setCaptchaRequired(true);
    }

    if (res.retry_after && res.retry_after > 0) {
      setRetryAfter(Math.ceil(res.retry_after));
    }

    resetCaptcha();

    if (res.st === true) {
      log('auth_login', 'Успешная авторизация');
      router.push('/list_orders', { scroll: false });
    } else {
      log('auth_login_fail', 'Ошибка авторизации');
    }
  }

  function loginWithSso(): void {
    log('auth_sso_click', 'Переход к SSO авторизации');
    redirectToSsoLogin();
  }

  const canSubmit =
    retryAfter <= 0 && (!captchaRequired || Boolean(SMARTCAPTCHA_CLIENT_KEY && captchaToken));

  return {
    loginWithSso,
    loginFN,
    myLogin,
    setMyLogin,
    myPWD,
    setMyPWD,
    loginErr,
    router,
    captchaRequired,
    captchaResetKey,
    setCaptchaToken,
    resetCaptcha,
    retryAfter,
    canSubmit,
  };
}
