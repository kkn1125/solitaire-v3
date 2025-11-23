import { useSolitaireStore } from "@/store/useSolitaireStore";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";
import GameFooter from "../organism/GameFooter";
import GameHeader from "../organism/GameHeader";
import GameMain from "../organism/GameMain";
import GameBoard from "../template/GameBoard";

interface GameSolitaireProps {}
const GameSolitaire: React.FC<GameSolitaireProps> = () => {
  const resizeInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameSetting = useSolitaireStore((state) => state.gameSetting);
  const clearGame = useSolitaireStore((state) => state.clearGame);
  const isReady = useSolitaireStore((state) => state.isReady);
  const clickCard = useSolitaireStore((state) => state.actions.clickCard);
  const reRender = useSolitaireStore((state) => state.actions.reRender);

  useEffect(() => {
    gameSetting();

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!("cardId" in (target.dataset ?? {}))) return;
      const cardId = target.dataset.cardId;
      if (!cardId) return;
      clickCard(cardId);
    }
    window.addEventListener("click", handleClick);

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
      clearGame();
      window.removeEventListener("click", handleClick);
      windowObserver.disconnect();
    };
  }, [clearGame, clickCard, gameSetting, reRender]);

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

      <Stack height="100%" gap={10}>
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
