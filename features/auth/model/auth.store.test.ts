import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/shared/api/types';

import { useAuthStore } from './auth.store';

const mocks = vi.hoisted(() => ({
  loginToken: vi.fn(),
  fetchMe: vi.fn(),
  sendPasswordRecoveryCode: vi.fn(),
  confirmPasswordRecoveryCode: vi.fn(),
  getAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
  setTypeDop: vi.fn(),
  setOrdersState: vi.fn(),
  clearOfflineCache: vi.fn(),
  markAppOffline: vi.fn(),
}));

vi.mock('@/entities/order/model/order.store', () => ({
  useOrdersStore: {
    getState: () => ({ setTypeDop: mocks.setTypeDop }),
    setState: mocks.setOrdersState,
  },
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
  markAppOffline: mocks.markAppOffline,
  markAppOnline: vi.fn(),
  isAppOnline: () => true,
}));

vi.mock('@/shared/lib/offline/cache', () => ({
  clearOfflineCache: mocks.clearOfflineCache,
  readOfflineCache: () => null,
  writeOfflineCache: vi.fn(),
}));

function resetStore() {
  window.localStorage.clear();
  useAuthStore.setState({
    isSubmitting: false,
    isSessionRefreshing: false,
    loginErr: '',
    authNotice: null,
    session: { isAuth: 'load', token: '', user: null },
  });
}

function deferredUser() {
  let resolve!: (user: User) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<User>((success, failure) => {
    resolve = success;
    reject = failure;
  });
  return { promise, resolve, reject };
}

const refreshOutcomes = ['success', '401', '403', 'network', '500'] as const;

function finishRefresh(
  pending: ReturnType<typeof deferredUser>,
  outcome: (typeof refreshOutcomes)[number]
) {
  if (outcome === 'success') {
    pending.resolve({ user_id: 7, name: 'Old response', token: 'response-token-a' });
  } else if (outcome === 'network') {
    pending.reject({ code: 'ERR_NETWORK', message: 'Network Error' });
  } else {
    pending.reject({
      response: { status: Number(outcome), data: { message: 'Old request failed' } },
    });
  }
}

function startPendingRefresh() {
  mocks.getAuthToken.mockReturnValue('token-a');
  useAuthStore.setState({
    session: { isAuth: true, token: 'token-a', user: { user_id: 7 } },
  });
  const pending = deferredUser();
  mocks.fetchMe.mockReturnValueOnce(pending.promise);
  const result = useAuthStore.getState().refreshSession();
  expect(useAuthStore.getState().isSessionRefreshing).toBe(true);
  return { pending, result };
}

function sideEffectCounts() {
  return {
    clearToken: mocks.clearAuthToken.mock.calls.length,
    clearCache: mocks.clearOfflineCache.mock.calls.length,
    resetFilter: mocks.setTypeDop.mock.calls.length,
    closeFilter: mocks.setOrdersState.mock.calls.length,
    markOffline: mocks.markAppOffline.mock.calls.length,
  };
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
    expect(mocks.setTypeDop).toHaveBeenCalledWith([]);
  });

  it('resets the status filter and closes its sheet on logout', () => {
    useAuthStore.getState().setUnauthorized();

    expect(mocks.setTypeDop).toHaveBeenCalledWith([]);
    expect(mocks.setOrdersState).toHaveBeenCalledWith({ is_showModalTypeDop: false });
  });

  it('resets the filter when the authenticated account changes', () => {
    useAuthStore.setState({
      session: { isAuth: true, token: 'old-token', user: { user_id: 7 } },
    });

    useAuthStore.getState().setAuthenticated({ user_id: 8, token: 'new-token' });

    expect(mocks.setTypeDop).toHaveBeenCalledWith([]);
  });

  it('resets the filter after an explicit SSO login from the initial state', () => {
    useAuthStore.getState().setAuthenticated({ user_id: 8, token: 'sso-token' });

    expect(mocks.setTypeDop).toHaveBeenCalledWith([]);
  });

  it.each(['load', true] as const)(
    'preserves the filter on session verification with isAuth=%s',
    async (isAuth) => {
      useAuthStore.setState({
        session: { isAuth, token: 'token-1', user: isAuth === true ? { user_id: 7 } : null },
      });
      mocks.getAuthToken.mockReturnValue('token-1');
      mocks.fetchMe.mockResolvedValue({ user_id: 7 });

      await useAuthStore.getState().refreshSession();

      expect(mocks.setTypeDop).not.toHaveBeenCalled();
    }
  );

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

  it.each(refreshOutcomes)('ignores an old refresh %s after explicit logout', async (outcome) => {
    const { pending, result } = startPendingRefresh();
    useAuthStore.getState().setUnauthorized();
    mocks.getAuthToken.mockReturnValue(null);
    const loggedOut = useAuthStore.getState().session;
    const effectsAfterLogout = sideEffectCounts();

    finishRefresh(pending, outcome);

    expect(await result).toMatchObject({ st: false, ...loggedOut });
    expect(useAuthStore.getState().session).toBe(loggedOut);
    expect(useAuthStore.getState().isSessionRefreshing).toBe(false);
    expect(window.localStorage.getItem('jaco_driver_explicit_unauthorized')).toBe('1');
    expect(mocks.getAuthToken()).toBeNull();
    expect(sideEffectCounts()).toEqual(effectsAfterLogout);
  });

  it.each(refreshOutcomes)('keeps the new account after an old refresh %s', async (outcome) => {
    const { pending, result } = startPendingRefresh();
    mocks.getAuthToken.mockReturnValue('token-b');
    useAuthStore.getState().setAuthenticated({ user_id: 8, name: 'New account', token: 'token-b' });
    const authenticated = useAuthStore.getState().session;
    const effectsAfterLogin = sideEffectCounts();

    finishRefresh(pending, outcome);

    expect(await result).toMatchObject({ st: true, ...authenticated });
    expect(useAuthStore.getState().session).toBe(authenticated);
    expect(mocks.getAuthToken()).toBe('token-b');
    expect(window.localStorage.getItem('jaco_driver_explicit_unauthorized')).toBeNull();
    expect(sideEffectCounts()).toEqual(effectsAfterLogin);
  });

  it.each(refreshOutcomes)(
    'does not mix a raw replacement token with old user data or error %s',
    async (outcome) => {
      const { pending, result } = startPendingRefresh();
      const previousSession = useAuthStore.getState().session;
      mocks.getAuthToken.mockReturnValue('token-b');
      const effectsBeforeResponse = sideEffectCounts();

      finishRefresh(pending, outcome);

      expect(await result).toMatchObject({ st: true, ...previousSession });
      expect(useAuthStore.getState().session).toBe(previousSession);
      expect(mocks.getAuthToken()).toBe('token-b');
      expect(window.localStorage.getItem('jaco_driver_explicit_unauthorized')).toBeNull();
      expect(useAuthStore.getState().isSessionRefreshing).toBe(false);
      expect(sideEffectCounts()).toEqual(effectsBeforeResponse);
    }
  );

  it.each(refreshOutcomes)(
    'uses the session generation even if logout/login reused the same token before old %s',
    async (outcome) => {
      const { pending, result } = startPendingRefresh();
      useAuthStore.getState().setUnauthorized();
      useAuthStore.getState().setAuthenticated({ user_id: 8, token: 'token-a' });
      const authenticated = useAuthStore.getState().session;
      const effectsAfterLogin = sideEffectCounts();

      finishRefresh(pending, outcome);

      expect(await result).toMatchObject({ st: true, ...authenticated });
      expect(useAuthStore.getState().session).toBe(authenticated);
      expect(window.localStorage.getItem('jaco_driver_explicit_unauthorized')).toBeNull();
      expect(mocks.getAuthToken()).toBe('token-a');
      expect(sideEffectCounts()).toEqual(effectsAfterLogin);
    }
  );

  it.each(['success', '401'] as const)(
    'does not clear a newer refresh loading flag from the obsolete %s finally',
    async (outcome) => {
      const previous = startPendingRefresh();
      mocks.getAuthToken.mockReturnValue('token-b');
      useAuthStore.getState().setAuthenticated({ user_id: 8, token: 'token-b' });
      const current = deferredUser();
      mocks.fetchMe.mockReturnValueOnce(current.promise);
      const currentResult = useAuthStore.getState().refreshSession();
      expect(mocks.fetchMe).toHaveBeenCalledTimes(2);
      const authenticated = useAuthStore.getState().session;
      const effectsBeforeResponse = sideEffectCounts();

      finishRefresh(previous.pending, outcome);
      expect(await previous.result).toMatchObject({ st: true, ...authenticated });
      expect(useAuthStore.getState().session).toBe(authenticated);
      expect(useAuthStore.getState().isSessionRefreshing).toBe(true);
      expect(sideEffectCounts()).toEqual(effectsBeforeResponse);

      current.resolve({ user_id: 8, name: 'Current verified user' });
      expect(await currentResult).toMatchObject({
        st: true,
        token: 'token-b',
        user: { user_id: 8, name: 'Current verified user' },
      });
      expect(useAuthStore.getState().isSessionRefreshing).toBe(false);
      expect(useAuthStore.getState().session.user?.name).toBe('Current verified user');
    }
  );

  it.each(['success', '401'] as const)(
    'invalidates an old refresh %s as soon as a new password login starts',
    async (outcome) => {
      const previous = startPendingRefresh();
      const sessionBeforeLogin = useAuthStore.getState().session;
      const loginResponse = deferredUser();
      mocks.loginToken.mockReturnValueOnce(loginResponse.promise);
      const signingIn = useAuthStore.getState().login('79870001133', 'Password1');
      const effectsAfterLoginStart = sideEffectCounts();

      finishRefresh(previous.pending, outcome);
      expect(await previous.result).toMatchObject({ st: true, ...sessionBeforeLogin });
      expect(useAuthStore.getState().session).toBe(sessionBeforeLogin);
      expect(useAuthStore.getState().isSubmitting).toBe(true);
      expect(sideEffectCounts()).toEqual(effectsAfterLoginStart);
      expect(mocks.getAuthToken()).toBe('token-a');

      mocks.getAuthToken.mockReturnValue('token-b');
      mocks.fetchMe.mockResolvedValueOnce({ user_id: 8, name: 'Password login user' });
      loginResponse.resolve({ user_id: 8, token: 'token-b' });
      expect(await signingIn).toMatchObject({ st: true, token: 'token-b', user: { user_id: 8 } });
      expect(useAuthStore.getState().isSubmitting).toBe(false);
    }
  );

  it('continues sharing the current refresh loading state without starting another /me', async () => {
    const { pending, result } = startPendingRefresh();
    expect(await useAuthStore.getState().refreshSession()).toMatchObject({
      st: 'load',
      isAuth: true,
      token: 'token-a',
    });
    expect(mocks.fetchMe).toHaveBeenCalledTimes(1);
    pending.resolve({ user_id: 7, name: 'Verified current user' });
    expect(await result).toMatchObject({
      st: true,
      token: 'token-a',
      user: { user_id: 7, name: 'Verified current user' },
    });
    expect(useAuthStore.getState().isSessionRefreshing).toBe(false);
  });

  it('invalidates a refresh started during login even when the successful login reused its token', async () => {
    mocks.getAuthToken.mockReturnValue('token-a');
    useAuthStore.setState({
      session: { isAuth: true, token: 'token-a', user: { user_id: 7 } },
    });
    const loginResponse = deferredUser();
    mocks.loginToken.mockReturnValueOnce(loginResponse.promise);
    const signingIn = useAuthStore.getState().login('79870001133', 'Password1');
    const previous = deferredUser();
    mocks.fetchMe.mockReturnValueOnce(previous.promise);
    const refreshing = useAuthStore.getState().refreshSession();
    expect(useAuthStore.getState().isSessionRefreshing).toBe(true);

    mocks.fetchMe.mockResolvedValueOnce({ user_id: 8, name: 'New login' });
    loginResponse.resolve({ user_id: 8, token: 'token-a' });
    expect((await signingIn).st).toBe(true);
    const authenticated = useAuthStore.getState().session;
    const effectsAfterLogin = sideEffectCounts();
    expect(useAuthStore.getState().isSessionRefreshing).toBe(false);

    finishRefresh(previous, 'success');
    expect(await refreshing).toMatchObject({ st: true, ...authenticated });
    expect(useAuthStore.getState().session).toBe(authenticated);
    expect(mocks.getAuthToken()).toBe('token-a');
    expect(sideEffectCounts()).toEqual(effectsAfterLogin);
  });

  it('retains the existing current-session server error handling without deleting token/cache', async () => {
    mocks.getAuthToken.mockReturnValue('token-a');
    mocks.fetchMe.mockRejectedValueOnce({ response: { status: 500 } });

    expect(await useAuthStore.getState().refreshSession()).toMatchObject({
      st: false,
      isAuth: false,
      status: 500,
    });
    expect(mocks.getAuthToken()).toBe('token-a');
    expect(mocks.clearAuthToken).not.toHaveBeenCalled();
    expect(mocks.clearOfflineCache).not.toHaveBeenCalled();
    expect(mocks.markAppOffline).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('jaco_driver_explicit_unauthorized')).toBeNull();
    expect(useAuthStore.getState().isSessionRefreshing).toBe(false);
  });
});
