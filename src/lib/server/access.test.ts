import { expect, describe, test } from 'vitest';
import {
  verifyRoles,
  type MembershipInfo,
  canReadOrg,
  isOrgMemberOrHigher,
  isGroupObserverOrHigher
} from './access';

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
      organization_id: 'obs',
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

  test('canReadOrg() returns whether the user can read an org', async () => {
    expect(await canReadOrg('organization_id', 'user_id', okMembership)).toBe(true);
    expect(await canReadOrg('organization_id', 'user_id', improperAccessMembership)).toBe(true);
    expect(await canReadOrg('not_this_org', 'user_id', okMembership)).toBe(false);
    expect(await canReadOrg('organization_id', 'user_id', notOkMembership)).toBe(false);
  });

  test('isOrgMemberOrHigher() returns whether the user is a member or higher of an org', async () => {
    expect(await isOrgMemberOrHigher('organization_id', 'user_id', okMembership)).toBe(true);
    expect(await isOrgMemberOrHigher('organization_id', 'user_id', improperAccessMembership)).toBe(
      false
    );
    expect(await isOrgMemberOrHigher('not_this_org', 'user_id', okMembership)).toBe(false);
    expect(await isOrgMemberOrHigher('organization_id', 'user_id', notOkMembership)).toBe(false);
  });

  test('isGroupObserverOrHigher() returns whether the user is an observer or higher of a group', async () => {
    expect(
      await isGroupObserverOrHigher('organization_id', 'group_id', 'user_id', okMembership)
    ).toBe(true);
    expect(
      await isGroupObserverOrHigher('organization_id', 'group_id_2', 'user_id', okMembership)
    ).toBe(false);
    expect(
      await isGroupObserverOrHigher('organization_id', 'group_id', 'user_id', {
        standing: 'ok',
        roles: {
          organization_id: 'mem',
          group_id: 'obs'
        }
      })
    ).toBe(true);
    expect(
      await isGroupObserverOrHigher('organization_id', 'group_id', 'user_id', {
        standing: 'ok',
        roles: {
          organization_id_2: 'mem',
          group_id: 'obs'
        }
      })
    ).toBe(false);
  });
});
