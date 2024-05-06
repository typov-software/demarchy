import { describe, expect, test } from 'vitest';
import { descendingComparator, getComparator, stableSort } from './sorting';

describe('sorting', () => {
  const early = new Date('2000-12-12');
  const later = new Date();
  test('descendingComparator() properly compares dates', () => {
    expect(descendingComparator({ date: early }, { date: later }, 'date')).toEqual(1);
    expect(descendingComparator({ date: later }, { date: early }, 'date')).toEqual(-1);
    expect(descendingComparator({ date: early }, { date: early }, 'date')).toEqual(0);
  });

  test('descendingComparator() properly compares strings', () => {
    expect(descendingComparator({ name: 'a' }, { name: 'b' }, 'name')).toEqual(1);
    expect(descendingComparator({ name: 'b' }, { name: 'a' }, 'name')).toEqual(-1);
    expect(descendingComparator({ name: 'a' }, { name: 'a' }, 'name')).toEqual(0);
  });

  test('descendingComparator() properly compares numbers', () => {
    expect(descendingComparator({ number: 1 }, { number: 2 }, 'number')).toEqual(1);
    expect(descendingComparator({ number: 2 }, { number: 1 }, 'number')).toEqual(-1);
    expect(descendingComparator({ number: 1 }, { number: 1 }, 'number')).toEqual(0);
  });

  test('descendingComparator() properly compares booleans', () => {
    expect(descendingComparator({ boolean: false }, { boolean: true }, 'boolean')).toEqual(1);
    expect(descendingComparator({ boolean: true }, { boolean: false }, 'boolean')).toEqual(-1);
    expect(descendingComparator({ boolean: true }, { boolean: true }, 'boolean')).toEqual(0);
  });

  test('stableSort() sorts arrays of objects given a property and sort order', () => {
    const objects = [
      {
        name: 'a',
      },
      {
        name: 'b',
      },
    ];
    expect(stableSort(objects, getComparator('asc', 'name'))).toEqual([
      {
        name: 'a',
      },
      {
        name: 'b',
      },
    ]);
    expect(stableSort(objects, getComparator('desc', 'name'))).toEqual([
      {
        name: 'b',
      },
      {
        name: 'a',
      },
    ]);
  });
});
