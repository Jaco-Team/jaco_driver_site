import type { RecoveryChannel } from '@/features/auth/api/passwordRecovery.api';

export type RecoveryStep = 'request' | 'code' | 'password' | 'success';

export interface RecoveryPasswordRules {
  length: boolean;
  characters: boolean;
  match: boolean;
}

export interface RecoveryError {
  text: string;
  /** Ошибка относится к коду: показываем заголовок «Неверный код» и подсвечиваем ячейки. */
  code: boolean;
}

export interface UseRegistrationPageResult {
  step: RecoveryStep;
  loading: boolean;

  phone: string;
  setPhone: (value: string) => void;
  phoneError: string;
  maskedPhone: string;

  channels: RecoveryChannel[];
  channel: RecoveryChannel;
  setChannel: (channel: RecoveryChannel) => void;

  code: string;
  setCode: (value: string) => void;

  password: string;
  setPassword: (value: string) => void;
  repeatPassword: string;
  setRepeatPassword: (value: string) => void;
  passwordRules: RecoveryPasswordRules;

  error: RecoveryError | null;
  /** Сообщение сервера после отправки кода, видно на шаге ввода кода. */
  recoveryMessage: string;

  captchaVisible: boolean;
  captchaResetKey: number;
  setCaptchaToken: (token: string) => void;
  resetCaptcha: () => void;

  /** Сколько секунд осталось до повторной отправки кода. */
  resendAfter: number;
  /** Сколько секунд сервер просит подождать перед новой попыткой. */
  retryAfter: number;

  canSubmit: boolean;
  submit: () => void;
  resend: () => void;
  back: () => void;
  editPhone: () => void;
  changeChannel: () => void;
  goToLogin: () => void;
}
