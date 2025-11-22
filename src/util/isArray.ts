export function isDoubleArray<T>(value: T[] | T[][]): value is T[][] {
  return Array.isArray(value[0]);
}
