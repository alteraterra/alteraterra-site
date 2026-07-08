/**
 * deepGet, read a value from a nested object using a dot path.
 *
 * Supports numeric indices into arrays, e.g.:
 *   deepGet(content, 'house.services.0.title')
 *   deepGet(content, 'team.members.1.name')
 *
 * Returns `undefined` if any segment along the path is missing or if the
 * traversal hits a null/undefined before the path is exhausted. Never throws.
 */
export function deepGet(obj: any, path: string): any {
  if (obj == null || !path) return undefined;
  const segments = path.split('.');
  let current: any = obj;
  for (const segment of segments) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return current;
}
