import _get from "lodash/get";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StringAny = Record<string, any>;
type Comparator = (a: StringAny, b: StringAny, orderBy?: string) => number;

export function descendingComparator(a: StringAny, b: StringAny, orderBy: string) {
  let aval = _get(a, orderBy);
  let bval = _get(b, orderBy);
  if (aval instanceof Date) {
    aval = aval.getTime();
  } else if (typeof aval === "string") {
    aval = aval.toLowerCase();
  }
  if (bval instanceof Date) {
    bval = bval.getTime();
  } else if (typeof bval === "string") {
    bval = bval.toLowerCase();
  }
  if (bval < aval || aval === undefined) {
    return -1;
  }
  if (bval > aval || bval === undefined) {
    return 1;
  }
  return 0;
}

export function getComparator(order: "asc" | "desc", orderBy: string): Comparator {
  return order === "desc"
    ? (a: StringAny, b: StringAny) => descendingComparator(a, b, orderBy)
    : (a: StringAny, b: StringAny) => -descendingComparator(a, b, orderBy);
}

export function stableSort<T extends StringAny>(array: T[], comparator: Comparator) {
  const stabilized: [T, number][] = array.map((el, idx) => [el, idx]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}
