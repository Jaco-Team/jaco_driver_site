import { describe, expect, it } from 'vitest';

import { isCurrentUserRow, normalizeGraphResponse } from '@/entities/graph/model/graph.utils';

describe('graph.utils', () => {
  it('normalizes missing legacy graph arrays to safe defaults', () => {
    const result = normalizeGraphResponse({}, '2026-04');

    expect(result.monthList).toEqual([]);
    expect(result.dates).toEqual([]);
    expect(result.users).toEqual([]);
    expect(result.errOrders).toEqual([]);
    expect(result.errCam).toEqual([]);
    expect(result.chooseDate).toBe('2026-04');
  });

  it('detects current user row by explicit flag, id, or user name', () => {
    expect(
      isCurrentUserRow(
        [
          {
            is_my: '1',
            user_name: 'Курьер 1',
          },
        ],
        '',
        ''
      )
    ).toBe(true);

    expect(
      isCurrentUserRow(
        [
          {
            user_id: '42',
            user_name: 'Другой',
          },
        ],
        '42',
        ''
      )
    ).toBe(true);

    expect(
      isCurrentUserRow(
        [
          {
            user_name: 'Иван Иванов',
          },
        ],
        '',
        'иван иванов'
      )
    ).toBe(true);
  });
});
