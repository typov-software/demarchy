import { expect, describe, test } from 'vitest';
import { checkValidSlug } from './string';

describe('string.ts', () => {
  test('checkValidSlug() returns true for a valid slug', () => {
    expect(checkValidSlug('is-valid')).toBe(true);
    expect(checkValidSlug('is-valid-000')).toBe(true);
  });

  test('checkValidSlug() returns false for an valid slug', () => {
    expect(checkValidSlug('isValid')).toBe(false);
    expect(checkValidSlug('is_valid')).toBe(false);
    // TODO: although this is valid, it is not expected user experience
    // expect(checkValidSlug('is--valid')).toBe(false);
    expect(checkValidSlug('is-valid-')).toBe(false);
    // 32 character limit on slug length
    expect(checkValidSlug('012345678901234567890123456789012')).toBe(false);
    expect(checkValidSlug('01')).toBe(false);
  });
});
