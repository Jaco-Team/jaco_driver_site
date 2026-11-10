import Meta from '@/components/meta';

import { log } from '@/components/analytics';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import { formatCountdown } from '@/shared/lib/phoneInput';
import AuthCard from '@/shared/ui/auth/AuthCard';
import AuthPasswordField from '@/shared/ui/auth/AuthPasswordField';
import { SnackbarNotification } from '@/shared/ui/SnackbarNotification/SnackbarNotification';
import YandexSmartCaptcha, { SMARTCAPTCHA_CLIENT_KEY } from '@/shared/ui/YandexSmartCaptcha';

import { useAuthPage } from '../model/useAuthPage';

/** Вход в том же виде, что страница входа SSO и ШЭФ. */
export default function AuthPage() {
  const authNotice = useAuthStore((state) => state.authNotice);
  const setAuthNotice = useAuthStore((state) => state.setAuthNotice);
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const {
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
  } = useAuthPage();

  function goToRecovery(): void {
    log('auth_go_to_resetpwd', 'Восстановление пароля', undefined);
    router.push('/registration', { scroll: false });
  }

  return (
    <Meta title="Авторизация">
      <SnackbarNotification
        state={{
          open: Boolean(authNotice),
          vertical: 'top',
          horizontal: 'center',
          severity: 'success',
          message: authNotice ?? '',
        }}
        onClose={() => setAuthNotice(null)}
        fontSize={globalFontSize}
      />
      <AuthCard title="Вход в аккаунт" subtitle="Введите номер телефона и пароль">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void loginFN();
          }}
        >
          <label className="sso-label" htmlFor="auth-login">
            Номер телефона
          </label>
          <input
            className="sso-input"
            type="tel"
            id="auth-login"
            name="username"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 (999) 123-45-67"
            value={myLogin}
            onChange={(event) => setMyLogin(event.target.value)}
          />

          <div className="sso-gap-3">
            <AuthPasswordField
              label="Пароль"
              subject="пароль"
              name="password"
              autoComplete="current-password"
              value={myPWD}
              onChange={setMyPWD}
            />
          </div>

          {SMARTCAPTCHA_CLIENT_KEY && captchaRequired ? (
            <div className="sso-captcha">
              <YandexSmartCaptcha
                resetKey={captchaResetKey}
                onSuccess={setCaptchaToken}
                onTokenExpired={resetCaptcha}
              />
            </div>
          ) : null}

          {loginErr ? (
            <div className="sso-error" role="alert">
              <p>{loginErr}</p>
            </div>
          ) : null}

          {retryAfter > 0 ? (
            <p className="sso-note">Повторите через {formatCountdown(retryAfter)}</p>
          ) : null}

          <button className="sso-primary" type="submit" disabled={!canSubmit}>
            Войти
          </button>

          <button className="sso-secondary" type="button" onClick={loginWithSso}>
            Продолжить через SSO
          </button>

          <button className="sso-link" type="button" onClick={goToRecovery}>
            Восстановить пароль
          </button>
        </form>
      </AuthCard>
    </Meta>
  );
}
