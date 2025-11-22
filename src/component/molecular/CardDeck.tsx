import { CARD_STACK_GAP } from "@/config/variable";
import { Box, Stack } from "@mui/material";
import TrumpCard from "../atom/TrumpCard";

interface CardDeckProps {
  direction?: "row" | "column" | "hold";
  hasEmpty?: boolean;
  items: TrumpCard[];
  onCardClick?: (card: TrumpCard, index: number) => void;
  onEmptyClick?: () => void;
  selectedCard?: {
    card: TrumpCard;
    sourceLocation: string;
    sourceIndex: number;
  } | null;
}
const CardDeck: React.FC<CardDeckProps> = ({
  items,
  direction = "column",
  hasEmpty = false,
  onCardClick,
  onEmptyClick,
  selectedCard,
}) => {
  const cardWidth = `calc(4.1vh + 2.5vw)`;

  const isCardSelected = (card: TrumpCard) => {
    if (!selectedCard) return false;
    return (
      selectedCard.card.sign === card.sign &&
      selectedCard.card.type === card.type
    );
  };

  return (
    <Stack position="relative" width={cardWidth}>
      {hasEmpty ? (
        <Box
          onClick={() => onEmptyClick?.()}
          sx={{ cursor: selectedCard ? "pointer" : "default" }}
        >
          <TrumpCard type="club" sign={11} isEmpty />
        </Box>
      ) : null}
      {items.map((item, index) => (
        <Box
          key={`${index}-${item.type}-${item.sign}`}
          position="absolute"
          left={direction === "row" ? index * CARD_STACK_GAP : 0}
          top={direction === "column" ? index * CARD_STACK_GAP : 0}
          onClick={() => onCardClick?.(item, index)}
          sx={{ cursor: item.isFlipped ? "pointer" : "default" }}
        >
          <TrumpCard
            {...item}
            isActive={isCardSelected(item)}
          />
        </Box>
      ))}
    </Stack>
  );
};

export default CardDeck;
