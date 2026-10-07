import { describe, expect, it } from 'vitest';

import { getAuthErrorMessage, getAuthSecurityState } from './errors';

describe('getAuthSecurityState', () => {
  it('reads captcha and retry_after from an axios-like error', () => {
    const state = getAuthSecurityState({
      response: {
        data: {
          captcha_required: true,
          retry_after: 12.2,
        },
        headers: {
          'retry-after': '3',
        },
      },
    });

    expect(state).toEqual({
      captchaRequired: true,
      retryAfter: 13,
    });
  });

  it('preserves an explicit false CAPTCHA flag', () => {
    expect(getAuthSecurityState({ response: { data: { captcha_required: false } } })).toEqual({
      captchaRequired: false,
      retryAfter: 0,
    });
  });

  it('omits CAPTCHA metadata when a throttled response does not include it', () => {
    const state = getAuthSecurityState({
      response: {
        status: 429,
        data: { message: 'Too Many Attempts.' },
        headers: { 'retry-after': '30' },
      },
    });

    expect(state).toEqual({ retryAfter: 30 });
    expect(state).not.toHaveProperty('captchaRequired');
  });

  it('omits CAPTCHA metadata for a network failure', () => {
    const state = getAuthSecurityState({ code: 'ERR_NETWORK', message: 'Network Error' });

    expect(state).toEqual({ retryAfter: 0 });
    expect(state).not.toHaveProperty('captchaRequired');
  });

  it.each([0, 1, 'false', 'true', null])('ignores a non-boolean CAPTCHA flag: %s', (flag) => {
    expect(
      getAuthSecurityState({ response: { data: { captcha_required: flag } } })
    ).not.toHaveProperty('captchaRequired');
  });

  it.each([undefined, 0, -1, 'Infinity', 'invalid'])(
    'falls back to Retry-After for an unusable payload wait: %s',
    (retryAfter) => {
      expect(
        getAuthSecurityState({
          response: {
            data: { retry_after: retryAfter },
            headers: { 'retry-after': '30' },
          },
        }).retryAfter
      ).toBe(30);
    }
  );

  it('does not turn malformed wait values into an indefinite block', () => {
    expect(
      getAuthSecurityState({
        response: {
          data: { retry_after: 'Infinity' },
          headers: { 'retry-after': '-1' },
        },
      }).retryAfter
    ).toBe(0);
  });
});

describe('getAuthErrorMessage throttling', () => {
  it.each(['Too Many Attempts.', 'Too Many Requests.', 'Request failed with status code 429'])(
    'translates the generic 429 error and displays the header wait: %s',
    (message) => {
      expect(
        getAuthErrorMessage({
          response: {
            status: 429,
            data: { message },
            headers: { 'retry-after': '30' },
          },
        })
      ).toBe('Слишком много попыток. Повторите через 30 с.');
    }
  );

  it('preserves a specific Russian server explanation', () => {
    expect(
      getAuthErrorMessage({
        response: {
          status: 429,
          data: { text: 'Повторная отправка будет доступна через 30 с.' },
          headers: { 'retry-after': '30' },
        },
      })
    ).toBe('Повторная отправка будет доступна через 30 с.');
  });

  it('uses the payload wait before the header wait', () => {
    expect(
      getAuthErrorMessage({
        response: {
          status: 429,
          data: { message: 'Too Many Attempts.', retry_after: 12.2 },
          headers: { 'retry-after': '30' },
        },
      })
    ).toBe('Слишком много попыток. Повторите через 13 с.');
  });

  it('provides Russian copy when a generic 429 has no wait metadata', () => {
    expect(getAuthErrorMessage({ response: { status: 429 } })).toBe(
      'Слишком много попыток. Попробуйте позже.'
    );
  });
});
