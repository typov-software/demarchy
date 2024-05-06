import { expect, describe, test } from "vitest";
import {
  checkValidHandle,
  checkValidSlug,
  emptyString,
  pluralize,
  slugify,
  titleCase
} from "./string";

describe("string.ts", () => {
  test("checkValidSlug() returns true for a valid slug", () => {
    expect(checkValidSlug("is-valid")).toBe(true);
    expect(checkValidSlug("is-valid-000")).toBe(true);
  });

  test("checkValidSlug() returns false for an valid slug", () => {
    expect(checkValidSlug("isValid")).toBe(false);
    expect(checkValidSlug("is_valid")).toBe(false);
    // TODO: although this is valid, it is not expected user experience
    // expect(checkValidSlug('is--valid')).toBe(false);
    expect(checkValidSlug("is-valid-")).toBe(false);
    // 32 character limit on slug length
    expect(checkValidSlug("012345678901234567890123456789012")).toBe(false);
    expect(checkValidSlug("01")).toBe(false);
  });

  test("checkValidHandle() returns true for a valid user handle", () => {
    expect(checkValidHandle("typovdev")).toBe(true);
    expect(checkValidHandle("typov_dev")).toBe(true);
    expect(checkValidHandle("typov_dev_000")).toBe(true);
  });

  test("checkValidHandle() returns false for an invalid user handle", () => {
    expect(checkValidHandle("Typov_Dev")).toBe(false);
    expect(checkValidHandle("typov-dev")).toBe(false);
    expect(checkValidHandle("typov__dev")).toBe(false);
    expect(checkValidHandle("typov_dev_")).toBe(false);
    expect(checkValidHandle("typov_dev-")).toBe(false);
    // 32 character limit on slug length
    expect(checkValidHandle("012345678901234567890123456789012")).toBe(false);
    expect(checkValidHandle("01")).toBe(false);
  });

  test("emptyString() checks for an empty string", () => {
    expect(emptyString()).toBe(true);
    expect(emptyString("")).toBe(true);
    expect(emptyString(" ")).toBe(true);
    expect(emptyString("    ")).toBe(true);
    expect(emptyString("test")).toBe(false);
  });

  test("titleCase() converts a string into title case", () => {
    expect(titleCase("a title to be cased")).toBe("A Title To Be Cased");
    expect(titleCase("A TITLE")).toBe("A Title");
    expect(titleCase("a-title")).toBe("A-title");
  });

  test("slugify() converts a string into a valid slug", () => {
    expect(slugify("A Name to Slugify")).toBe("a-name-to-slugify");
    expect(slugify("slugify this")).toBe("slugify-this");
    expect(slugify("slugify_this")).toBe("slugify-this");
    expect(slugify("slugify THIS")).toBe("slugify-this");
  });

  test("pluralize() pluralizes a given word", () => {
    expect(pluralize("slug", 0)).toBe("slugs");
    expect(pluralize("slug", 1)).toBe("slug");
    expect(pluralize("slug", 2)).toBe("slugs");
    expect(pluralize("sass", 3, "es")).toBe("sasses");
  });
});
