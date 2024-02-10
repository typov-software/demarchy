import { describe, expect, test } from 'vitest';
import { organizeLibrary } from './libraries';

describe('library organization', () => {
  test('organizing a library directory', () => {
    const organized = organizeLibrary({
      created_at: new Date(),
      updated_at: new Date(),
      archived_at: null,
      id: '',
      uid: '',
      path: '',
      organization_id: '',
      group_id: '',
      extends_library_id: '',
      latest: false,
      assets: {},
      docs: {
        one: {
          id: 'one',
          name: 'README',
          path: ''
        },
        two: {
          id: 'two',
          name: 'nested/ONCE',
          path: ''
        },
        three: {
          id: 'three',
          name: 'nested/deeper/TWICE',
          path: ''
        },
        four: {
          id: 'four',
          name: 'another/empty/deep/FOUR',
          path: ''
        },
        five: {
          id: 'five',
          name: 'another/empty/deep/FIVE',
          path: ''
        }
      }
    });
    expect(organized).toEqual({
      library_id: '',
      docs: new Map([
        [
          '',
          [
            {
              id: 'one',
              name: 'README',
              path: ''
            }
          ]
        ],
        [
          'nested',
          [
            {
              id: 'two',
              name: 'nested/ONCE',
              path: ''
            }
          ]
        ],
        [
          'nested/deeper',
          [
            {
              id: 'three',
              name: 'nested/deeper/TWICE',
              path: ''
            }
          ]
        ],
        [
          'another/empty/deep',
          [
            {
              id: 'four',
              name: 'another/empty/deep/FOUR',
              path: ''
            },
            {
              id: 'five',
              name: 'another/empty/deep/FIVE',
              path: ''
            }
          ]
        ]
      ]),
      dirs: {
        nested: { deeper: {} },
        another: { empty: { deep: {} } }
      }
    });
  });
});
