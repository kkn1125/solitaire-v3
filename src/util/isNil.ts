export const isNil = (
  value: undefined | null | unknown
): value is undefined | null => {
  return value === null || value === undefined;
};
