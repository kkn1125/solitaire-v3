import { useSolitaireStore } from "@/store/useSolitaireStore";
import Card from "../atom/Card";
import { ReadyStatus } from "@/config/enums";

function CardList() {
  const cards = useSolitaireStore((state) => state.cards);
  const status = useSolitaireStore((state) => state.status);
  return status === ReadyStatus.READY
    ? cards.map((card) => <Card key={card.id} card={card} />)
    : null;
}

export default CardList;
