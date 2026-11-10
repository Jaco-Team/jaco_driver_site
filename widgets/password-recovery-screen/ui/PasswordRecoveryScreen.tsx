import Meta from '@/components/meta';

import type { RecoveryChannel } from '@/features/auth/api/passwordRecovery.api';
import { formatCountdown } from '@/shared/lib/phoneInput';
import AuthCard from '@/shared/ui/auth/AuthCard';
import AuthChannelSwitch, { type AuthChannelOption } from '@/shared/ui/auth/AuthChannelSwitch';
import AuthCodeCells from '@/shared/ui/auth/AuthCodeCells';
import AuthIcon from '@/shared/ui/auth/AuthIcon';
import AuthPasswordField from '@/shared/ui/auth/AuthPasswordField';
import YandexSmartCaptcha from '@/shared/ui/YandexSmartCaptcha';

import { useRegistrationPage } from '../model/useRegistrationPage';
import type { RecoveryStep } from '../model/useRegistrationPage.type';

const CHANNEL_OPTIONS: Record<RecoveryChannel, AuthChannelOption<RecoveryChannel>> = {
  sms: { value: 'sms', label: 'SMS', helper: 'Придёт SMS с 6-значным кодом', icon: 'sms' },
  telegram: {
    value: 'telegram',
    label: 'Telegram',
    helper: 'Код придёт в чат с ботом, Telegram должен быть привязан к номеру',
    icon: 'telegram',
  },
  voice: { value: 'voice', label: 'Звонок', helper: 'Робот позвонит и продиктует код', icon: 'voice' },
};

const TITLES: Record<RecoveryStep, string> = {
  request: 'Восстановление пароля',
  code: 'Введите код',
  password: 'Придумайте новый пароль',
  success: 'Пароль изменён',
};

const SUBMIT_LABELS: Record<RecoveryStep, string> = {
  request: 'Отправить код',
  code: 'Подтвердить',
  password: 'Сохранить пароль',
  success: 'Войти',
};

const PASSWORD_RULES = [
  { key: 'length', text: 'Не менее 8 символов' },
  { key: 'characters', text: 'Буквы и цифры' },
  { key: 'match', text: 'Пароли совпадают' },
] as const;

export default function RegistrationPage() {
  const recovery = useRegistrationPage();
  const { step, loading } = recovery;

  const subtitle =
    step === 'request' ? (
      'Отправим код подтверждения на ваш номер'
    ) : step === 'code' ? (
      <>
        Код подтверждения для номера
        <br />
        <span className="sso-subtitle__phone">{recovery.maskedPhone}</span>{' '}
        <button
          className="sso-text-button sso-text-button--inline"
          type="button"
          onClick={recovery.editPhone}
        >
          Изменить
        </button>
      </>
    ) : step === 'password' ? (
      'Используйте строчные и заглавные латинские буквы и цифры'
    ) : (
      'Теперь вы можете войти с новым паролем'
    );

  const countdown =
    step === 'request' && recovery.resendAfter > 0
      ? `Отправить повторно через ${formatCountdown(recovery.resendAfter)}`
      : step === 'password' && recovery.retryAfter > 0
        ? `Повторите через ${formatCountdown(recovery.retryAfter)}`
        : '';

  return (
    <Meta title="Восстановление пароля">
      <AuthCard
        title={TITLES[step]}
        subtitle={subtitle}
        subtitleVariant={step === 'code' ? 'code' : step === 'success' ? 'success' : 'default'}
        mark={step === 'request' ? 'logo' : step === 'success' ? 'success' : 'none'}
        onBack={step === 'code' || step === 'password' ? recovery.back : undefined}
      >
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            recovery.submit();
          }}
        >
          {step === 'request' ? (
            <>
              <label className="sso-label" htmlFor="recovery-phone">
                Номер телефона
              </label>
              <input
                className="sso-input"
                type="tel"
                id="recovery-phone"
                name="login"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+7 (999) 123-45-67"
                value={recovery.phone}
                disabled={loading}
                aria-invalid={recovery.phoneError ? 'true' : undefined}
                onChange={(event) => recovery.setPhone(event.target.value)}
              />
              {recovery.phoneError ? (
                <p className="sso-field-error" role="alert">
                  {recovery.phoneError}
                </p>
              ) : null}
              {recovery.channels.length > 1 ? (
                <AuthChannelSwitch
                  options={recovery.channels.map((channel) => CHANNEL_OPTIONS[channel])}
                  value={recovery.channel}
                  onChange={recovery.setChannel}
                  disabled={loading}
                />
              ) : null}
            </>
          ) : null}

          {step === 'code' ? (
            <>
              <AuthCodeCells
                value={recovery.code}
                onChange={recovery.setCode}
                disabled={loading}
                error={Boolean(recovery.error?.code)}
              />
              <div className="sso-resend">
                {recovery.resendAfter > 0 ? (
                  <p className="sso-resend__wait">
                    Отправить повторно через {formatCountdown(recovery.resendAfter)}
                  </p>
                ) : (
                  <button
                    className="sso-text-button sso-text-button--accent"
                    type="button"
                    disabled={loading}
                    onClick={recovery.resend}
                  >
                    Отправить снова
                  </button>
                )}
                {recovery.channels.length > 1 ? (
                  <button
                    className="sso-text-button sso-text-button--small"
                    type="button"
                    disabled={loading}
                    onClick={recovery.changeChannel}
                  >
                    Выбрать другой способ
                  </button>
                ) : null}
              </div>
            </>
          ) : null}

          {step === 'password' ? (
            <>
              <AuthPasswordField
                label="Новый пароль"
                subject="новый пароль"
                autoComplete="new-password"
                value={recovery.password}
                onChange={recovery.setPassword}
                disabled={loading}
              />
              <div className="sso-gap-2">
                <AuthPasswordField
                  label="Повторите пароль"
                  subject="подтверждение пароля"
                  autoComplete="new-password"
                  value={recovery.repeatPassword}
                  onChange={recovery.setRepeatPassword}
                  disabled={loading}
                />
              </div>
              <ul className="sso-rules" aria-label="Требования к паролю">
                {PASSWORD_RULES.map((rule) => {
                  const met = recovery.passwordRules[rule.key];

                  return (
                    <li key={rule.key} data-met={met ? 'true' : 'false'}>
                      <AuthIcon name="check" />
                      <span>
                        {rule.text}
                        <span className="sso-visually-hidden">
                          {met ? ' — выполнено' : ' — не выполнено'}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}

          {recovery.captchaVisible ? (
            <div className="sso-captcha">
              <YandexSmartCaptcha
                resetKey={recovery.captchaResetKey}
                onSuccess={recovery.setCaptchaToken}
                onTokenExpired={recovery.resetCaptcha}
              />
            </div>
          ) : null}

          {step === 'code' && recovery.recoveryMessage && !recovery.error ? (
            <p className="sso-note">{recovery.recoveryMessage}</p>
          ) : null}

          {recovery.error ? (
            <div className="sso-error" role="alert">
              {recovery.error.code ? <p className="sso-error__title">Неверный код</p> : null}
              <p>{recovery.error.text}</p>
            </div>
          ) : null}

          {countdown ? <p className="sso-note">{countdown}</p> : null}

          <button
            className={step === 'success' ? 'sso-primary sso-primary--flush' : 'sso-primary'}
            type="submit"
            disabled={!recovery.canSubmit}
            aria-busy={loading ? 'true' : undefined}
          >
            {loading ? <span className="sso-spinner" aria-hidden="true" /> : null}
            <span>{SUBMIT_LABELS[step]}</span>
          </button>

          {step === 'request' ? (
            <button className="sso-link" type="button" onClick={recovery.goToLogin}>
              ← Вернуться ко входу
            </button>
          ) : null}
        </form>
      </AuthCard>
    </Meta>
  );
}
