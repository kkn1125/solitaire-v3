import { useSolitaireStore } from "@/store/useSolitaireStore";
import Card from "../atom/Card";

function CardList() {
  const cards = useSolitaireStore((state) => state.cards);
  const isReady = useSolitaireStore((state) => state.isReady);
  return isReady ? cards.map((card) => <Card key={card.id} card={card} />) : null;
}

export default CardList;
