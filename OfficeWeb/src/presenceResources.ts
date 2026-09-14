/** Drop resources keyed by old socket IDs when members leave or reconnect. */
export function retainPresent<T>(values: Record<string, T>, present: Set<string>): Record<string, T> {
  if (Object.keys(values).every(id => present.has(id))) return values;
  return Object.fromEntries(Object.entries(values).filter(([id]) => present.has(id)));
}

/** Cheap equality for the call-status snapshot, so a poll that changes nothing can
 *  keep the previous object identity and skip a React render. */
export function sameCallStates(
  a: Record<string, { voice: string; connected: boolean; sharing: boolean }>,
  b: Record<string, { voice: string; connected: boolean; sharing: boolean }>,
) {
  const keys = Object.keys(b);
  if (keys.length !== Object.keys(a).length) return false;
  return keys.every((key) => {
    const left = a[key], right = b[key];
    return left && left.voice === right.voice && left.connected === right.connected &&
      left.sharing === right.sharing;
  });
}
