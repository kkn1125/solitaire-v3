export const CardSignMap = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
} as const;
export type CardSign = (typeof CardSignMap)[keyof typeof CardSignMap];
export type CardSignKey = keyof typeof CardSignMap;
export const CardSignValues = Object.values(CardSignMap);
