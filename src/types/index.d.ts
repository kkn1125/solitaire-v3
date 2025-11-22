import type {
  CardColor,
  CardLocation,
  CardSignKey,
  CardType,
} from "@/config/enums";

export declare global {
  interface TrumpCard {
    id: string;
    sign: CardSignKey;
    type: CardType;
    color: CardColor;
    location: CardLocation;
    row: number;
    column: number;
    isFlipped: boolean;
    isMoving: boolean;
    isShaking: boolean;
  }
}
