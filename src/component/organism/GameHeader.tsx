import { playWinEffect } from "@/component/effect/win/playWinEffect";
import { BackgroundValues, CardLocation, ScoreValue } from "@/config/enums";
import { DialogContext } from "@/context/DialogContext";
import { SoundEffectContext } from "@/context/SoundEffectContext";
import type { SoundEffectContextValue } from "@/hook/useSoundEffect";
import { useWindowSize } from "@/hook/useWindowSize";
import { GameStatus, useCoreStore } from "@/store/useCoreStore";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import { Stack } from "@mui/material";
import { useContext, useEffect, useRef, type Context } from "react";
import { FaPalette } from "react-icons/fa6";
import { useShallow } from "zustand/shallow";
import GameButton from "../atom/GameButton";
import GameMenu from "../atom/GameMenu";
import State from "../atom/StateText";

interface GameHeaderProps {}
const GameHeader: React.FC<GameHeaderProps> = () => {
  const isWinEffectPlayedRef = useRef(false);
  const { setDialogOpen } = useContext(DialogContext);
  const { headerGroupGap } = useWindowSize();
  const stackSize = useSolitaireStore(
    useShallow(
      (state) =>
        state.cards.filter((card) => card.location !== CardLocation.Foundation)
          .length,
    ),
  );
  const background = useCoreStore(
    useShallow((state) => state.settings.effects.background),
  );
  const state = useCoreStore(useShallow((state) => state.gameInfo.status));
  const score = useCoreStore(useShallow((state) => state.gameInfo.score));
  const moved = useCoreStore(useShallow((state) => state.gameInfo.moved));
  const playTime = useCoreStore(useShallow((state) => state.gameInfo.playTime));
  const gameSuccess = useCoreStore(
    useShallow((state) => state.actions.gameSuccess),
  );
  const gameSetting = useSolitaireStore(
    useShallow((state) => state.gameSetting),
  );
  const locked = useSolitaireStore(useShallow((state) => state.actions.locked));
  const scoreActions = useCoreStore(
    useShallow((state) => state.actions.addScore),
  );
  const { actions } = useContext<SoundEffectContextValue>(
    SoundEffectContext as unknown as Context<SoundEffectContextValue>,
  );
  const changeBackground = useCoreStore(
    (state) => state.actions.changeBackground,
  );
  function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  function winGame() {
    if (isWinEffectPlayedRef.current) return;
    isWinEffectPlayedRef.current = true;
    // 버전별로 여기만 하드코딩 교체해서 사용
    playWinEffect("confettiBurst");
  }

  function openRestartDialog() {
    setDialogOpen(true, () => {
      handleRestartGame();
    });
  }

  function closeRestartDialog() {
    setDialogOpen(false);
  }

  function handleRestartGame() {
    closeRestartDialog();
    gameSetting();
  }

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
    if (state === GameStatus.Success && stackSize === 0) {
      gameSuccess();
    }
  }, [state, stackSize]);

  useEffect(() => {
    if (stackSize !== 0) return;

    if (state === GameStatus.Success) {
      gameSuccess();
    } else if (state === GameStatus.Win) {
      locked();
      winGame();
      actions.winSound();
      openRestartDialog();
    }

    isWinEffectPlayedRef.current = false;
  }, [stackSize, state]);

  function handleChangeBackground() {
    const index = BackgroundValues.indexOf(background);
    changeBackground(
      BackgroundValues[(index + 1) % (BackgroundValues.length - 1)],
    );
  }

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <GameButton
        title="테마 변경"
        placement="top"
        onClick={handleChangeBackground}
      >
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
