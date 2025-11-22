import { GiClubs, GiDiamonds, GiHearts, GiSpades } from "react-icons/gi";

export const CardTypeMap = {
  club: <GiClubs />,
  diamond: <GiDiamonds />,
  heart: <GiHearts />,
  spade: <GiSpades />,
} as const;
export type CardType = (typeof CardTypeMap)[keyof typeof CardTypeMap];
export type CardTypeKey = keyof typeof CardTypeMap;
export const CardTypeKey = Object.keys(CardTypeMap) as CardTypeKey[];
export const CardTypeValues = Object.values(CardTypeMap);
