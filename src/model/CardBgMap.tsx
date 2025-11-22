import type { CardType } from "@/config/enums";

export const CardBgMap: Record<CardType, Record<number, string>> = {
  heart: {
    11: "/images/cards/heart-jack.png",
    12: "/images/cards/heart-queen.png",
    13: "/images/cards/heart-king.png",
  },
  diamond: {
    11: "/images/cards/diamond-jack.png",
    12: "/images/cards/diamond-queen.png",
    13: "/images/cards/diamond-king.png",
  },
  club: {
    11: "/images/cards/club-jack.png",
    12: "/images/cards/club-queen.png",
    13: "/images/cards/club-king.png",
  },
  spade: {
    11: "/images/cards/spade-jack.png",
    12: "/images/cards/spade-queen.png",
    13: "/images/cards/spade-king.png",
  },
} as const;
export type CardBgMap = (typeof CardBgMap)[keyof typeof CardBgMap];
