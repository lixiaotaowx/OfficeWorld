/** Drop resources keyed by old socket IDs when members leave or reconnect. */
export function retainPresent<T>(values: Record<string, T>, present: Set<string>): Record<string, T> {
  if (Object.keys(values).every(id => present.has(id))) return values;
  return Object.fromEntries(Object.entries(values).filter(([id]) => present.has(id)));
}
