import { CardLocation } from "@/config/enums";
import { useCoreStore } from "@/store/useCoreStore";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { FaPalette } from "react-icons/fa6";
import GameButton from "../atom/GameButton";
import GameMenu from "../atom/GameMenu";
import State from "../atom/StateText";

interface GameHeaderProps {}
const GameHeader: React.FC<GameHeaderProps> = () => {
  const stackSize = useSolitaireStore(
    (state) =>
      state.cards.filter((card) => card.location !== CardLocation.Foundation)
        .length
  );
  const score = useCoreStore((state) => state.gameInfo.score);
  const playCount = useCoreStore((state) => state.gameInfo.playCount);
  const setScore = useCoreStore((state) => state.setScore);
  const setPlayCount = useCoreStore((state) => state.setPlayCount);
  const setStackSize = useCoreStore((state) => state.setStackSize);

  useEffect(() => {
    const unsubscribe = useSolitaireStore.subscribe(
      (state) => [
        state.score,
        state.playCount,
        state.cards.filter((card) => card.location !== CardLocation.Foundation)
          .length,
      ],
      ([score, playCount, stackSize]) => {
        setScore(score);
        setPlayCount(playCount);
        setStackSize(stackSize);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [setScore, setPlayCount, setStackSize]);

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <GameButton title="테마 변경" placement="top">
        <FaPalette />
      </GameButton>
      <Stack direction="row" gap={5}>
        <State title="점수" value={score} />
        <State title="남은 카드" value={stackSize} />
        <State title="횟수" value={playCount} />
      </Stack>
      <GameMenu />
    </Stack>
  );
};

export default GameHeader;
