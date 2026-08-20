import { describe, expect, it } from 'vitest';

import { escapeHtml, sanitizeCssColor, sanitizeCssIdent } from './escapeHtml';

describe('escapeHtml', () => {
  it('escapes markup that could break map templates', () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">`)).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
    );
  });
});

describe('sanitizeCssColor', () => {
  it('keeps hex and named colors', () => {
    expect(sanitizeCssColor('#CC0033')).toBe('#CC0033');
    expect(sanitizeCssColor('blue')).toBe('blue');
  });

  it('rejects injected CSS or JS in color values', () => {
    expect(sanitizeCssColor('red" onload="alert(1)')).toBe('blue');
    expect(sanitizeCssColor('url(javascript:alert(1))')).toBe('blue');
  });
});

describe('sanitizeCssIdent', () => {
  it('strips characters that cannot live in a class name', () => {
    expect(sanitizeCssIdent('white')).toBe('white');
    expect(sanitizeCssIdent('1.5')).toBe('15');
    expect(sanitizeCssIdent('"><script>')).toBe('script');
  });
});
