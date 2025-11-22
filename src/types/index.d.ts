import type { CardSignKey } from "@/config/enums";

export declare global {
  type TrumpCardType = "heart" | "diamond" | "club" | "spade";
  type TrumpCardColor = "error" | "black";
  type CardLocation = "stack" | "waste" | "foundation" | "ground" | "temp";
  interface TrumpCard {
    sign: CardSignKey;
    type: TrumpCardType;
    isEmpty?: boolean;
    isFlipped?: boolean;
    location: CardLocation;
    isActive?: boolean;
    isMoving?: boolean;
    column?: number;
    row?: number;
    zIndex?: number;
  }
}
