import type { Dispatch, KeyboardEvent, SetStateAction } from 'react';

import type { RecoveryDeliveryChannel } from '@/features/auth/api/auth.api';

export type RecoveryStep = 0 | 1 | 2;

export type SubmitHandler = () => void | Promise<void>;

export type SubmitOnEnter = (
  handler: SubmitHandler
) => (event: KeyboardEvent<HTMLInputElement>) => void;

export interface UseRegistrationPageResult {
  loader: boolean;
  panelTitle: string;
  panelText: string;
  activeStep: RecoveryStep;
  myLogin: string;
  setMyLogin: Dispatch<SetStateAction<string>>;
  myPWD: string;
  setMyPWD: (value: string) => void;
  repeatPWD: string;
  setRepeatPWD: (value: string) => void;
  deliveryChannel: RecoveryDeliveryChannel;
  setDeliveryChannel: Dispatch<SetStateAction<RecoveryDeliveryChannel>>;
  submitOnEnter: SubmitOnEnter;
  requestRecoveryCode: () => Promise<void>;
  myCode: string;
  setMyCode: (value: string) => void;
  confirmRecoveryCode: () => void;
  saveRecoveryPassword: () => Promise<void>;
  editRequest: () => void;
  backToCode: () => void;
  errorText: string;
  helperText: string;
  captchaRequired: boolean;
  captchaResetKey: number;
  setCaptchaToken: (token: string) => void;
  resetCaptcha: () => void;
  retryAfter: number;
  sendRetryAfter: number;
  passwordChanged: boolean;
  canSubmit: boolean;
  canResend: boolean;
  isPasswordValid: boolean;
}
