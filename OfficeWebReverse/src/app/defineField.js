export function defineField(object, key, value) {
  const property = typeof key === 'symbol' ? key : key + '';
  if (property in object) {
    Object.defineProperty(object, property, { enumerable: true, configurable: true, writable: true, value });
    return object;
  }
  return object[property] = value;
}
