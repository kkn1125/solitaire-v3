import { CardLocation, ReadyStatus } from "@/config/enums";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import { Stack } from "@mui/material";
import { useEffect, useEffectEvent, useRef } from "react";
import EmptyCard from "../atom/EmptyCard";
import CardList from "../molecular/CardList";

interface GameMainProps {}
const GameMain: React.FC<GameMainProps> = () => {
  // Foundation 순서: club, diamond, heart, spade
  const ref = useRef<HTMLDivElement>(null);
  const rev = useSolitaireStore((state) => state.rev);
  const addBoardDomRect = useSolitaireStore((state) => state.addBoardDomRect);
  const addDomRect = useSolitaireStore((state) => state.addDomRect);
  const setStatus = useSolitaireStore((state) => state.setStatus);
  const handleClickToCardMove = useSolitaireStore(
    (state) => state.actions.handleClickToCardMove
  );

  useEffect(() => {
    addBoardDomRect(ref);
    addDomRect(CardLocation.Stack, "stack-1");
    addDomRect(CardLocation.Waste, "waste-1");
    addDomRect(CardLocation.Temp, "temp-1");
    addDomRect(CardLocation.Foundation, "foundation-1");
    addDomRect(CardLocation.Foundation, "foundation-2");
    addDomRect(CardLocation.Foundation, "foundation-3");
    addDomRect(CardLocation.Foundation, "foundation-4");
    addDomRect(CardLocation.Ground, "ground-1");
    addDomRect(CardLocation.Ground, "ground-2");
    addDomRect(CardLocation.Ground, "ground-3");
    addDomRect(CardLocation.Ground, "ground-4");
    addDomRect(CardLocation.Ground, "ground-5");
    addDomRect(CardLocation.Ground, "ground-6");
    addDomRect(CardLocation.Ground, "ground-7");
    setStatus(ReadyStatus.READY);
  }, [addBoardDomRect, addDomRect, ref, setStatus]);

  const handleClickEvent = useEffectEvent((e: MouseEvent) => {
    const target = e.target as HTMLDivElement;
    if (!target.dataset.cardId) {
      return;
    }
    handleClickToCardMove(target.dataset.cardId);
  });

  useEffect(() => {
    document.addEventListener("click", handleClickEvent);
    return () => {
      document.removeEventListener("click", handleClickEvent);
    };
  }, [handleClickEvent]);

  return (
    <Stack
      ref={ref}
      id="game-board"
      gap={5}
      flex={1}
      position="relative"
      sx={{ perspective: "1000px", perspectiveOrigin: "center center" }}
    >
      <CardList />

      <Stack direction="row" gap={2} justifyContent="space-between">
        {/* Stack */}
        <Stack direction="row" gap={0.5}>
          <EmptyCard id="stack-1" />
          <EmptyCard id="waste-1" />
        </Stack>

        {/* Waste */}
        <Stack>
          <EmptyCard id="temp-1" />
        </Stack>
        {/* Foundation */}
        <Stack direction="row" gap={0.5}>
          <EmptyCard id="foundation-1" />
          <EmptyCard id="foundation-2" />
          <EmptyCard id="foundation-3" />
          <EmptyCard id="foundation-4" />
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="center" gap={0.5}>
        {/* Ground */}
        <EmptyCard id="ground-1" />
        <EmptyCard id="ground-2" />
        <EmptyCard id="ground-3" />
        <EmptyCard id="ground-4" />
        <EmptyCard id="ground-5" />
        <EmptyCard id="ground-6" />
        <EmptyCard id="ground-7" />
      </Stack>
    </Stack>
  );
};

export default GameMain;
