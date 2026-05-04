import { useWindowSize } from "@/hook/useWindowSize";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import Card from "../atom/Card";

function CardList() {
  const { fontSize, cardStackGap } = useWindowSize();
  const cards = useSolitaireStore((state) => state.cards);
  const isReady = useSolitaireStore((state) => state.isReady);
  return isReady
    ? cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          fontSize={fontSize}
          cardStackGap={cardStackGap}
        />
      ))
    : null;
}

export default CardList;
