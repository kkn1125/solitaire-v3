import type { CardType } from "@/config/enums";
import { resolvePath } from "@/config/variable";

export const CardBgMap: Record<CardType, Record<number, string>> = {
  heart: {
    11: resolvePath(`images/cards/heart-jack.png`),
    12: resolvePath(`images/cards/heart-queen.png`),
    13: resolvePath(`images/cards/heart-king.png`),
  },
  diamond: {
    11: resolvePath(`images/cards/diamond-jack.png`),
    12: resolvePath(`images/cards/diamond-queen.png`),
    13: resolvePath(`images/cards/diamond-king.png`),
  },
  club: {
    11: resolvePath(`images/cards/club-jack.png`),
    12: resolvePath(`images/cards/club-queen.png`),
    13: resolvePath(`images/cards/club-king.png`),
  },
  spade: {
    11: resolvePath(`images/cards/spade-jack.png`),
    12: resolvePath(`images/cards/spade-queen.png`),
    13: resolvePath(`images/cards/spade-king.png`),
  },
} as const;
export type CardBgMap = (typeof CardBgMap)[keyof typeof CardBgMap];
