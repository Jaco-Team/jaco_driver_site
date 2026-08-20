import { describe, expect, it } from 'vitest';

import { getPasswordRequirements, isPasswordStrong } from './passwordRequirements';

describe('passwordRequirements', () => {
  it('accepts a strong latin password', () => {
    expect(isPasswordStrong('Password1')).toBe(true);
    expect(getPasswordRequirements('Password1').every((item) => item.met)).toBe(true);
  });

  it('rejects passwords missing length, case or digits', () => {
    expect(isPasswordStrong('Pass1')).toBe(false);
    expect(isPasswordStrong('password1')).toBe(false);
    expect(isPasswordStrong('PASSWORD1')).toBe(false);
    expect(isPasswordStrong('Password')).toBe(false);
  });
});
