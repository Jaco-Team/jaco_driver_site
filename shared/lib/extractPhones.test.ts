import { describe, expect, it } from 'vitest';

import { extractPhonesFromText, normalizeRuPhoneDigits } from './extractPhones';

describe('normalizeRuPhoneDigits', () => {
  it('normalizes 8, +7 and 10-digit mobile numbers to 7XXXXXXXXXX', () => {
    expect(normalizeRuPhoneDigits('89178206693')).toBe('79178206693');
    expect(normalizeRuPhoneDigits('+7 917 820-66-93')).toBe('79178206693');
    expect(normalizeRuPhoneDigits('9178206693')).toBe('79178206693');
  });

  it('rejects values that are not Russian phone numbers', () => {
    expect(normalizeRuPhoneDigits('')).toBeNull();
    expect(normalizeRuPhoneDigits('21')).toBeNull();
    expect(normalizeRuPhoneDigits('928086')).toBeNull();
    expect(normalizeRuPhoneDigits('17:15')).toBeNull();
  });
});

describe('extractPhonesFromText', () => {
  it('returns nothing when the comment has no phones', () => {
    expect(extractPhonesFromText('')).toEqual([]);
    expect(extractPhonesFromText('Иметь сдачу с 5 тыс руб')).toEqual([]);
    expect(extractPhonesFromText('Ко времени 17:15 - 17:45, осталось 01:41')).toEqual([]);
  });

  it('extracts a single compact number', () => {
    expect(extractPhonesFromText('Домофон не работает, звонить 89178206693')).toEqual([
      {
        digits: '79178206693',
        tel: '+79178206693',
        display: '8 (917) 820-66-93',
      },
    ]);
  });

  it('extracts formatted +7 and 10-digit mobiles', () => {
    expect(extractPhonesFromText('тел. +7 (917) 820-66-93')).toEqual([
      {
        digits: '79178206693',
        tel: '+79178206693',
        display: '8 (917) 820-66-93',
      },
    ]);
    expect(extractPhonesFromText('звонить 9178206693')).toEqual([
      {
        digits: '79178206693',
        tel: '+79178206693',
        display: '8 (917) 820-66-93',
      },
    ]);
  });

  it('returns unique numbers in the order they appear', () => {
    expect(
      extractPhonesFromText('звоните 8-917-820-66-93 или 89171112233, повтор 89178206693')
    ).toEqual([
      {
        digits: '79178206693',
        tel: '+79178206693',
        display: '8 (917) 820-66-93',
      },
      {
        digits: '79171112233',
        tel: '+79171112233',
        display: '8 (917) 111-22-33',
      },
    ]);
  });
});
