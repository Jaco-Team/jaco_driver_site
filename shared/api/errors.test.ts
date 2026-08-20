import { describe, expect, it } from 'vitest';

import { getAuthSecurityState } from './errors';

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
});
