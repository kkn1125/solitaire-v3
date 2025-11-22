import { useCoreStore } from "@/store/core.store";

export const useActionEffect = () => {
  // card hover effect
  // card move effect
  const { setGameState } = useCoreStore();

  function cardMoveTo(
    cardRef: React.RefObject<HTMLDivElement>,
    place: CardLocation,
    row: number,
    column: number,
    zIndex: number
  ) {
    setGameState((state, allState) => {
      if (allState.gameState.selectedCard) {
        state.temp.push({
          sign: allState.gameState.selectedCard.card.sign,
          type: allState.gameState.selectedCard.card.type,
          location: place,
          row: row,
          column: column,
          zIndex: zIndex,
        });
      }
    });
  }
};
