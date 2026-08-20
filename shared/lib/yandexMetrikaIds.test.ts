import { describe, expect, it } from 'vitest';

import { DRIVER_YANDEX_METRIKA_ID, resolveYandexMetrikaIds } from './yandexMetrikaIds';

describe('resolveYandexMetrikaIds', () => {
  it('always includes the driver counter', () => {
    expect(resolveYandexMetrikaIds('')).toEqual([DRIVER_YANDEX_METRIKA_ID]);
    expect(resolveYandexMetrikaIds(undefined)).toEqual([DRIVER_YANDEX_METRIKA_ID]);
  });

  it('keeps an extra env counter without duplicating the driver one', () => {
    expect(resolveYandexMetrikaIds('99001122')).toEqual(['99001122', DRIVER_YANDEX_METRIKA_ID]);
    expect(resolveYandexMetrikaIds(`99001122, ${DRIVER_YANDEX_METRIKA_ID}`)).toEqual([
      '99001122',
      DRIVER_YANDEX_METRIKA_ID,
    ]);
  });
});
