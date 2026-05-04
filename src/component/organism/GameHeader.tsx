import { CardLocation, ScoreValue } from "@/config/enums";
import { useWindowSize } from "@/hook/useWindowSize";
import { useCoreStore } from "@/store/useCoreStore";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { FaPalette } from "react-icons/fa6";
import { useShallow } from "zustand/shallow";
import GameButton from "../atom/GameButton";
import GameMenu from "../atom/GameMenu";
import State from "../atom/StateText";

interface GameHeaderProps {}
const GameHeader: React.FC<GameHeaderProps> = () => {
  const { headerGroupGap } = useWindowSize();
  const stackSize = useSolitaireStore(
    useShallow(
      (state) =>
        state.cards.filter((card) => card.location !== CardLocation.Foundation)
          .length,
    ),
  );
  const totalCardSize = useSolitaireStore(
    useShallow((state) => state.cards.length),
  );
  const score = useCoreStore(useShallow((state) => state.gameInfo.score));
  const moved = useCoreStore(useShallow((state) => state.gameInfo.moved));
  const playTime = useCoreStore(useShallow((state) => state.gameInfo.playTime));
  const scoreActions = useCoreStore(
    useShallow((state) => state.actions.addScore),
  );

  function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  function winGame() {}

  useEffect(() => {
    const unsubscribeScoreUpdate = useSolitaireStore.subscribe(
      (state) => state.scoreHistory,
      (scoreHistory) => {
        const [scorePolicy, isSuccess] = scoreHistory[0] ?? [];

        if (!isSuccess) return [];

        scoreActions(ScoreValue[scorePolicy] ?? 0);

        useSolitaireStore.setState((state) => {
          if (state.scoreHistory.length) {
            state.scoreHistory = [];
          }
        });
      },
    );
    return () => {
      unsubscribeScoreUpdate();
    };
    // [보존] 이전 의존성: }, [setGameInfo]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stackSize === 0) {
      winGame();
    }
  }, [stackSize]);

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <GameButton title="테마 변경" placement="top">
        <FaPalette />
      </GameButton>
      <Stack direction="row" gap={headerGroupGap}>
        <State title="점수" value={score} />
        <State title="남은 카드" value={stackSize} />
        <State title="플레이 시간" value={formatTime(playTime)} />
        <State title="횟수" value={moved} />
      </Stack>
      <GameMenu />
    </Stack>
  );
};

export default GameHeader;
