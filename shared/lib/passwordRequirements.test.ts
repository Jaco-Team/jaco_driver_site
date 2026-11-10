import { describe, expect, it } from 'vitest';

import { stripPasswordSpaces } from './passwordRequirements';

describe('password input', () => {
  it('removes spaces before the password is kept in the form state', () => {
    expect(stripPasswordSpaces(' Pass word 1 ')).toBe('Password1');
  });
});
