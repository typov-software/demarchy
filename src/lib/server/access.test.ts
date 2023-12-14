import { expect, describe, test } from 'vitest';
import { verifyRoles, type MembershipInfo } from './access';

describe('access.ts', () => {
  const okMembership: MembershipInfo = {
    standing: 'ok',
    roles: {
      organization_id: 'mem',
      group_id: 'mem'
    }
  };
  const notOkMembership: MembershipInfo = {
    standing: 'pause',
    roles: {
      organization_id: 'mem',
      group_id: 'obs'
    }
  };
  const improperAccessMembership: MembershipInfo = {
    standing: 'ok',
    roles: {
      organization_id: 'mem',
      group_id: 'obs'
    }
  };

  test('verifyRoles() returns true for members with ok standing', () => {
    expect(verifyRoles('group_id', ['mem'], okMembership)).toBe(true);
    expect(verifyRoles('group_id', ['obs', 'mem'], okMembership)).toBe(true);
  });

  test('verifyRoles() returns false for members with not ok standing', () => {
    expect(verifyRoles('group_id', ['mem'], notOkMembership)).toBe(false);
    expect(verifyRoles('group_id', ['obs', 'mem'], notOkMembership)).toBe(false);
  });

  test('verifyRoles() returns true for members with proper access', () => {
    expect(verifyRoles('group_id', ['mem'], okMembership)).toBe(true);
    expect(verifyRoles('group_id', ['obs', 'mem'], okMembership)).toBe(true);
    expect(verifyRoles('group_id', ['obs', 'mem', 'mod'], okMembership)).toBe(true);
    expect(verifyRoles('group_id', ['obs', 'mem', 'mod', 'adm'], okMembership)).toBe(true);
  });

  test('verifyRoles() returns false for members with improper access', () => {
    expect(verifyRoles('group_id', ['mem'], improperAccessMembership)).toBe(false);
    expect(verifyRoles('group_id', ['mem', 'mod', 'adm'], improperAccessMembership)).toBe(false);
  });
});
