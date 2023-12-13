import { convert } from 'url-slug';

export function emptyString(str?: string) {
  return str && str.trim() === '';
}

export function titleCase(str: string) {
  return str.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());
}

export function slugify(str: string) {
  return convert(str);
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
