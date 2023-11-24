import Slugify from 'url-slug';

export function emptyString(str?: string) {
  return str && str.trim() === '';
}

export function titleCase(str: string) {
  return str.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());
}

export function slugify(str: string) {
  return Slugify(str);
}
