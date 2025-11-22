import type { CardType } from "@/config/enums";
import { GiClubs, GiDiamonds, GiHearts, GiSpades } from "react-icons/gi";

export const CardTypeMap: Record<CardType, React.ReactNode> = {
  club: <GiClubs />,
  diamond: <GiDiamonds />,
  heart: <GiHearts />,
  spade: <GiSpades />,
} as const;
export type CardTypeMap = (typeof CardTypeMap)[keyof typeof CardTypeMap];
