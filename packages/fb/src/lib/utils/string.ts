import { convert } from "url-slug";

const HANDLE_REGEXP = /^(?=[a-z0-9._]{3,33}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

/**
 * Tests whether a given string is a valid user handle
 * @param handle The string to test for validity
 * @returns Whether the string is valid or not
 */
export function checkValidHandle(handle: string): boolean {
  return handle.length > 2 && handle.length <= 32 && HANDLE_REGEXP.test(handle);
}

const SLUG_REGEXP = /^[a-z0-9][a-z0-9-]+[a-z0-9]$/;

/**
 * Tests whether a given string is a valid slug
 * @param slug The string to test for validity
 * @returns whether the string is valid or not
 */
export function checkValidSlug(slug: string): boolean {
  return slug.length > 2 && slug.length <= 32 && SLUG_REGEXP.test(slug);
}

/**
 * Checks whether a given string is empty or equivalent
 * @param str The string to check
 * @returns Whether the string is equivalent to empty
 */
export function emptyString(str?: string) {
  if (!str) return true; // there's no string
  return str.trim() === "";
}

/**
 * Pluralizes a given string given a count of items
 * @param text The noun to pluralize
 * @param n The number of nouns
 * @param s The pluralizing suffix
 * @returns The possibly pluralized string
 */
export function pluralize(text: string, n: number, s = "s") {
  if (n === 1) {
    return text;
  } else {
    return `${text}${s}`;
  }
}

/**
 * Converts a string into a url safe slug
 * @param str The string to convert
 * @returns A string converted to a slug
 */
export function slugify(str: string) {
  return convert(str);
}

/**
 * Converts a string's case to title case where each word is capitalized.
 * @param str The string to convert
 * @returns A string converted to title case
 */
export function titleCase(str: string) {
  return str.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());
}
