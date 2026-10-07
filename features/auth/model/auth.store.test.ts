import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from './auth.store';

const mocks = vi.hoisted(() => ({
  loginToken: vi.fn(),
  fetchMe: vi.fn(),
  sendPasswordRecoveryCode: vi.fn(),
  confirmPasswordRecoveryCode: vi.fn(),
  getAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
}));

vi.mock('@/features/auth/api/auth.api', () => ({
  loginToken: mocks.loginToken,
  fetchMe: mocks.fetchMe,
  sendPasswordRecoveryCode: mocks.sendPasswordRecoveryCode,
  confirmPasswordRecoveryCode: mocks.confirmPasswordRecoveryCode,
}));

vi.mock('@/shared/api/token', () => ({
  getAuthToken: mocks.getAuthToken,
  setAuthToken: vi.fn(),
  clearAuthToken: mocks.clearAuthToken,
}));

vi.mock('@/features/offline/model/connectivity.store', () => ({
  markAppOffline: vi.fn(),
  markAppOnline: vi.fn(),
  isAppOnline: () => true,
}));

vi.mock('@/shared/lib/offline/cache', () => ({
  clearOfflineCache: vi.fn(),
  readOfflineCache: () => null,
  writeOfflineCache: vi.fn(),
}));

function resetStore() {
  window.localStorage.clear();
  useAuthStore.setState({
    isSubmitting: false,
    isSessionRefreshing: false,
    loginErr: '',
    session: { isAuth: 'load', token: '', user: null },
  });
}

describe('auth store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
    mocks.getAuthToken.mockReturnValue(null);
  });

  it('stores the session after token login and /me', async () => {
    mocks.loginToken.mockResolvedValue({ token: 'token-1', user_id: 7, login: '79870001122' });
    mocks.fetchMe.mockResolvedValue({
      user_id: 7,
      login: '79870001122',
      name: 'Водитель',
      city_id: 1,
      point_id: 12,
    });
    mocks.getAuthToken.mockReturnValue('token-1');

    const result = await useAuthStore.getState().login('79870001122', 'Password1');

    expect(result.st).toBe(true);
    expect(result.isAuth).toBe(true);
    expect(useAuthStore.getState().session.user).toMatchObject({
      id: 7,
      user_id: 7,
      login: '79870001122',
      token: 'token-1',
    });
    expect(useAuthStore.getState().loginErr).toBe('');
  });

  it('clears the session on CSRF 419 without treating it as a valid login', async () => {
    mocks.loginToken.mockRejectedValue({
      response: {
        status: 419,
        data: { message: 'CSRF token mismatch.' },
      },
    });

    const result = await useAuthStore.getState().login('79870001122', 'Password1');

    expect(result.st).toBe(false);
    expect(result.status).toBe(419);
    expect(result.text).toBe('Сессия истекла. Обновите страницу и попробуйте снова.');
    expect(useAuthStore.getState().session.isAuth).toBe(false);
    expect(mocks.clearAuthToken).toHaveBeenCalled();
  });

  it('keeps the legacy login CAPTCHA fallback on a generic throttled response', async () => {
    mocks.loginToken.mockRejectedValue({
      response: {
        status: 429,
        data: { message: 'Too Many Attempts.' },
        headers: { 'retry-after': '30' },
      },
    });

    const result = await useAuthStore.getState().login('79870001122', 'Password1');

    expect(result).toMatchObject({
      st: false,
      status: 429,
      captcha_required: false,
      retry_after: 30,
      text: 'Слишком много попыток. Повторите через 30 с.',
    });
  });

  it.each([1, '1'])('retains the legacy login coercion for CAPTCHA flag %s', async (flag) => {
    mocks.loginToken.mockRejectedValue({
      response: {
        status: 422,
        data: { text: 'Подтвердите CAPTCHA.', captcha_required: flag },
      },
    });

    const result = await useAuthStore.getState().login('79870001122', 'Password1');

    expect(result.captcha_required).toBe(true);
  });

  it('maps password recovery send errors including captcha', async () => {
    mocks.sendPasswordRecoveryCode.mockRejectedValue({
      response: {
        status: 422,
        data: {
          text: 'Не удалось подтвердить CAPTCHA. Попробуйте ещё раз.',
          captcha_required: true,
        },
      },
    });

    const result = await useAuthStore
      .getState()
      .requestPasswordRecoveryCode('79870001122', 'Password1');

    expect(result.st).toBe(false);
    expect(result.captcha_required).toBe(true);
    expect(result.text).toContain('CAPTCHA');
  });

  it('preserves an explicit false CAPTCHA flag from recovery send errors', async () => {
    mocks.sendPasswordRecoveryCode.mockRejectedValue({
      response: {
        status: 429,
        data: {
          text: 'Повторите через 15 с.',
          captcha_required: false,
          retry_after: 15,
        },
      },
    });

    const result = await useAuthStore
      .getState()
      .requestPasswordRecoveryCode('79870001122', 'Password1');

    expect(result).toMatchObject({
      st: false,
      status: 429,
      text: 'Повторите через 15 с.',
      captcha_required: false,
      retry_after: 15,
    });
  });

  it('maps recovery throttling without inventing a CAPTCHA flag', async () => {
    mocks.sendPasswordRecoveryCode.mockRejectedValue({
      response: {
        status: 429,
        data: { message: 'Too Many Attempts.' },
        headers: { 'retry-after': '30' },
      },
    });

    const result = await useAuthStore
      .getState()
      .requestPasswordRecoveryCode('79870001122', 'Password1');

    expect(result).toMatchObject({
      st: false,
      status: 429,
      text: 'Слишком много попыток. Повторите через 30 с.',
      retry_after: 30,
    });
    expect(result).not.toHaveProperty('captcha_required');
    expect(useAuthStore.getState().isSubmitting).toBe(false);
  });

  it('maps recovery network failures without inventing a CAPTCHA flag', async () => {
    mocks.sendPasswordRecoveryCode.mockRejectedValue({
      code: 'ERR_NETWORK',
      message: 'Network Error',
    });

    const result = await useAuthStore
      .getState()
      .requestPasswordRecoveryCode('79870001122', 'Password1');

    expect(result).toMatchObject({
      st: false,
      text: 'Не удалось подключиться к серверу.',
      retry_after: 0,
    });
    expect(result).not.toHaveProperty('captcha_required');
    expect(useAuthStore.getState().isSubmitting).toBe(false);
  });

  it('confirms a recovery code', async () => {
    mocks.confirmPasswordRecoveryCode.mockResolvedValue({ st: true });

    const result = await useAuthStore
      .getState()
      .confirmPasswordRecoveryCode('79870001122', '123456');

    expect(result).toEqual({ st: true });
    expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', '123456');
  });

  it('passes through a locked confirmation response returned with HTTP 200', async () => {
    const response = {
      st: false,
      text: 'Лимит попыток исчерпан. Повторите через 600 с.',
      locked: true,
      retry_after: 600,
    };
    mocks.confirmPasswordRecoveryCode.mockResolvedValue(response);

    const result = await useAuthStore
      .getState()
      .confirmPasswordRecoveryCode('79870001122', '123456');

    expect(result).toBe(response);
    expect(useAuthStore.getState().isSubmitting).toBe(false);
  });

  it('maps confirmation HTTP 429 errors with lock and wait metadata', async () => {
    const data = { message: 'Too Many Attempts.' };
    mocks.confirmPasswordRecoveryCode.mockRejectedValue({
      response: {
        status: 429,
        data,
        headers: { 'retry-after': '45' },
      },
    });

    const result = await useAuthStore
      .getState()
      .confirmPasswordRecoveryCode('79870001122', '123456');

    expect(result).toMatchObject({
      st: false,
      status: 429,
      text: 'Слишком много попыток. Повторите через 45 с.',
      data,
      locked: true,
      retry_after: 45,
    });
    expect(useAuthStore.getState().isSubmitting).toBe(false);
  });

  it('refreshSession uses /me when a token exists', async () => {
    mocks.getAuthToken.mockReturnValue('token-1');
    mocks.fetchMe.mockResolvedValue({
      user_id: 7,
      login: '79870001122',
      settings: { fontSize: 16 },
    });

    const result = await useAuthStore.getState().refreshSession();

    expect(result.st).toBe(true);
    expect(useAuthStore.getState().session.user?.settings?.fontSize).toBe(16);
  });

  it('keeps the session when /me fails because of a network error', async () => {
    mocks.getAuthToken.mockReturnValue('token-1');
    mocks.fetchMe.mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' });

    const result = await useAuthStore.getState().refreshSession();

    expect(result.st).toBe(true);
    expect(result.isAuth).toBe(true);
    expect(result.token).toBe('token-1');
    expect(useAuthStore.getState().session.isAuth).toBe(true);
    expect(mocks.clearAuthToken).not.toHaveBeenCalled();
  });

  it.each(['ECONNABORTED', 'ETIMEDOUT'])(
    'keeps the token and finishes session loading on %s',
    async (code) => {
      mocks.getAuthToken.mockReturnValue('token-1');
      mocks.fetchMe.mockRejectedValue({ code, message: 'timeout of 15000ms exceeded' });

      const result = await useAuthStore.getState().refreshSession();

      expect(result).toMatchObject({ st: true, isAuth: true, token: 'token-1' });
      expect(useAuthStore.getState().isSessionRefreshing).toBe(false);
      expect(useAuthStore.getState().session.isAuth).toBe(true);
      expect(mocks.clearAuthToken).not.toHaveBeenCalled();
    }
  );

  it.each([401, 403])('clears the session when /me returns HTTP %s', async (status) => {
    mocks.getAuthToken.mockReturnValue('token-1');
    mocks.fetchMe.mockRejectedValue({ response: { status } });

    const result = await useAuthStore.getState().refreshSession();

    expect(result).toMatchObject({ st: false, isAuth: false, token: '' });
    expect(useAuthStore.getState().isSessionRefreshing).toBe(false);
    expect(useAuthStore.getState().session.isAuth).toBe(false);
    expect(mocks.clearAuthToken).toHaveBeenCalledOnce();
  });
});
