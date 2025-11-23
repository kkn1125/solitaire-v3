import { useSolitaireStore } from "@/store/useSolitaireStore";
import { Stack } from "@mui/material";
import { useEffect, useRef } from "react";
import EmptyCard from "../atom/EmptyCard";
import CardList from "../molecular/CardList";

interface GameMainProps {}
const GameMain: React.FC<GameMainProps> = () => {
  // Foundation 순서: club, diamond, heart, spade
  const ref = useRef(null);
  const rev = useSolitaireStore((state) => state.rev);
  const addBoardBase = useSolitaireStore((state) => state.addBoardBase);
  const setIsReady = useSolitaireStore((state) => state.setIsReady);

  useEffect(() => {
    const unsubscribe = useSolitaireStore.subscribe(
      (state) => state.rev,
      (newRev) => {
        if (rev !== newRev) {
          if (ref.current) {
            addBoardBase(ref.current);
          }
        }
      }
    );

    const unsubscribe2 = useSolitaireStore.subscribe(
      (state) => [
        state.isBaseBindReady,
        state.isBindReady,
        state.isCardReady,
        state.elementLoadCount,
        state.isReady,
      ],
      ([
        newIsBaseBindReady,
        newIsBindReady,
        newIsCardReady,
        newElementLoadCount,
        newIsReady,
      ]) => {
        if (
          !newIsReady &&
          newIsBaseBindReady &&
          newIsBindReady &&
          newIsCardReady &&
          newElementLoadCount === 14
        ) {
          setTimeout(() => {
            setIsReady(true);
          }, 1000);
        }
      }
    );
    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [addBoardBase, ref, rev, setIsReady]);

  useEffect(() => {
    if (ref.current) {
      addBoardBase(ref.current);
    }
  }, [addBoardBase, ref, rev]);

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
