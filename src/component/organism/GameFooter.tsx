import { DialogContext } from "@/context/DialogContext";
import { SoundEffectContext } from "@/context/SoundEffectContext";
import type { SoundEffectContextValue } from "@/hook/useSoundEffect";
import { useCoreStore } from "@/store/useCoreStore";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import { Button, Divider, Paper, Stack } from "@mui/material";
import { useContext, useEffectEvent, type Context } from "react";
import {
  FaLightbulb,
  FaPause,
  FaReply,
  FaRotateLeft,
  FaSquareCheck,
} from "react-icons/fa6";
import { useShallow } from "zustand/shallow";
import GameButton from "../atom/GameButton";

interface GameFooterProps {}
const GameFooter: React.FC<GameFooterProps> = () => {
  const isWaiting = useSolitaireStore(useShallow((state) => state.isWaiting));
  const waiting = useSolitaireStore((state) => state.actions.waiting);
  const unWaiting = useSolitaireStore((state) => state.actions.unWaiting);
  const gamePause = useCoreStore((state) => state.actions.gamePause);
  const gameResume = useCoreStore((state) => state.actions.gameResume);
  const gameSetting = useSolitaireStore(
    useShallow((state) => state.gameSetting),
  );
  const resetInfo = useCoreStore(
    useShallow((state) => state.actions.resetInfo),
  );
  const { setDialogOpen } = useContext(DialogContext);
  const setIsReady = useSolitaireStore(useShallow((state) => state.setIsReady));
  const { actions } = useContext<SoundEffectContextValue>(
    SoundEffectContext as unknown as Context<SoundEffectContextValue>,
  );

  const autoClear = useSolitaireStore(
    useShallow((state) => state.actions.autoClear),
  );
  const isAutoClearable = useSolitaireStore(
    useShallow((state) => state.isAutoClearable),
  );
  const handleAutoClear = useEffectEvent(() => {
    autoClear();
  });

  function handleNoticeReady() {
    alert("현재 준비중인 기능입니다.");
  }

  function handleWaiting() {
    if (isWaiting) {
      unWaiting();
      gameResume();
    } else {
      waiting();
      gamePause();
    }
  }

  function handleNewGame() {
    setDialogOpen(true, {
      action: () => {
        setIsReady(false);
        setTimeout(() => {
          actions.playShuffleSound();
        }, 300);
        gameSetting();
        resetInfo();
      },
    });
  }

  return (
    <Stack justifyContent="space-between" gap={1}>
      {isAutoClearable && (
        <Button variant="contained" color="info" onClick={handleAutoClear}>
          <Stack
            gap={0.5}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <FaSquareCheck /> Auto Clear
          </Stack>
        </Button>
      )}
      <Paper
        variant="outlined"
        sx={(theme) => ({
          borderRadius: 5,
          p: 3,
          zIndex: 10e2,
          backgroundColor:
            theme.palette.mode === "dark" ? "grey.800" : "grey.100",
          borderColor: theme.palette.mode === "dark" ? "grey.700" : "grey.300",
        })}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <GameButton title="게임 중지" placement="top" onClick={handleWaiting}>
            <FaPause />
          </GameButton>
          <Divider
            orientation="vertical"
            flexItem
            sx={(theme) => ({
              borderColor:
                theme.palette.mode === "dark" ? "grey.700" : "grey.300",
            })}
          />
          <GameButton
            title="힌트"
            placement="top"
            onClick={handleNoticeReady}
            disabled={isWaiting || true}
          >
            <FaLightbulb />
          </GameButton>
          <Divider
            orientation="vertical"
            flexItem
            sx={(theme) => ({
              borderColor:
                theme.palette.mode === "dark" ? "grey.700" : "grey.300",
            })}
          />
          <GameButton
            title="되돌리기"
            placement="top"
            onClick={handleNoticeReady}
            disabled={isWaiting || true}
          >
            <FaReply />
          </GameButton>
          <Divider
            orientation="vertical"
            flexItem
            sx={(theme) => ({
              borderColor:
                theme.palette.mode === "dark" ? "grey.700" : "grey.300",
            })}
          />
          <GameButton title="새 게임" placement="top" onClick={handleNewGame}>
            <FaRotateLeft />
          </GameButton>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default GameFooter;
