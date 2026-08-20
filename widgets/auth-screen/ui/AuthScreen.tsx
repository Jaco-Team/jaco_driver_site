import Meta from '@/components/meta';

import Link from 'next/link';
import Image from 'next/image';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import { log } from '@/components/analytics';

import MyTextInput from '@/shared/ui/MyTextInput';
import PasswordInput from '@/shared/ui/PasswordInput';
import YandexSmartCaptcha, { SMARTCAPTCHA_CLIENT_KEY } from '@/shared/ui/YandexSmartCaptcha';
import { roboto } from '@/shared/ui/Font';

import { useAuthPage } from '../model/useAuthPage';

export default function AuthPage() {
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

  return (
    <Meta title="Авторизация">
      <Grid
        container
        spacing={3}
        className={'auth ' + roboto.variable}
        sx={{
          justifyContent: 'center',
        }}
      >
        <Grid size={{ xs: 12, md: 8, lg: 5 }}>
          <section className="auth__panel auth__panel--solo">
            <div className="auth__logoBadge">
              <Image alt={'Лого'} src="/Logo.png" width={92} height={92} priority={true} />
            </div>

            <span className="auth__eyebrow">Авторизация</span>
            <h2 className="auth__panelTitle">Вход в аккаунт</h2>
            <p className="auth__panelText">
              Введите номер телефона и пароль, чтобы продолжить работу в приложении.
            </p>

            <div className="auth__fieldGroup">
              <MyTextInput
                label="Номер телефона"
                type={'text'}
                value={myLogin}
                onChange={(e) => setMyLogin(e.target.value)}
              />
              <PasswordInput
                label="Пароль"
                value={myPWD}
                onChange={(e) => setMyPWD(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loginFN()}
              />
            </div>

            {SMARTCAPTCHA_CLIENT_KEY && captchaRequired ? (
              <YandexSmartCaptcha
                resetKey={captchaResetKey}
                onSuccess={setCaptchaToken}
                onTokenExpired={resetCaptcha}
              />
            ) : null}

            {loginErr ? (
              <div className="auth__error">{loginErr}</div>
            ) : (
              <div className="auth__hint">
                Используйте номер телефона, указанный в вашем рабочем аккаунте.
              </div>
            )}

            <Button
              variant="contained"
              fullWidth
              className="auth__primaryButton"
              disabled={!canSubmit}
              onClick={() => loginFN()}
            >
              {retryAfter > 0 ? 'Попробуйте позже' : 'Войти'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              className="auth__secondaryButton"
              onClick={loginWithSso}
            >
              Продолжить через SSO
            </Button>

            <div className="auth__linkRow">
              <span className="auth__linkCaption">Не получается войти?</span>
              <Link
                className="auth__link"
                href="/registration"
                onClick={(e) => {
                  e.preventDefault();
                  let done = false;
                  const go = () => {
                    if (done) return;
                    done = true;
                    router.push('/registration', { scroll: false });
                  };
                  log('auth_go_to_resetpwd', 'Восстановление пароля', undefined);
                  setTimeout(go, 200);
                }}
              >
                Восстановить пароль
              </Link>
            </div>
          </section>
        </Grid>
      </Grid>
    </Meta>
  );
}
