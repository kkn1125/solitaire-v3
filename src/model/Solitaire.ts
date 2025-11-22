import { VERSION } from "@/config/variable";

class Solitaire {
  version: string;

  constructor() {
    this.version = VERSION;
  }

  // 카드가 Foundation에 놓일 수 있는지 확인
  canPlaceOnFoundation(card: TrumpCard, foundation: TrumpCard[]): boolean {
    if (foundation.length === 0) {
      // 빈 Foundation에는 A만 놓을 수 있음
      return card.sign === 1;
    }
    const topCard = foundation[foundation.length - 1];
    // 같은 타입이고 연속된 숫자여야 함
    return topCard.type === card.type && topCard.sign === card.sign - 1;
  }

  // 카드가 Deck에 놓일 수 있는지 확인
  canPlaceOnDeck(card: TrumpCard, deck: TrumpCard[]): boolean {
    if (deck.length === 0) {
      // 빈 Deck에는 K만 놓을 수 있음
      return card.sign === 13;
    }
    const topCard = deck[deck.length - 1];
    // 다른 색상이고 연속된 숫자여야 함
    const isDifferentColor =
      (topCard.type === "heart" || topCard.type === "diamond") !==
      (card.type === "heart" || card.type === "diamond");
    return isDifferentColor && topCard.sign === card.sign + 1;
  }

  // Waste에서 자동으로 이동 가능한 위치 찾기
  findAutoMoveTarget(
    card: TrumpCard,
    foundation: TrumpCard[][],
    deck: TrumpCard[][]
  ): {
    location: "foundation" | "deck" | null;
    index: number;
  } {
    // Foundation 확인 (club, diamond, heart, spade 순서)
    const foundationOrder: TrumpCardType[] = [
      "club",
      "diamond",
      "heart",
      "spade",
    ];
    const foundationIndex = foundationOrder.indexOf(card.type);
    if (
      foundationIndex !== -1 &&
      this.canPlaceOnFoundation(card, foundation[foundationIndex])
    ) {
      return { location: "foundation", index: foundationIndex };
    }

    // Deck 확인
    for (let i = 0; i < deck.length; i++) {
      if (this.canPlaceOnDeck(card, deck[i])) {
        return { location: "deck", index: i };
      }
    }

    return { location: null, index: -1 };
  }
}

export default Solitaire;
