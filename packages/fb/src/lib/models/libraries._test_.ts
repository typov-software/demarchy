import { describe, expect, test } from 'vitest';
import { amendLibrary, organizeLibrary } from './libraries';

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
          path: '',
        },
        two: {
          id: 'two',
          name: 'nested/ONCE',
          path: '',
        },
        three: {
          id: 'three',
          name: 'nested/deeper/TWICE',
          path: '',
        },
        four: {
          id: 'four',
          name: 'another/empty/deep/FOUR',
          path: '',
        },
        five: {
          id: 'five',
          name: 'another/empty/deep/FIVE',
          path: '',
        },
      },
    });
    expect(organized).toEqual({
      library_id: '',
      rows: new Map([
        [
          '',
          [
            {
              id: 'one',
              name: 'README',
              path: '',
            },
          ],
        ],
        [
          'nested',
          [
            {
              id: 'two',
              name: 'nested/ONCE',
              path: '',
            },
          ],
        ],
        [
          'nested/deeper',
          [
            {
              id: 'three',
              name: 'nested/deeper/TWICE',
              path: '',
            },
          ],
        ],
        [
          'another/empty/deep',
          [
            {
              id: 'four',
              name: 'another/empty/deep/FOUR',
              path: '',
            },
            {
              id: 'five',
              name: 'another/empty/deep/FIVE',
              path: '',
            },
          ],
        ],
      ]),
      dirs: {
        nested: { deeper: {} },
        another: { empty: { deep: {} } },
      },
    });
  });
});

describe('amendLibrary()', () => {
  test('extends the source library', () => {
    const source = {
      created_at: new Date(),
      updated_at: new Date(),
      archived_at: null,
      id: 'latest',
      uid: 'source',
      path: '',
      organization_id: '',
      group_id: '',
      extends_library_id: '',
      latest: true,
      assets: {},
      docs: {
        README: {
          id: 'one',
          name: 'README',
          path: '',
        },
        toremove: {
          id: 'remove',
          name: 'toremove',
          path: '',
        },
      },
    };
    expect(amendLibrary(source, [])).toEqual({
      ...source,
    });

    expect(
      amendLibrary(source, [
        {
          type: 'create',
          doc: {
            id: 'two',
            name: 'TWO',
            path: '',
          },
        },
        {
          type: 'update',
          doc: {
            id: 'one-new',
            name: 'README',
            path: 'new/path',
          },
          update: {
            doc: {
              id: 'one',
              name: 'README',
              path: '',
            },
          },
        },
        {
          type: 'destroy',
          doc: {
            id: 'remove',
            name: 'toremove',
            path: '',
          },
        },
      ]),
    ).toEqual({
      ...source,
      docs: {
        README: {
          id: 'one-new',
          name: 'README',
          path: 'new/path',
        },
        TWO: {
          id: 'two',
          name: 'TWO',
          path: '',
        },
        toremove: {
          id: 'remove',
          name: 'toremove',
          path: '',
        },
      },
    });
  });
});
