import { describe, expect, it } from 'vitest';

import { resolvePageTitle } from './useAppHeader';

describe('resolvePageTitle', () => {
  it('uses the current URL title instead of a stale title left by the previous page', () => {
    expect(
      resolvePageTitle(
        '/settings',
        { '/settings': 'Настройки', '/feedback': 'Предложения' },
        'Предложения'
      )
    ).toBe('Настройки');
  });

  it('uses the store title only for an unknown route', () => {
    expect(resolvePageTitle('/unknown', {}, 'Текущий экран')).toBe('Текущий экран');
  });
});
