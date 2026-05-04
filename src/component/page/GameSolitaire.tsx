import { SoundEffectContext } from "@/context/SoundEffectContext";
import type { SoundEffectContextValue } from "@/hook/useSoundEffect";
import { useWindowSize } from "@/hook/useWindowSize";
import { useCoreStore } from "@/store/useCoreStore";
import { useSolitaireStore } from "@/store/useSolitaireStore";
import {
  Backdrop,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  type Context,
} from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import GameFooter from "../organism/GameFooter";
import GameHeader from "../organism/GameHeader";
import GameMain from "../organism/GameMain";
import GameBoard from "../template/GameBoard";

interface GameSolitaireProps {}
const GameSolitaire: React.FC<GameSolitaireProps> = () => {
  const { layoutGap } = useWindowSize();
  const resizeInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReady = useSolitaireStore(useShallow((state) => state.isReady));
  const navigate = useNavigate();
  const useTempSlot = useCoreStore(
    useShallow((state) => state.settings.useTempSlot),
  );
  const clearGameState = useCoreStore(
    useShallow((state) => state.actions.clearGameState),
  );
  const updateMoved = useCoreStore(
    useShallow((state) => state.actions.updateMoved),
  );
  const gameSetting = useSolitaireStore(
    useShallow((state) => state.gameSetting),
  );
  const setGameUseTempSlot = useSolitaireStore(
    useShallow((state) => state.setUseTempSlot),
  );
  const clickCard = useSolitaireStore(
    useShallow((state) => state.actions.clickCard),
  );
  const reRender = useSolitaireStore(
    useShallow((state) => state.actions.reRender),
  );
  const gameStart = useCoreStore(
    useShallow((state) => state.actions.gameStart),
  );
  const gameEnd = useCoreStore(useShallow((state) => state.actions.gameEnd));
  const { actions } = useContext<SoundEffectContextValue>(
    SoundEffectContext as unknown as Context<SoundEffectContextValue>,
  );

  const handleClick = useEffectEvent((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!("cardId" in (target.dataset ?? {}))) return;
    const cardId = target.dataset.cardId;
    const isEmpty = target.dataset.empty;
    if (!cardId) return;
    if (isEmpty) return;
    const result = clickCard(cardId);
    if (result.ok) {
      updateMoved();
      if (result.kind === "draw") {
        actions.playCardDraw();
      } else {
        actions.playCardMove();
      }
    }
  });

  const handleSoundOff = useEffectEvent(() => {
    gameEnd();
    clearGameState();
    actions.soundOff();
  });

  useEffect(() => {
    if (isReady) {
      gameStart();
    }

    return () => {
      gameEnd();
    };
  }, [gameEnd, gameStart, isReady]);

  useEffect(() => {
    return () => {
      clearGameState();
    };
  }, [clearGameState]);

  useEffect(() => {
    setGameUseTempSlot(useTempSlot);
  }, [useTempSlot]);

  useEffect(() => {
    gameSetting();

    function handleRedirectOnline() {
      navigate("/");
    }

    function handleRedirectOffline() {
      navigate("/offline");
    }

    window.addEventListener("beforeunload", handleSoundOff);
    window.addEventListener("click", handleClick);
    window.addEventListener("online", handleRedirectOnline);
    window.addEventListener("offline", handleRedirectOffline);

    const windowObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        clearTimeout(resizeInterval.current!);

        resizeInterval.current = setTimeout(() => {
          reRender();
        }, 200);
      }
    });
    windowObserver.observe(document.body);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("online", handleRedirectOnline);
      window.removeEventListener("offline", handleRedirectOffline);
      window.removeEventListener("beforeunload", handleSoundOff);
      windowObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearGameState, gameEnd, gameSetting, navigate, reRender, updateMoved]);

  return (
    <GameBoard>
      {!isReady && (
        <Backdrop
          open={!isReady}
          component={Box}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            zIndex: 100,
            color: "white",
          }}
        >
          <Stack gap={2} alignItems="center">
            <CircularProgress color="inherit" size={100} />
            <Typography variant="h6" color="inherit">
              Loading...
            </Typography>
          </Stack>
        </Backdrop>
      )}

      <Stack height="100%" gap={layoutGap}>
        {/* Header */}
        <GameHeader />

        {/* Body */}
        <GameMain />
        {/* <Button onClick={() => reRender()}>rerender</Button> */}
        {/* Footer */}
        <GameFooter />
      </Stack>
    </GameBoard>
  );
};

export default GameSolitaire;
