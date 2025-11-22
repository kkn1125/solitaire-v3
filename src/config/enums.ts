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

export const CardType = {
  Club: "club",
  Diamond: "diamond",
  Heart: "heart",
  Spade: "spade",
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];
export type CardTypeKey = keyof typeof CardType;
export const CardTypeValues = Object.values(CardType);

export const CardColor = {
  Red: "error",
  Black: "inherit",
} as const;
export type CardColor = (typeof CardColor)[keyof typeof CardColor];
export type CardColorKey = keyof typeof CardColor;
export const CardColorValues = Object.values(CardColor);

export const CardLocation = {
  Stack: "stack",
  Waste: "waste",
  Foundation: "foundation",
  Ground: "ground",
  Temp: "temp",
} as const;
export type CardLocation = (typeof CardLocation)[keyof typeof CardLocation];
export type CardLocationKey = keyof typeof CardLocation;
export const CardLocationValues = Object.values(CardLocation);
