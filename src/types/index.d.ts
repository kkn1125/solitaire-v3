export declare global {
  type TrumpCardType = "heart" | "diamond" | "club" | "spade";
  type TrumpCardColor = "error" | "black";
  type Location = "stack" | "waste" | "foundation" | "deck";
  interface TrumpCard {
    sign: CardSignKey;
    type: TrumpCardType;
    isEmpty?: boolean;
    isFlipped?: boolean;
    location: Location;
    isActive?: boolean;
    column?: number;
    row?: number;
  }
}
