import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { log } from '@/components/analytics';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { redirectToSsoLogin } from '@/features/auth/api/auth.api';

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

  async function loginFN(): Promise<void> {
    if (myLogin.length === 0 || myPWD.length === 0) {
      return;
    }

    const res = await login(myLogin, myPWD);

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

  return {
    loginWithSso,
    loginFN,
    myLogin,
    setMyLogin,
    myPWD,
    setMyPWD,
    loginErr,
    router,
  };
}
